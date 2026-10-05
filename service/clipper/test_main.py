from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from .main import create_app


@pytest.fixture
def client() -> Iterator[TestClient]:
    with TestClient(create_app()) as test_client:
        yield test_client


def test_health_answers_once_the_service_is_up(client: TestClient) -> None:
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.parametrize("address", ["/docs", "/redoc", "/openapi.json"])
def test_no_documentation_page_is_served(client: TestClient, address: str) -> None:
    assert client.get(address).status_code == 404


@pytest.mark.parametrize("switch", ["tracing", "metrics", "logs", "auto_configure"])
def test_fastapi_starts_with_its_telemetry_switched_off(switch: str) -> None:
    app = create_app()

    assert app._telemetry.get(switch) is False
