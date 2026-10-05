import time
from collections.abc import Callable
from pathlib import Path

from ..conftest import CLOSED_LOCAL_PORT, VideoRecipe
from ..pipeline import QueueWorker, requeue_project
from ..projects import Project, ProjectQueue, ProjectRepository, ProjectStatus, StepState
from ..storage import DataFolder
from .transcribe_stage import NO_SPEECH
from .transcript_store import read_transcript

WAIT_SECONDS = 60
STOP_DEADLINE_SECONDS = 2
DONE, PENDING = StepState.DONE, StepState.PENDING

AddProject = Callable[[Path], Project]
StartWorker = Callable[[str], QueueWorker]


def wait_until(condition: Callable[[], bool]) -> None:
    deadline = time.monotonic() + WAIT_SECONDS
    while not condition():
        assert time.monotonic() < deadline, "The queue did not get there in time."
        time.sleep(0.05)


def wait_for_status(
    repository: ProjectRepository, project_id: str, status: ProjectStatus
) -> Project:
    wait_until(lambda: repository.get(project_id).status is status)
    return repository.get(project_id)


def list_files(project_dir: Path) -> list[str]:
    return sorted(left.name for left in project_dir.iterdir())


def read_change_times(project_dir: Path) -> list[int]:
    return [(project_dir / name).stat().st_mtime_ns for name in ("source.mp4", "preview.mp4")]


def test_the_talk_rests_transcribed_with_a_stored_transcript(
    add_fetched_project: AddProject,
    start_worker: StartWorker,
    default_model: Path,
    talk_video: Path,
    repository: ProjectRepository,
    data_folder: DataFolder,
) -> None:
    project = add_fetched_project(talk_video)
    project_dir = data_folder.project_dir(project.id)
    before = read_change_times(project_dir)

    start_worker(CLOSED_LOCAL_PORT)
    rested = wait_for_status(repository, project.id, ProjectStatus.TRANSCRIBED)

    transcript = read_transcript(project_dir)
    assert [step.state for step in rested.steps] == [DONE, DONE, PENDING, PENDING]
    assert rested.percent() == 50
    assert (transcript.language, transcript.model) == ("en", "large-v3-turbo")
    assert len(transcript.words) > 500
    assert transcript.words[-1].end <= (rested.duration_seconds or 0)
    assert list_files(project_dir) == ["preview.mp4", "source.mp4", "transcript.json"]
    assert read_change_times(project_dir) == before


def test_with_the_model_in_place_and_the_model_source_closed_transcription_still_finishes(
    add_fetched_project: AddProject,
    start_worker: StartWorker,
    default_model: Path,
    talk_video: Path,
    repository: ProjectRepository,
) -> None:
    project = add_fetched_project(talk_video)

    start_worker(CLOSED_LOCAL_PORT)
    rested = wait_for_status(repository, project.id, ProjectStatus.TRANSCRIBED)

    assert [step.kind for step in rested.steps] == ["fetch", "transcribe", "score", "cut"]
    assert rested.halt_reason is None


def test_the_silent_fixture_fails_for_want_of_speech_and_retry_runs_that_step_alone(
    add_fetched_project: AddProject,
    start_worker: StartWorker,
    default_model: Path,
    silent_video: Path,
    repository: ProjectRepository,
    queue: ProjectQueue,
    data_folder: DataFolder,
) -> None:
    project = add_fetched_project(silent_video)
    project_dir = data_folder.project_dir(project.id)
    before = read_change_times(project_dir)
    start_worker(CLOSED_LOCAL_PORT)
    failed = wait_for_status(repository, project.id, ProjectStatus.FAILED)

    retried = requeue_project(project.id, repository, queue)
    failed_again = wait_for_status(repository, project.id, ProjectStatus.FAILED)

    assert failed.halt_reason == NO_SPEECH
    assert [step.state for step in failed.steps] == [DONE, PENDING, PENDING, PENDING]
    assert retried.halt_reason is None
    assert failed_again.halt_reason == NO_SPEECH
    assert [step.state for step in failed_again.steps] == [DONE, PENDING, PENDING, PENDING]
    assert list_files(project_dir) == ["preview.mp4", "source.mp4"]
    assert read_change_times(project_dir) == before


def test_a_source_with_no_sound_track_fails_for_want_of_speech(
    add_fetched_project: AddProject,
    start_worker: StartWorker,
    default_model: Path,
    build_video: Callable[[VideoRecipe], Path],
    repository: ProjectRepository,
) -> None:
    project = add_fetched_project(build_video(VideoRecipe(name="mute.mp4", has_sound=False)))

    start_worker(CLOSED_LOCAL_PORT)
    failed = wait_for_status(repository, project.id, ProjectStatus.FAILED)

    assert failed.halt_reason == NO_SPEECH


def test_a_stop_ends_the_transcription_within_two_seconds_with_no_transcript_and_no_samples(
    add_fetched_project: AddProject,
    start_worker: StartWorker,
    default_model: Path,
    long_talk_video: Path,
    repository: ProjectRepository,
    data_folder: DataFolder,
) -> None:
    project = add_fetched_project(long_talk_video)
    worker = start_worker(CLOSED_LOCAL_PORT)
    wait_until(lambda: repository.get(project.id).steps[1].percent > 0)
    asked_at = time.monotonic()

    worker.stop_project(project.id)
    seconds_to_stop = time.monotonic() - asked_at

    stopped = repository.get(project.id)
    assert seconds_to_stop < STOP_DEADLINE_SECONDS
    assert stopped.status is ProjectStatus.STOPPED
    assert stopped.halt_reason == (
        "Stopped at “Transcribing on this Mac”. The stages before it are kept."
    )
    assert (stopped.steps[1].state, stopped.steps[1].percent) == (PENDING, 0)
    assert list_files(data_folder.project_dir(project.id)) == ["preview.mp4", "source.mp4"]
