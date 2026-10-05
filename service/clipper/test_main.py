from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from .main import create_app
from .media import MediaToolsMissingError
from .settings import StartupSettings


@pytest.fixture
def settings(tmp_path: Path) -> StartupSettings:
    return StartupSettings(data_dir=tmp_path / "data")


@pytest.fixture
def app(settings: StartupSettings) -> FastAPI:
    return create_app(settings)


@pytest.fixture
def client(app: FastAPI) -> Iterator[TestClient]:
    with TestClient(app) as test_client:
        yield test_client


def test_health_answers_once_the_service_is_up(client: TestClient) -> None:
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_starting_creates_the_data_folder_and_its_database(
    app: FastAPI, settings: StartupSettings
) -> None:
    assert (settings.data_dir / "clipper.sqlite3").is_file()


def test_starting_without_the_media_tools_fails_before_anything_is_created(tmp_path: Path) -> None:
    settings = StartupSettings(
        data_dir=tmp_path / "data", ffmpeg_dir=tmp_path / "no-tools", search_path=""
    )

    with pytest.raises(MediaToolsMissingError):
        create_app(settings)

    assert not settings.data_dir.exists()


@pytest.mark.parametrize("address", ["/docs", "/redoc", "/openapi.json"])
def test_no_documentation_page_is_served(client: TestClient, address: str) -> None:
    assert client.get(address).status_code == 404


@pytest.mark.parametrize("switch", ["tracing", "metrics", "logs", "auto_configure"])
def test_fastapi_starts_with_its_telemetry_switched_off(app: FastAPI, switch: str) -> None:
    assert app._telemetry.get(switch) is False
