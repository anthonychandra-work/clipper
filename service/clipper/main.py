from collections.abc import AsyncIterator, Callable, Sequence
from contextlib import AbstractAsyncContextManager, asynccontextmanager
from dataclasses import dataclass
from functools import partial
from pathlib import Path
from typing import Self

from fastapi import FastAPI
from fastapi.concurrency import run_in_threadpool
from fastapi.telemetry import TelemetryConfig

from . import learning, pipeline, projects, rendering, review, selection, settings
from .fetching import FetchStage
from .media import MediaTools, locate_media_tools
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
    review_store: review.ReviewStore
    render_store: rendering.RenderStore
    history: learning.HistoryStore

    @classmethod
    def open(cls, database: Database, key_file: Path) -> Self:
        return cls(
            repository=projects.ProjectRepository(database),
            queue=projects.ProjectQueue(database),
            preferences=settings.PreferenceStore(database),
            api_keys=settings.ApiKeyStore(key_file),
            selection_store=selection.SelectionStore(database),
            review_store=review.ReviewStore(database),
            render_store=rendering.RenderStore(database),
            history=learning.HistoryStore(database),
        )


@dataclass(frozen=True)
class Grounds:
    startup: StartupSettings
    data_folder: DataFolder
    media_tools: MediaTools
    stores: Stores

    @property
    def review_sources(self) -> review.ReviewSources:
        stores = self.stores
        return review.ReviewSources(self.data_folder, stores.selection_store, stores.review_store)


@dataclass(frozen=True)
class Workers:
    stages: Sequence[pipeline.PipelineStage]
    queue: pipeline.QueueWorker
    renders: rendering.RenderWorker
    render_store: rendering.RenderStore

    def start(self) -> None:
        self.queue.start()
        self.renders.start()

    def stop(self) -> None:
        self.renders.stop()
        self.queue.stop()

    def stop_project(self, project_id: str) -> None:
        self.queue.stop_project(project_id)
        self.render_store.cancel_waiting(project_id)
        self.renders.stop_project(project_id)


def create_app(startup: StartupSettings) -> FastAPI:
    media_tools = locate_media_tools(startup.ffmpeg_dir, startup.search_path)
    data_folder = open_data_folder(startup.data_dir)
    stores = Stores.open(open_database(data_folder.database_file), startup.key_file)
    grounds = Grounds(startup, data_folder, media_tools, stores)
    workers = make_workers(grounds)
    app = start_quiet_app(partial(run_workers_with_app, grounds, workers))
    share_dependencies(app, grounds, workers)
    handle_app_errors(app)
    for feature in (projects, pipeline, settings, selection, review, rendering):
        app.include_router(feature.router)
    app.add_api_route("/api/health", report_health, methods=["GET"])
    return app


def make_workers(grounds: Grounds) -> Workers:
    startup, stores = grounds.startup, grounds.stores
    data_folder, media_tools = grounds.data_folder, grounds.media_tools
    planner = DownloadPlanner(stores.preferences, data_folder, stores.queue)
    stages: list[pipeline.PipelineStage] = [
        FetchStage(stores.repository, data_folder, media_tools),
        ModelStage(stores.preferences, data_folder, startup.model_source),
        TranscribeStage(stores.preferences, data_folder, media_tools),
        *list_selection_stages(grounds),
    ]
    render_work = rendering.RenderWork(grounds.review_sources, media_tools)
    return Workers(
        stages=stages,
        queue=pipeline.QueueWorker(stores.repository, stores.queue, stages, planner.list_checks()),
        renders=rendering.RenderWorker(
            stores.render_store,
            stores.repository,
            partial(rendering.render_clip, work=render_work),
        ),
        render_store=stores.render_store,
    )


def list_selection_stages(grounds: Grounds) -> list[pipeline.PipelineStage]:
    stores = grounds.stores
    filmstrip = review.FilmstripMaker(grounds.data_folder, grounds.media_tools)
    dependencies = selection.StageDependencies(
        keys=stores.api_keys,
        preferences=stores.preferences,
        data_folder=grounds.data_folder,
        queue=stores.queue,
        store=stores.selection_store,
        history=stores.history,
        anthropic_source=grounds.startup.anthropic_source,
        work_on_chosen_clips=filmstrip.make_frames,
    )
    return [selection.ScoreStage(dependencies), selection.CutStage(dependencies)]


def share_dependencies(app: FastAPI, grounds: Grounds, workers: Workers) -> None:
    startup, stores, data_folder = grounds.startup, grounds.stores, grounds.data_folder
    measure_disk = partial(read_disk_space, data_folder.root, startup.reported_free_bytes)
    review_sources = grounds.review_sources
    app.state.pipeline = pipeline.PipelineDependencies(
        stores.repository, stores.queue, workers.queue
    )
    app.state.projects = projects.ProjectsDependencies(
        repository=stores.repository,
        data_folder=data_folder,
        read_disk_space=measure_disk,
        stop_processing=workers.stop_project,
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
        repository=stores.repository, sources=review_sources
    )
    app.state.export = rendering.ExportDependencies(
        repository=stores.repository,
        sources=rendering.ExportSources(review_sources, stores.render_store),
        stop_render=workers.renders.stop_project,
    )


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
async def run_workers_with_app(
    grounds: Grounds, workers: Workers, app: FastAPI
) -> AsyncIterator[None]:
    stores = grounds.stores
    pipeline.recover_interrupted(stores.queue)
    pipeline.requeue_rested(stores.repository, stores.queue, workers.stages)
    stores.render_store.put_back_interrupted()
    workers.start()
    try:
        yield
    finally:
        await run_in_threadpool(workers.stop)


async def report_health() -> dict[str, str]:
    return {"status": "ok"}
