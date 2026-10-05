from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from ..main import create_app
from ..settings import StartupSettings
from ..storage import BYTES_PER_GB, open_database
from .project import ProjectStatus, StepKind
from .project_queue import ProjectQueue

NO_KEY = "No Anthropic API key is saved. Add one in Settings, then retry."
DOWNLOAD_FAILED = (
    "The video could not be downloaded. Check the link and your connection, then retry."
)

LINK_DRAFT = {
    "sourceKind": "link",
    "link": "https://www.youtube.com/watch?v=abc123",
    "clipLength": "standard",
    "platforms": ["tiktok", "reels", "shorts"],
    "brief": "",
}
FILE_DRAFT = {
    "sourceKind": "file",
    "fileName": "talk.mp4",
    "fileSizeBytes": 3_000_000,
    "platforms": ["tiktok"],
}


def open_client_without_the_queue(tmp_path: Path, reported_free_gb: float) -> TestClient:
    settings = StartupSettings(
        data_dir=tmp_path / "data", reported_free_bytes=int(reported_free_gb * BYTES_PER_GB)
    )
    return TestClient(create_app(settings))


@pytest.fixture
def client(tmp_path: Path) -> TestClient:
    return open_client_without_the_queue(tmp_path, reported_free_gb=50)


def test_an_empty_library_lists_no_projects_and_the_free_space(client: TestClient) -> None:
    response = client.get("/api/projects")

    assert response.status_code == 200
    assert response.json() == {"projects": [], "freeDiskGb": 50.0}


def test_a_created_link_project_is_returned_in_its_json_form(client: TestClient) -> None:
    response = client.post("/api/projects", json=LINK_DRAFT)

    assert response.status_code == 201
    created = response.json()
    assert created["steps"][0] == {
        "kind": "fetch",
        "label": "Fetching video",
        "state": "pending",
        "percent": 0.0,
    }
    assert [step["label"] for step in created["steps"][1:]] == [
        "Transcribing on this Mac",
        "Scoring windows",
        "Cutting clips",
    ]
    del created["id"], created["steps"]
    assert created == {
        "title": "New video from link",
        "sourceKind": "link",
        "sourceLabel": "YouTube link",
        "durationSeconds": None,
        "status": "queued",
        "percent": 0.0,
        "halt": None,
        "upload": None,
        "candidateCount": 0,
    }


def test_a_project_carries_the_number_of_its_candidates(client: TestClient, tmp_path: Path) -> None:
    created = client.post("/api/projects", json=LINK_DRAFT).json()
    database = open_database(tmp_path / "data" / "clipper.sqlite3")

    with database.transaction() as connection:
        connection.execute("UPDATE projects SET candidate_count = 6 WHERE id = ?", [created["id"]])

    assert client.get(f"/api/projects/{created['id']}").json()["candidateCount"] == 6
    assert client.get("/api/projects").json()["projects"][0]["candidateCount"] == 6


def test_a_halt_gives_its_reason_and_whether_it_points_to_settings(
    client: TestClient, tmp_path: Path
) -> None:
    plain = client.post("/api/projects", json=LINK_DRAFT).json()
    marked = client.post("/api/projects", json=LINK_DRAFT).json()
    queue = ProjectQueue(open_database(tmp_path / "data" / "clipper.sqlite3"))

    queue.halt(plain["id"], ProjectStatus.FAILED, DOWNLOAD_FAILED)
    queue.halt(marked["id"], ProjectStatus.FAILED, NO_KEY, opens_settings=True)

    assert client.get(f"/api/projects/{plain['id']}").json()["halt"] == {
        "reason": DOWNLOAD_FAILED,
        "opensSettings": False,
    }
    assert client.get(f"/api/projects/{marked['id']}").json()["halt"] == {
        "reason": NO_KEY,
        "opensSettings": True,
    }
    listed = client.get("/api/projects").json()["projects"]
    assert [project["halt"]["opensSettings"] for project in listed] == [True, False]


def test_a_created_file_project_reports_its_upload(client: TestClient) -> None:
    created = client.post("/api/projects", json=FILE_DRAFT).json()

    assert created["status"] == "uploading"
    assert created["title"] == "talk.mp4"
    assert created["steps"][0]["label"] == "Uploading video"
    assert created["upload"] == {"fileName": "talk.mp4", "sizeBytes": 3_000_000, "receivedBytes": 0}


def test_projects_are_listed_newest_first(client: TestClient) -> None:
    first = client.post("/api/projects", json=LINK_DRAFT).json()
    second = client.post("/api/projects", json=FILE_DRAFT).json()

    listed = client.get("/api/projects").json()["projects"]

    assert [project["id"] for project in listed] == [second["id"], first["id"]]


def test_one_project_is_read_by_its_id(client: TestClient) -> None:
    created = client.post("/api/projects", json=LINK_DRAFT).json()

    response = client.get(f"/api/projects/{created['id']}")

    assert response.status_code == 200
    assert response.json() == created


def test_a_step_added_to_a_project_is_shown_under_its_own_label(
    client: TestClient, tmp_path: Path
) -> None:
    created = client.post("/api/projects", json=LINK_DRAFT).json()
    queue = ProjectQueue(open_database(tmp_path / "data" / "clipper.sqlite3"))

    queue.put_step_ahead(
        created["id"],
        kind=StepKind.MODEL,
        label="Downloading Whisper small",
        ahead_of=StepKind.TRANSCRIBE,
    )

    steps = client.get(f"/api/projects/{created['id']}").json()["steps"]
    assert [step["kind"] for step in steps] == ["fetch", "model", "transcribe", "score", "cut"]
    assert steps[1] == {
        "kind": "model",
        "label": "Downloading Whisper small",
        "state": "pending",
        "percent": 0.0,
    }
    assert steps[2]["label"] == "Transcribing on this Mac"


