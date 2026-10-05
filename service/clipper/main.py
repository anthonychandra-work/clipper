from fastapi import FastAPI
from fastapi.telemetry import TelemetryConfig

TELEMETRY_OFF: TelemetryConfig = {
    "tracing": False,
    "metrics": False,
    "logs": False,
    "auto_configure": False,
}


def create_app() -> FastAPI:
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
