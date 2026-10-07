import threading
import time
from collections.abc import Callable
from pathlib import Path

from ..conftest import CLOSED_LOCAL_PORT
from ..pipeline import QueueWorker, StageRun
from ..projects import (
    Project,
    ProjectQueue,
    ProjectRepository,
    ProjectStatus,
    StepKind,
    StepState,
)
from ..settings import PreferenceChanges, PreferenceStore, WhisperModel
from ..storage import Database, DataFolder
from .model_stage import MODEL_DOWNLOAD_FAILED, DownloadPlanner, ModelStage
from .transcript_store import read_transcript

WAIT_SECONDS = 60
WITH_A_DOWNLOAD = ["fetch", "model", "transcribe", "score", "cut"]
AS_CREATED = ["fetch", "transcribe", "score", "cut"]

AddProject = Callable[[Path], Project]
StartWorker = Callable[[str], QueueWorker]


def choose(database: Database, model: WhisperModel) -> PreferenceStore:
    preferences = PreferenceStore(database)
    preferences.save(PreferenceChanges(whisper_model=model))
    return preferences


def wait_for_status(
    repository: ProjectRepository, project_id: str, status: ProjectStatus
) -> Project:
    deadline = time.monotonic() + WAIT_SECONDS
    while (project := repository.get(project_id)).status is not status:
        assert time.monotonic() < deadline, f"The project did not become {status}: {project}"
        time.sleep(0.05)
    return project


def test_with_small_chosen_and_not_on_the_mac_the_first_project_gains_the_download_step(
    add_fetched_project: AddProject,
    start_worker: StartWorker,
    model_server: str,
    talk_video: Path,
    repository: ProjectRepository,
    database: Database,
    data_folder: DataFolder,
) -> None:
    choose(database, WhisperModel.SMALL)
    first, second = add_fetched_project(talk_video), add_fetched_project(talk_video)

    start_worker(model_server)
    first_done = wait_for_status(repository, first.id, ProjectStatus.TRANSCRIBED)
    second_done = wait_for_status(repository, second.id, ProjectStatus.TRANSCRIBED)

    assert [step.kind for step in first_done.steps] == WITH_A_DOWNLOAD
    assert first_done.label_of_kind(StepKind.MODEL) == "Downloading Whisper small"
    assert [step.state for step in first_done.steps[:3]] == [StepState.DONE] * 3
    assert sorted(file.name for file in data_folder.model_dir("small").iterdir()) == [
        "config.json",
        "weights.npz",
    ]
    assert read_transcript(data_folder.project_dir(first.id)).model == "small"
    assert [step.kind for step in second_done.steps] == AS_CREATED
    assert read_transcript(data_folder.project_dir(second.id)).model == "small"


def test_with_the_model_source_closed_the_download_fails_with_its_reason(
    add_fetched_project: AddProject,
    start_worker: StartWorker,
    talk_video: Path,
    repository: ProjectRepository,
    database: Database,
    data_folder: DataFolder,
) -> None:
    choose(database, WhisperModel.SMALL)
    project = add_fetched_project(talk_video)

    start_worker(CLOSED_LOCAL_PORT)
    failed = wait_for_status(repository, project.id, ProjectStatus.FAILED)

    assert failed.halt_reason == MODEL_DOWNLOAD_FAILED
    assert [step.kind for step in failed.steps] == WITH_A_DOWNLOAD
    assert (failed.steps[1].state, failed.steps[1].percent) == (StepState.PENDING, 0)
    assert failed.percent() == 25
    assert not data_folder.has_model("small")


def test_the_download_step_is_done_at_once_when_the_model_is_already_there(
    add_fetched_project: AddProject,
    default_model: Path,
    talk_video: Path,
    database: Database,
    data_folder: DataFolder,
) -> None:
    percents: list[float] = []
    stage = ModelStage(PreferenceStore(database), data_folder, CLOSED_LOCAL_PORT)

    stage.run(StageRun(add_fetched_project(talk_video), threading.Event(), percents.append))

    assert percents == []
    assert sorted(left.name for left in data_folder.models_dir.iterdir()) == ["large-v3-turbo"]


def test_the_check_adds_nothing_when_the_chosen_model_is_on_the_mac(
    add_fetched_project: AddProject,
    default_model: Path,
    talk_video: Path,
    repository: ProjectRepository,
    queue: ProjectQueue,
    database: Database,
    data_folder: DataFolder,
) -> None:
    project = add_fetched_project(talk_video)
    planner = DownloadPlanner(PreferenceStore(database), data_folder, queue)

    planner.plan_for(project)

    assert [step.kind for step in repository.get(project.id).steps] == AS_CREATED


def test_a_changed_choice_gives_the_waiting_download_step_the_name_of_the_new_model(
    add_fetched_project: AddProject,
    talk_video: Path,
    repository: ProjectRepository,
    queue: ProjectQueue,
    database: Database,
    data_folder: DataFolder,
) -> None:
    project = add_fetched_project(talk_video)
    planner = DownloadPlanner(choose(database, WhisperModel.SMALL), data_folder, queue)
    planner.plan_for(project)
    named_small = repository.get(project.id).label_of_kind(StepKind.MODEL)

    choose(database, WhisperModel.MEDIUM)
    planner.plan_for(repository.get(project.id))

    renamed = repository.get(project.id)
    assert named_small == "Downloading Whisper small"
    assert renamed.label_of_kind(StepKind.MODEL) == "Downloading Whisper medium"
    assert [step.kind for step in renamed.steps] == WITH_A_DOWNLOAD


def test_the_check_stands_before_the_download_and_before_the_transcription(
    database: Database, data_folder: DataFolder, queue: ProjectQueue
) -> None:
    planner = DownloadPlanner(PreferenceStore(database), data_folder, queue)

    assert sorted(planner.list_checks()) == [StepKind.MODEL, StepKind.TRANSCRIBE]
