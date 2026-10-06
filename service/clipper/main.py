from collections.abc import AsyncIterator, Callable, Sequence
from contextlib import AbstractAsyncContextManager, asynccontextmanager
from dataclasses import dataclass
from functools import partial
from pathlib import Path

from fastapi import FastAPI
from fastapi.concurrency import run_in_threadpool
from fastapi.telemetry import TelemetryConfig

from . import pipeline, projects, review, selection, settings
from .fetching import FetchStage
from .media import locate_media_tools
from .problems import handle_app_errors
from .settings import StartupSettings
from .storage import Database, DataFolder, open_data_folder, open_database, read_disk_space
from .transcription import DownloadPlanner, ModelStage, TranscribeStage

TELEMETRY_OFF: TelemetryConfig = {
    "tracing": False,
    "metrics": False,
    "logs": False,
    "auto_configure": False,
}


@dataclass(frozen=True)
class Stores:
    repository: projects.ProjectRepository
    queue: projects.ProjectQueue
    preferences: settings.PreferenceStore
    api_keys: settings.ApiKeyStore
    selection_store: selection.SelectionStore


def create_app(startup: StartupSettings) -> FastAPI:
    media_tools = locate_media_tools(startup.ffmpeg_dir, startup.search_path)
    data_folder = open_data_folder(startup.data_dir)
    stores = open_stores(open_database(data_folder.database_file), startup.key_file)
    measure_disk = partial(read_disk_space, data_folder.root, startup.reported_free_bytes)
    planner = DownloadPlanner(stores.preferences, data_folder, stores.queue)
    stages: list[pipeline.PipelineStage] = [
        FetchStage(stores.repository, data_folder, media_tools),
        ModelStage(stores.preferences, data_folder, startup.model_source),
        TranscribeStage(stores.preferences, data_folder, media_tools),
        *list_selection_stages(stores, data_folder, startup.anthropic_source),
    ]
    worker = pipeline.QueueWorker(stores.repository, stores.queue, stages, planner.list_checks())
    queued = pipeline.PipelineDependencies(stores.repository, stores.queue, worker)
    app = start_quiet_app(partial(run_queue_with_app, queued, stages))
    app.state.pipeline = queued
    app.state.projects = projects.ProjectsDependencies(
        repository=stores.repository,
        data_folder=data_folder,
        read_disk_space=measure_disk,
        stop_processing=worker.stop_project,
    )
    app.state.settings = settings.SettingsDependencies(
        store=stores.preferences,
        api_key_store=stores.api_keys,
        read_disk_space=measure_disk,
        web_port=startup.web_port,
    )
    app.state.selection = selection.SelectionDependencies(
        repository=stores.repository, store=stores.selection_store
    )
    app.state.review = review.ReviewDependencies(
        repository=stores.repository, data_folder=data_folder
    )
    handle_app_errors(app)
    for feature in (projects, pipeline, settings, selection, review):
        app.include_router(feature.router)
    app.add_api_route("/api/health", report_health, methods=["GET"])
    return app


def open_stores(database: Database, key_file: Path) -> Stores:
    return Stores(
        repository=projects.ProjectRepository(database),
        queue=projects.ProjectQueue(database),
        preferences=settings.PreferenceStore(database),
        api_keys=settings.ApiKeyStore(key_file),
        selection_store=selection.SelectionStore(database),
    )


def list_selection_stages(
    stores: Stores, data_folder: DataFolder, anthropic_source: str
) -> list[pipeline.PipelineStage]:
    dependencies = selection.StageDependencies(
        keys=stores.api_keys,
        preferences=stores.preferences,
        data_folder=data_folder,
        queue=stores.queue,
        store=stores.selection_store,
        anthropic_source=anthropic_source,
    )
    return [selection.ScoreStage(dependencies), selection.CutStage(dependencies)]


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
