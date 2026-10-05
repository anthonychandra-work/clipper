import time
from collections.abc import Callable, Iterator
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from .conftest import VideoRecipe
from .main import create_app
from .media import MediaToolsMissingError
from .projects import (
    CreateProjectRequest,
    Platform,
    ProjectQueue,
    ProjectRepository,
    ProjectStatus,
    SourceKind,
    StepKind,
    UploadPart,
    create_project,
    receive_upload_part,
)
from .settings import StartupSettings
from .storage import BYTES_PER_GB, DiskSpace, open_data_folder, open_database

PLENTY = DiskSpace(free_bytes=50 * BYTES_PER_GB, total_bytes=460 * BYTES_PER_GB)
WAIT_SECONDS = 30


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


def leave_a_project_processing(settings: StartupSettings, video: Path) -> str:
    data_folder = open_data_folder(settings.data_dir)
    database = open_database(data_folder.database_file)
    draft = CreateProjectRequest(
        source_kind=SourceKind.FILE,
        file_name=video.name,
        file_size_bytes=video.stat().st_size,
        platforms=[Platform.REELS],
    )
    project = create_project(draft, ProjectRepository(database), PLENTY)
    receive_upload_part(
        UploadPart(project.id, 0, video.read_bytes()), ProjectRepository(database), data_folder
    )
    ProjectQueue(database).take_oldest_queued()
    ProjectQueue(database).start_step(project.id, StepKind.FETCH)
    ProjectQueue(database).raise_step_percent(project.id, StepKind.FETCH, 85)
    return project.id


def wait_for_status(client: TestClient, project_id: str, status: str) -> dict[str, object]:
    deadline = time.monotonic() + WAIT_SECONDS
    while True:
        project: dict[str, object] = client.get(f"/api/projects/{project_id}").json()
        if project["status"] == status:
            return project
        assert time.monotonic() < deadline, f"The project did not become {status}: {project}"
        time.sleep(0.05)


def test_a_project_interrupted_by_a_restart_is_finished_after_the_start(
    tmp_path: Path, build_video: Callable[[VideoRecipe], Path]
) -> None:
    settings = StartupSettings(data_dir=tmp_path / "data")
    interrupted = leave_a_project_processing(settings, build_video(VideoRecipe(name="upload.mp4")))

    with TestClient(create_app(settings)) as restarted:
        fetched = wait_for_status(restarted, interrupted, "fetched")

    assert fetched["durationSeconds"] == pytest.approx(2, abs=0.2)
    assert (settings.data_dir / "projects" / interrupted / "preview.mp4").is_file()


def test_the_queue_does_not_run_before_the_service_has_started(
    tmp_path: Path, build_video: Callable[[VideoRecipe], Path]
) -> None:
    settings = StartupSettings(data_dir=tmp_path / "data")
    interrupted = leave_a_project_processing(settings, build_video(VideoRecipe(name="upload.mp4")))

    not_started = TestClient(create_app(settings))
    time.sleep(0.5)

    assert not_started.get(f"/api/projects/{interrupted}").json()["status"] == "processing"


def test_a_project_that_rests_before_a_step_without_a_stage_is_left_resting_at_the_start(
    tmp_path: Path, build_video: Callable[[VideoRecipe], Path]
) -> None:
    settings = StartupSettings(data_dir=tmp_path / "data")
    rested = leave_a_project_processing(settings, build_video(VideoRecipe(name="upload.mp4")))
    queue = ProjectQueue(open_database(settings.data_dir / "clipper.sqlite3"))
    queue.finish_step(rested, StepKind.FETCH)
    queue.rest(rested, ProjectStatus.FETCHED)

    with TestClient(create_app(settings)) as restarted:
        time.sleep(0.5)
        after_the_start = restarted.get(f"/api/projects/{rested}").json()

    assert after_the_start["status"] == "fetched"
    assert [step["state"] for step in after_the_start["steps"]] == ["done", *["pending"] * 3]


@pytest.mark.parametrize("address", ["/docs", "/redoc", "/openapi.json"])
def test_no_documentation_page_is_served(client: TestClient, address: str) -> None:
    assert client.get(address).status_code == 404


@pytest.mark.parametrize("switch", ["tracing", "metrics", "logs", "auto_configure"])
def test_fastapi_starts_with_its_telemetry_switched_off(app: FastAPI, switch: str) -> None:
    assert app._telemetry.get(switch) is False
