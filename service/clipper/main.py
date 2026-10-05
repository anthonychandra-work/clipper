from collections.abc import AsyncIterator, Callable
from contextlib import AbstractAsyncContextManager, asynccontextmanager
from functools import partial

from fastapi import FastAPI
from fastapi.concurrency import run_in_threadpool
from fastapi.telemetry import TelemetryConfig

from . import pipeline, projects, settings
from .fetching import FetchStage
from .media import locate_media_tools
from .problems import handle_app_errors
from .settings import StartupSettings
from .storage import open_data_folder, open_database, read_disk_space

TELEMETRY_OFF: TelemetryConfig = {
    "tracing": False,
    "metrics": False,
    "logs": False,
    "auto_configure": False,
}


def create_app(startup: StartupSettings) -> FastAPI:
    media_tools = locate_media_tools(startup.ffmpeg_dir, startup.search_path)
    data_folder = open_data_folder(startup.data_dir)
    database = open_database(data_folder.database_file)
    measure_disk = partial(read_disk_space, data_folder.root, startup.reported_free_bytes)
    repository = projects.ProjectRepository(database)
    queue = projects.ProjectQueue(database)
    fetch_stage = FetchStage(repository, data_folder, media_tools)
    worker = pipeline.QueueWorker(repository, queue, [fetch_stage])
    app = start_quiet_app(partial(run_queue_with_app, worker, queue))
    app.state.pipeline = pipeline.PipelineDependencies(repository, queue, worker)
    app.state.projects = projects.ProjectsDependencies(
        repository=repository,
        data_folder=data_folder,
        read_disk_space=measure_disk,
        stop_processing=worker.stop_project,
    )
    app.state.settings = settings.SettingsDependencies(
        store=settings.PreferenceStore(database),
        read_disk_space=measure_disk,
        web_port=startup.web_port,
    )
    handle_app_errors(app)
    for feature in (projects, pipeline, settings):
        app.include_router(feature.router)
    app.add_api_route("/api/health", report_health, methods=["GET"])
    return app


def start_quiet_app(lifespan: Callable[[FastAPI], AbstractAsyncContextManager[None]]) -> FastAPI:
    return FastAPI(
        title="Clipper",
        telemetry=TELEMETRY_OFF,
        docs_url=None,
        redoc_url=None,
        openapi_url=None,
        lifespan=lifespan,
    )


@asynccontextmanager
async def run_queue_with_app(
    worker: pipeline.QueueWorker, queue: projects.ProjectQueue, app: FastAPI
) -> AsyncIterator[None]:
    pipeline.recover_interrupted(queue)
    worker.start()
    try:
        yield
    finally:
        await run_in_threadpool(worker.stop)


async def report_health() -> dict[str, str]:
    return {"status": "ok"}
