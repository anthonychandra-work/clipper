import uvicorn

from .main import create_app
from .settings import StartupSettings

LOOPBACK_HOST = "127.0.0.1"


def serve() -> None:
    settings = StartupSettings()
    uvicorn.run(create_app(), host=LOOPBACK_HOST, port=settings.service_port, log_level="warning")


if __name__ == "__main__":
    serve()