@pytest.mark.parametrize(
    ("change", "section", "message"),
    [
        ({"link": "not a link"}, "source", "Paste the full link, starting with https://"),
        ({"sourceKind": "file"}, "source", "Choose a video file first."),
        ({"platforms": []}, "platforms", "Turn on at least one platform."),
    ],
)
def test_a_draft_with_a_problem_is_refused_with_its_section(
    client: TestClient, change: dict[str, object], section: str, message: str
) -> None:
    response = client.post("/api/projects", json={**LINK_DRAFT, **change})

    assert response.status_code == 422
    assert response.json() == {"problem": {"section": section, "message": message}}
    assert client.get("/api/projects").json()["projects"] == []


def test_a_file_over_4_gb_is_refused(client: TestClient) -> None:
    response = client.post(
        "/api/projects", json={**FILE_DRAFT, "fileSizeBytes": 4 * BYTES_PER_GB + 1}
    )

    assert response.status_code == 422
    assert response.json()["problem"] == {
        "section": "source",
        "message": "This file is larger than 4 GB. Choose a smaller one.",
    }


def test_a_new_project_is_refused_when_the_reported_free_space_is_under_5_gb(
    tmp_path: Path,
) -> None:
    low_disk_client = open_client_without_the_queue(tmp_path, reported_free_gb=3.2)

    response = low_disk_client.post("/api/projects", json=LINK_DRAFT)
    listed = low_disk_client.get("/api/projects").json()

    assert response.status_code == 422
    assert response.json()["problem"] == {
        "section": "source",
        "message": "Only 3.2 GB is free on this Mac, and a new project needs 5 GB. "
        "Delete a project or free some space.",
    }
    assert listed == {"projects": [], "freeDiskGb": 3.2}


def test_delete_removes_the_project_and_its_folder(client: TestClient, tmp_path: Path) -> None:
    created = client.post("/api/projects", json=LINK_DRAFT).json()
    project_dir = tmp_path / "data" / "projects" / created["id"]
    project_dir.mkdir()
    (project_dir / "source.mp4").write_bytes(b"video")

    response = client.delete(f"/api/projects/{created['id']}")

    assert response.status_code == 204
    assert not project_dir.exists()
    assert client.get("/api/projects").json()["projects"] == []


def test_upload_parts_are_appended_and_the_new_count_is_answered(
    client: TestClient, tmp_path: Path
) -> None:
    created = client.post("/api/projects", json={**FILE_DRAFT, "fileSizeBytes": 6}).json()
    upload_address = f"/api/projects/{created['id']}/upload"

    first = client.put(upload_address, params={"offset": 0}, content=b"abc")
    second = client.put(upload_address, params={"offset": 3}, content=b"def")

    assert (first.status_code, first.json()) == (200, {"receivedBytes": 3})
    assert (second.status_code, second.json()) == (200, {"receivedBytes": 6})
    stored = tmp_path / "data" / "projects" / created["id"] / "source.mp4"
    assert stored.read_bytes() == b"abcdef"
    assert client.get(f"/api/projects/{created['id']}").json()["status"] == "queued"


def test_a_part_at_another_offset_answers_409_with_the_count_held(client: TestClient) -> None:
    created = client.post("/api/projects", json={**FILE_DRAFT, "fileSizeBytes": 6}).json()
    upload_address = f"/api/projects/{created['id']}/upload"
    client.put(upload_address, params={"offset": 0}, content=b"abc")

    response = client.put(upload_address, params={"offset": 0}, content=b"abc")

    assert response.status_code == 409
    assert response.json()["receivedBytes"] == 3


def test_a_part_declared_larger_than_8_mib_answers_413(client: TestClient) -> None:
    created = client.post("/api/projects", json=FILE_DRAFT).json()
    oversized = b"x" * (8 * 1024 * 1024 + 1)

    response = client.put(
        f"/api/projects/{created['id']}/upload", params={"offset": 0}, content=oversized
    )

    assert response.status_code == 413
    assert client.get(f"/api/projects/{created['id']}").json()["upload"]["receivedBytes"] == 0


def test_a_part_of_exactly_8_mib_is_accepted(client: TestClient) -> None:
    part = b"x" * (8 * 1024 * 1024)
    created = client.post(
        "/api/projects", json={**FILE_DRAFT, "fileSizeBytes": len(part) + 1}
    ).json()

    upload_address = f"/api/projects/{created['id']}/upload"
    response = client.put(upload_address, params={"offset": 0}, content=part)

    assert response.json() == {"receivedBytes": len(part)}


def test_a_part_for_a_link_project_answers_409(client: TestClient) -> None:
    created = client.post("/api/projects", json=LINK_DRAFT).json()

    response = client.put(
        f"/api/projects/{created['id']}/upload", params={"offset": 0}, content=b"abc"
    )

    assert response.status_code == 409


def test_a_part_for_an_unknown_project_answers_404(client: TestClient) -> None:
    response = client.put("/api/projects/missing/upload", params={"offset": 0}, content=b"abc")

    assert response.status_code == 404


@pytest.mark.parametrize("method", ["GET", "DELETE"])
def test_an_unknown_id_answers_404_through_the_error_handler(
    client: TestClient, method: str
) -> None:
    response = client.request(method, "/api/projects/missing")

    assert response.status_code == 404
    assert response.json() == {
        "problem": {"section": None, "message": "This project does not exist."}
    }
