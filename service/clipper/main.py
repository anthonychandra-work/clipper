from collections.abc import AsyncIterator, Callable, Sequence
from contextlib import AbstractAsyncContextManager, asynccontextmanager
from functools import partial

from fastapi import FastAPI
from fastapi.concurrency import run_in_threadpool
from fastapi.telemetry import TelemetryConfig

from . import pipeline, projects, selection, settings
from .fetching import FetchStage
from .media import locate_media_tools
from .problems import handle_app_errors
from .settings import StartupSettings
from .storage import open_data_folder, open_database, read_disk_space
from .transcription import DownloadPlanner, ModelStage, TranscribeStage

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
    preferences = settings.PreferenceStore(database)
    planner = DownloadPlanner(preferences, data_folder, queue)
    stages: list[pipeline.PipelineStage] = [
        FetchStage(repository, data_folder, media_tools),
        ModelStage(preferences, data_folder, startup.model_source),
        TranscribeStage(preferences, data_folder, media_tools),
    ]
    worker = pipeline.QueueWorker(repository, queue, stages, planner.list_checks())
    queued = pipeline.PipelineDependencies(repository, queue, worker)
    app = start_quiet_app(partial(run_queue_with_app, queued, stages))
    app.state.pipeline = queued
    app.state.projects = projects.ProjectsDependencies(
        repository=repository,
        data_folder=data_folder,
        read_disk_space=measure_disk,
        stop_processing=worker.stop_project,
    )
    app.state.settings = settings.SettingsDependencies(
        store=preferences,
        api_key_store=settings.ApiKeyStore(startup.key_file),
        read_disk_space=measure_disk,
        web_port=startup.web_port,
    )
    app.state.selection = selection.SelectionDependencies(
        repository=repository, store=selection.SelectionStore(database)
    )
    handle_app_errors(app)
    for feature in (projects, pipeline, settings, selection):
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
    queued: pipeline.PipelineDependencies, stages: Sequence[pipeline.PipelineStage], app: FastAPI
) -> AsyncIterator[None]:
    pipeline.recover_interrupted(queued.queue)
    pipeline.requeue_rested(queued.repository, queued.queue, stages)
    queued.worker.start()
    try:
        yield
    finally:
        await run_in_threadpool(queued.worker.stop)


async def report_health() -> dict[str, str]:
    return {"status": "ok"}
