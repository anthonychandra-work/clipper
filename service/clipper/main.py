from fastapi import FastAPI
from fastapi.telemetry import TelemetryConfig

from .media import locate_media_tools
from .settings import StartupSettings
from .storage import open_data_folder, open_database

TELEMETRY_OFF: TelemetryConfig = {
    "tracing": False,
    "metrics": False,
    "logs": False,
    "auto_configure": False,
}


def create_app(settings: StartupSettings) -> FastAPI:
    locate_media_tools(settings.ffmpeg_dir, settings.search_path)
    data_folder = open_data_folder(settings.data_dir)
    open_database(data_folder.database_file)
    app = FastAPI(
        title="Clipper",
        telemetry=TELEMETRY_OFF,
        docs_url=None,
        redoc_url=None,
        openapi_url=None,
    )
    app.add_api_route("/api/health", report_health, methods=["GET"])
    return app


async def report_health() -> dict[str, str]:
    return {"status": "ok"}
