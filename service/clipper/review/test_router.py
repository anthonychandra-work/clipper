from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from ..main import create_app
from ..settings import StartupSettings

LINK_DRAFT = {
    "sourceKind": "link",
    "link": "https://video.example/talk",
    "platforms": ["reels"],
}
PREVIEW_BYTES = bytes(range(256)) * 40
NO_PREVIEW = "This project has no preview copy on this Mac."


@pytest.fixture
def client(tmp_path: Path) -> TestClient:
    return TestClient(create_app(StartupSettings(data_dir=tmp_path / "data")))


def add_project(client: TestClient) -> str:
    project_id: str = client.post("/api/projects", json=LINK_DRAFT).json()["id"]
    return project_id


def add_project_with_preview(client: TestClient, tmp_path: Path) -> str:
    project_id = add_project(client)
    project_dir = tmp_path / "data" / "projects" / project_id
    project_dir.mkdir()
    (project_dir / "preview.mp4").write_bytes(PREVIEW_BYTES)
    return project_id


def test_the_preview_copy_is_answered_whole_as_an_mp4_video(
    client: TestClient, tmp_path: Path
) -> None:
    project_id = add_project_with_preview(client, tmp_path)

    response = client.get(f"/api/projects/{project_id}/preview")

    assert response.status_code == 200
    assert response.headers["content-type"] == "video/mp4"
    assert response.headers["accept-ranges"] == "bytes"
    assert response.content == PREVIEW_BYTES


def test_a_byte_range_is_answered_206_with_that_range_and_the_whole_size(
    client: TestClient, tmp_path: Path
) -> None:
    project_id = add_project_with_preview(client, tmp_path)

    response = client.get(f"/api/projects/{project_id}/preview", headers={"Range": "bytes=300-811"})

    assert response.status_code == 206
    assert response.headers["content-range"] == f"bytes 300-811/{len(PREVIEW_BYTES)}"
    assert response.headers["content-type"] == "video/mp4"
    assert response.content == PREVIEW_BYTES[300:812]


def test_a_range_left_open_runs_to_the_end_of_the_file(client: TestClient, tmp_path: Path) -> None:
    project_id = add_project_with_preview(client, tmp_path)
    size = len(PREVIEW_BYTES)

    response = client.get(f"/api/projects/{project_id}/preview", headers={"Range": "bytes=10000-"})

    assert response.status_code == 206
    assert response.headers["content-range"] == f"bytes 10000-{size - 1}/{size}"
    assert response.content == PREVIEW_BYTES[10000:]


def test_a_range_past_the_end_is_answered_416(client: TestClient, tmp_path: Path) -> None:
    project_id = add_project_with_preview(client, tmp_path)
    past_the_end = f"bytes={len(PREVIEW_BYTES) + 10}-{len(PREVIEW_BYTES) + 20}"

    response = client.get(f"/api/projects/{project_id}/preview", headers={"Range": past_the_end})

    assert response.status_code == 416
    assert response.headers["content-range"] == f"bytes */{len(PREVIEW_BYTES)}"


def test_an_unknown_project_answers_with_the_404_of_the_other_project_addresses(
    client: TestClient,
) -> None:
    response = client.get("/api/projects/missing/preview")

    assert response.status_code == 404
    assert response.json() == client.get("/api/projects/missing").json()
    assert response.json() == {
        "problem": {"section": None, "message": "This project does not exist."}
    }


def test_a_project_without_a_preview_copy_answers_404_and_says_so(client: TestClient) -> None:
    project_id = add_project(client)

    response = client.get(f"/api/projects/{project_id}/preview")

    assert response.status_code == 404
    assert response.json() == {"problem": {"section": None, "message": NO_PREVIEW}}
