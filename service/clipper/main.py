from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from functools import partial

from fastapi import FastAPI
from fastapi.concurrency import run_in_threadpool
from fastapi.telemetry import TelemetryConfig

from . import projects
from .fetching import FetchStage
from .media import locate_media_tools
from .pipeline import QueueWorker, recover_interrupted
from .problems import handle_app_errors
from .settings import StartupSettings
from .storage import open_data_folder, open_database, read_disk_space

TELEMETRY_OFF: TelemetryConfig = {
    "tracing": False,
    "metrics": False,
    "logs": False,
    "auto_configure": False,
}


def create_app(settings: StartupSettings) -> FastAPI:
    media_tools = locate_media_tools(settings.ffmpeg_dir, settings.search_path)
    data_folder = open_data_folder(settings.data_dir)
    database = open_database(data_folder.database_file)
    repository = projects.ProjectRepository(database)
    queue = projects.ProjectQueue(database)
    worker = QueueWorker(repository, queue, [FetchStage(repository, data_folder, media_tools)])
    app = FastAPI(
        title="Clipper",
        telemetry=TELEMETRY_OFF,
        docs_url=None,
        redoc_url=None,
        openapi_url=None,
        lifespan=partial(run_queue_with_app, worker, queue),
    )
    app.state.projects = projects.ProjectsDependencies(
        repository=repository,
        data_folder=data_folder,
        read_disk_space=partial(read_disk_space, data_folder.root, settings.reported_free_bytes),
    )
    handle_app_errors(app)
    app.include_router(projects.router)
    app.add_api_route("/api/health", report_health, methods=["GET"])
    return app


@asynccontextmanager
async def run_queue_with_app(
    worker: QueueWorker, queue: projects.ProjectQueue, app: FastAPI
) -> AsyncIterator[None]:
    recover_interrupted(queue)
    worker.start()
    try:
        yield
    finally:
        await run_in_threadpool(worker.stop)


async def report_health() -> dict[str, str]:
    return {"status": "ok"}
