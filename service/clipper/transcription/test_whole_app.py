import time
from collections.abc import Callable
from pathlib import Path

from fastapi.testclient import TestClient

from ..conftest import CLOSED_LOCAL_PORT
from ..main import create_app
from ..projects import (
    Project,
    ProjectQueue,
    ProjectResponse,
    ProjectStatus,
    StepKind,
    StepState,
)
from ..settings import StartupSettings
from ..storage import BYTES_PER_GB, DataFolder
from .transcript_store import read_transcript

WAIT_SECONDS = 90
DONE, PENDING = StepState.DONE, StepState.PENDING
NO_KEY = "No Anthropic API key is saved. Add one in Settings, then retry."


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


def has_halted_after_transcribing(project: ProjectResponse) -> bool:
    transcribed = [step.state for step in project.steps if step.kind is StepKind.TRANSCRIBE]
    return transcribed == [DONE] and project.halt is not None


def wait_for_the_end_without_a_key(client: TestClient, project_id: str) -> ProjectResponse:
    deadline = time.monotonic() + WAIT_SECONDS
    while True:
        answer = client.get(f"/api/projects/{project_id}").json()
        project = ProjectResponse.model_validate(answer)
        if has_halted_after_transcribing(project):
            return project
        assert time.monotonic() < deadline, f"The project was not transcribed: {project}"
        time.sleep(0.05)


def describe_halt(project: ProjectResponse) -> tuple[ProjectStatus, str | None, bool | None]:
    if project.halt is None:
        return project.status, None, None
    return project.status, project.halt.reason, project.halt.opens_settings


def test_an_uploaded_talk_is_transcribed_in_the_whole_app_and_then_fails_for_the_missing_key(
    data_folder: DataFolder, default_model: Path, talk_video: Path
) -> None:
    with TestClient(create_app(describe_settings(data_folder))) as client:
        project_id = upload(client, talk_video)
        ended = wait_for_the_end_without_a_key(client, project_id)

    project_dir = data_folder.project_dir(project_id)
    transcript = read_transcript(project_dir)
    assert [step.state for step in ended.steps] == [DONE, DONE, PENDING, PENDING]
    assert [step.label for step in ended.steps[:2]] == [
        "Preparing video",
        "Transcribing on this Mac",
    ]
    assert describe_halt(ended) == (ProjectStatus.FAILED, NO_KEY, True)
    assert ended.percent == 50
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
        ended = wait_for_the_end_without_a_key(client, project.id)

    assert [step.state for step in ended.steps] == [DONE, DONE, PENDING, PENDING]
    assert describe_halt(ended) == (ProjectStatus.FAILED, NO_KEY, True)
    assert read_transcript(data_folder.project_dir(project.id)).model == "large-v3-turbo"


def test_the_model_chosen_in_settings_is_downloaded_and_used_for_the_next_project(
    data_folder: DataFolder, model_server: str, talk_video: Path
) -> None:
    with TestClient(create_app(describe_settings(data_folder, model_server))) as client:
        client.patch("/api/settings", json={"whisperModel": "small"})
        project_id = upload(client, talk_video)
        ended = wait_for_the_end_without_a_key(client, project_id)

    assert [step.label for step in ended.steps[1:3]] == [
        "Downloading Whisper small",
        "Transcribing on this Mac",
    ]
    assert [step.state for step in ended.steps] == [DONE, DONE, DONE, PENDING, PENDING]
    assert describe_halt(ended) == (ProjectStatus.FAILED, NO_KEY, True)
    assert ended.percent == 50
    assert sorted(file.name for file in data_folder.model_dir("small").iterdir()) == [
        "config.json",
        "weights.npz",
    ]
    assert read_transcript(data_folder.project_dir(project_id)).model == "small"
