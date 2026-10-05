from functools import partial

from fastapi import FastAPI
from fastapi.telemetry import TelemetryConfig

from . import projects
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


def create_app(settings: StartupSettings) -> FastAPI:
    locate_media_tools(settings.ffmpeg_dir, settings.search_path)
    data_folder = open_data_folder(settings.data_dir)
    database = open_database(data_folder.database_file)
    app = FastAPI(
        title="Clipper",
        telemetry=TELEMETRY_OFF,
        docs_url=None,
        redoc_url=None,
        openapi_url=None,
    )
    app.state.projects = projects.ProjectsDependencies(
        repository=projects.ProjectRepository(database),
        data_folder=data_folder,
        read_disk_space=partial(read_disk_space, data_folder.root, settings.reported_free_bytes),
    )
    handle_app_errors(app)
    app.include_router(projects.router)
    app.add_api_route("/api/health", report_health, methods=["GET"])
    return app


async def report_health() -> dict[str, str]:
    return {"status": "ok"}
