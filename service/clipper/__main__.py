import sys

import uvicorn
from fastapi import FastAPI

from .main import create_app
from .media import MediaToolsMissingError
from .settings import StartupSettings

LOOPBACK_HOST = "127.0.0.1"
EXIT_CANNOT_START = 1


def serve() -> None:
    settings = StartupSettings()
    app = create_app_or_exit(settings)
    uvicorn.run(app, host=LOOPBACK_HOST, port=settings.service_port, log_level="warning")


def create_app_or_exit(settings: StartupSettings) -> FastAPI:
    try:
        return create_app(settings)
    except MediaToolsMissingError as missing:
        sys.stderr.write(f"{missing}\n")
        raise SystemExit(EXIT_CANNOT_START) from None


if __name__ == "__main__":
    serve()
