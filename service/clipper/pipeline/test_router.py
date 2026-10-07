import time
from collections.abc import Iterator
from pathlib import Path

import httpx2
import pytest
from fastapi.testclient import TestClient

from ..main import create_app
from ..projects import ProjectResponse, StepState
from ..settings import StartupSettings
from ..storage import BYTES_PER_GB

WAIT_SECONDS = 60
DOWNLOAD_FAILED = (
    "The video could not be downloaded. Check the link and your connection, then retry."
)


@pytest.fixture
def client(tmp_path: Path) -> Iterator[TestClient]:
    settings = StartupSettings(data_dir=tmp_path / "data", reported_free_bytes=50 * BYTES_PER_GB)
    with TestClient(create_app(settings)) as running:
        yield running


def create_link_project(client: TestClient, link: str) -> str:
    draft = {"sourceKind": "link", "link": link, "platforms": ["reels"]}
    project_id: str = client.post("/api/projects", json=draft).json()["id"]
    return project_id


def wait_for_status(client: TestClient, project_id: str, status: str) -> dict[str, object]:
    deadline = time.monotonic() + WAIT_SECONDS
    while True:
        project: dict[str, object] = client.get(f"/api/projects/{project_id}").json()
        if project["status"] == status:
            return project
        assert time.monotonic() < deadline, f"The project did not become {status}: {project}"
        time.sleep(0.05)


def wait_for_the_fetch(client: TestClient, project_id: str) -> ProjectResponse:
    deadline = time.monotonic() + WAIT_SECONDS
    while True:
        answer = client.get(f"/api/projects/{project_id}").json()
        project = ProjectResponse.model_validate(answer)
        if project.steps[0].state is StepState.DONE:
            return project
        assert time.monotonic() < deadline, f"The fetch did not finish: {project}"
        time.sleep(0.05)


def test_stop_during_a_fetch_leaves_the_project_stopped_and_resume_finishes_it(
    client: TestClient, fixture_server: str
) -> None:
    project_id = create_link_project(client, f"{fixture_server}/slow/talk.mp4")
    wait_for_status(client, project_id, "processing")
    time.sleep(1)
    asked_at = time.monotonic()

    stopped = client.post(f"/api/projects/{project_id}/stop")
    seconds_to_stop = time.monotonic() - asked_at
    resumed = client.post(f"/api/projects/{project_id}/resume")
    fetched = wait_for_the_fetch(client, project_id)

    assert seconds_to_stop < 2
    assert stopped.json()["status"] == "stopped"
    assert stopped.json()["halt"] == {
        "reason": "Stopped at “Fetching video”. The stages before it are kept.",
        "opensSettings": False,
    }
    assert resumed.json()["halt"] is None
    assert fetched.title == "talk"


def test_a_link_that_answers_not_found_fails_with_a_reason_and_retry_finishes_it_once_repaired(
    client: TestClient, fixture_server: str
) -> None:
    project_id = create_link_project(client, f"{fixture_server}/missing-until-repaired/talk.mp4")

    failed = wait_for_status(client, project_id, "failed")
    httpx2.get(f"{fixture_server}/repair")
    retried = client.post(f"/api/projects/{project_id}/retry")
    fetched = wait_for_the_fetch(client, project_id)

    assert failed["halt"] == {"reason": DOWNLOAD_FAILED, "opensSettings": False}
    assert retried.status_code == 200
    assert retried.json()["halt"] is None
    assert fetched.steps[0].percent == 100


def test_an_upload_that_is_not_a_video_fails_with_what_to_do(client: TestClient) -> None:
    draft = {
        "sourceKind": "file",
        "fileName": "notes.mp4",
        "fileSizeBytes": 9,
        "platforms": ["reels"],
    }
    project_id: str = client.post("/api/projects", json=draft).json()["id"]

    client.put(f"/api/projects/{project_id}/upload", params={"offset": 0}, content=b"not video")

    failed = wait_for_status(client, project_id, "failed")
    assert failed["halt"] == {
        "reason": "This file is not a video Clipper can read. "
        "Delete the project and try another file.",
        "opensSettings": False,
    }


def test_deleting_a_project_while_it_is_fetched_stops_it_and_leaves_no_folder(
    client: TestClient, fixture_server: str, tmp_path: Path
) -> None:
    project_id = create_link_project(client, f"{fixture_server}/slow/talk.mp4")
    wait_for_status(client, project_id, "processing")
    time.sleep(1)

    deleted = client.delete(f"/api/projects/{project_id}")
    time.sleep(1)

    assert deleted.status_code == 204
    assert not (tmp_path / "data" / "projects" / project_id).exists()
    assert client.get("/api/projects").json()["projects"] == []


@pytest.mark.parametrize("action", ["stop", "resume", "retry"])
def test_an_action_the_state_of_the_project_does_not_allow_answers_409(
    client: TestClient, action: str
) -> None:
    draft = {
        "sourceKind": "file",
        "fileName": "talk.mp4",
        "fileSizeBytes": 9,
        "platforms": ["reels"],
    }
    project_id: str = client.post("/api/projects", json=draft).json()["id"]

    response = client.post(f"/api/projects/{project_id}/{action}")

    assert response.status_code == 409
    assert response.json()["problem"]["message"] != ""


@pytest.mark.parametrize("action", ["stop", "resume", "retry"])
def test_an_action_on_an_unknown_project_answers_404(client: TestClient, action: str) -> None:
    assert client.post(f"/api/projects/missing/{action}").status_code == 404
