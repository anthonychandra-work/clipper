import time
from collections.abc import Callable
from pathlib import Path

from fastapi.testclient import TestClient

from ..conftest import CLOSED_LOCAL_PORT
from ..main import create_app
from ..projects import Project, ProjectQueue, ProjectResponse, ProjectStatus, StepState
from ..settings import StartupSettings
from ..storage import BYTES_PER_GB, DataFolder
from .transcript_store import read_transcript

WAIT_SECONDS = 90
DONE, PENDING = StepState.DONE, StepState.PENDING


def describe_settings(
    data_folder: DataFolder, model_source: str = CLOSED_LOCAL_PORT
) -> StartupSettings:
    return StartupSettings(
        data_dir=data_folder.root,
        reported_free_bytes=50 * BYTES_PER_GB,
        model_source=model_source,
    )


def upload(client: TestClient, video: Path) -> str:
    content = video.read_bytes()
    draft = {
        "sourceKind": "file",
        "fileName": video.name,
        "fileSizeBytes": len(content),
        "platforms": ["reels"],
    }
    project_id: str = client.post("/api/projects", json=draft).json()["id"]
    client.put(f"/api/projects/{project_id}/upload", params={"offset": 0}, content=content)
    return project_id


def wait_for_status(client: TestClient, project_id: str, status: ProjectStatus) -> ProjectResponse:
    deadline = time.monotonic() + WAIT_SECONDS
    while True:
        answer = client.get(f"/api/projects/{project_id}").json()
        project = ProjectResponse.model_validate(answer)
        if project.status is status:
            return project
        assert time.monotonic() < deadline, f"The project did not become {status}: {project}"
        time.sleep(0.05)


def test_an_uploaded_talk_goes_through_the_whole_app_and_rests_transcribed(
    data_folder: DataFolder, default_model: Path, talk_video: Path
) -> None:
    with TestClient(create_app(describe_settings(data_folder))) as client:
        project_id = upload(client, talk_video)
        rested = wait_for_status(client, project_id, ProjectStatus.TRANSCRIBED)

    project_dir = data_folder.project_dir(project_id)
    transcript = read_transcript(project_dir)
    assert [step.state for step in rested.steps] == [DONE, DONE, PENDING, PENDING]
    assert [step.label for step in rested.steps[:2]] == [
        "Preparing video",
        "Transcribing on this Mac",
    ]
    assert (rested.percent, rested.halt) == (50, None)
    assert (transcript.language, transcript.model) == ("en", "large-v3-turbo")
    assert len(transcript.words) > 500
    assert sorted(left.name for left in project_dir.iterdir()) == [
        "preview.mp4",
        "source.mp4",
        "transcript.json",
    ]


def test_a_project_that_rested_fetched_under_an_earlier_version_is_transcribed_after_the_start(
    add_fetched_project: Callable[[Path], Project],
    default_model: Path,
    talk_video: Path,
    queue: ProjectQueue,
    data_folder: DataFolder,
) -> None:
    project = add_fetched_project(talk_video)
    queue.take_oldest_queued()
    queue.rest(project.id, ProjectStatus.FETCHED)

    with TestClient(create_app(describe_settings(data_folder))) as client:
        rested = wait_for_status(client, project.id, ProjectStatus.TRANSCRIBED)

    assert [step.state for step in rested.steps] == [DONE, DONE, PENDING, PENDING]
    assert read_transcript(data_folder.project_dir(project.id)).model == "large-v3-turbo"


def test_the_model_chosen_in_settings_is_downloaded_and_used_for_the_next_project(
    data_folder: DataFolder, model_server: str, talk_video: Path
) -> None:
    with TestClient(create_app(describe_settings(data_folder, model_server))) as client:
        client.patch("/api/settings", json={"whisperModel": "small"})
        project_id = upload(client, talk_video)
        rested = wait_for_status(client, project_id, ProjectStatus.TRANSCRIBED)

    assert [step.label for step in rested.steps[1:3]] == [
        "Downloading Whisper small",
        "Transcribing on this Mac",
    ]
    assert [step.state for step in rested.steps] == [DONE, DONE, DONE, PENDING, PENDING]
    assert rested.percent == 50
    assert sorted(file.name for file in data_folder.model_dir("small").iterdir()) == [
        "config.json",
        "weights.npz",
    ]
    assert read_transcript(data_folder.project_dir(project_id)).model == "small"
