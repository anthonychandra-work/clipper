import time
from collections.abc import Callable, Iterator

import pytest

from ..projects import (
    CreateProjectRequest,
    Platform,
    Project,
    ProjectQueue,
    ProjectRepository,
    ProjectStatus,
    SourceKind,
    StepKind,
    StepState,
    create_project,
)
from ..storage import BYTES_PER_GB, DiskSpace
from .halt_project import NotHaltedError, NotProcessingError, requeue_project, stop_project
from .pipeline_stage import StageRun
from .run_queue import QueueWorker

PLENTY = DiskSpace(free_bytes=50 * BYTES_PER_GB, total_bytes=460 * BYTES_PER_GB)
WAIT_SECONDS = 5


class CountedStage:
    def __init__(self, step: StepKind, resting_status: ProjectStatus) -> None:
        self.step = step
        self.resting_status = resting_status
        self.runs = 0
        self.waits_for_stop = False
        self.fails = False

    def run(self, stage_run: StageRun) -> None:
        self.runs += 1
        if self.fails:
            raise RuntimeError("this stage was told to fail")
        while self.waits_for_stop and not stage_run.stop.wait(0.02):
            stage_run.report_percent(40)
        if stage_run.stop.is_set():
            raise RuntimeError("stopped")


def queue_project(repository: ProjectRepository) -> Project:
    draft = CreateProjectRequest(
        source_kind=SourceKind.LINK, link="https://video.example/talk", platforms=[Platform.REELS]
    )
    return create_project(draft, repository, PLENTY)


def wait_until(condition: Callable[[], bool]) -> None:
    deadline = time.monotonic() + WAIT_SECONDS
    while not condition():
        assert time.monotonic() < deadline, "The queue did not get there in time."
        time.sleep(0.01)


@pytest.fixture
def fetch() -> CountedStage:
    return CountedStage(StepKind.FETCH, ProjectStatus.FETCHED)


@pytest.fixture
def transcribe() -> CountedStage:
    return CountedStage(StepKind.TRANSCRIBE, ProjectStatus.READY)


@pytest.fixture
def worker(
    repository: ProjectRepository,
    queue: ProjectQueue,
    fetch: CountedStage,
    transcribe: CountedStage,
) -> Iterator[QueueWorker]:
    queue_worker = QueueWorker(repository, queue, [fetch, transcribe])
    queue_worker.start()
    yield queue_worker
    queue_worker.stop()


def test_stop_ends_the_running_step_within_two_seconds_and_leaves_the_project_stopped(
    repository: ProjectRepository, worker: QueueWorker, fetch: CountedStage
) -> None:
    fetch.waits_for_stop = True
    project = queue_project(repository)
    wait_until(lambda: repository.get(project.id).steps[0].percent == 40)
    started = time.monotonic()

    stopped = stop_project(project.id, repository, worker)

    assert time.monotonic() - started < 2
    assert stopped.status is ProjectStatus.STOPPED
    assert stopped.halt_reason == "Stopped at “Fetching video”. The stages before it are kept."
    assert (stopped.steps[0].state, stopped.steps[0].percent) == (StepState.PENDING, 0)


def test_the_queue_moves_on_after_a_stop(
    repository: ProjectRepository, worker: QueueWorker, fetch: CountedStage
) -> None:
    fetch.waits_for_stop = True
    stopped, waiting = queue_project(repository), queue_project(repository)
    wait_until(lambda: repository.get(stopped.id).status is ProjectStatus.PROCESSING)

    stop_project(stopped.id, repository, worker)

    wait_until(lambda: repository.get(waiting.id).status is ProjectStatus.PROCESSING)
    assert repository.get(stopped.id).status is ProjectStatus.STOPPED


def test_a_project_that_is_not_processing_cannot_be_stopped(
    repository: ProjectRepository, queue: ProjectQueue
) -> None:
    idle_worker = QueueWorker(repository, queue, [])
    project = queue_project(repository)

    with pytest.raises(NotProcessingError) as raised:
        stop_project(project.id, repository, idle_worker)

    assert raised.value.status_code == 409


def test_resume_puts_a_stopped_project_back_in_the_queue_and_it_finishes(
    repository: ProjectRepository, queue: ProjectQueue, worker: QueueWorker, fetch: CountedStage
) -> None:
    fetch.waits_for_stop = True
    project = queue_project(repository)
    wait_until(lambda: repository.get(project.id).status is ProjectStatus.PROCESSING)
    stop_project(project.id, repository, worker)
    fetch.waits_for_stop = False

    resumed = requeue_project(project.id, repository, queue)

    assert resumed.halt_reason is None
    assert resumed.status in (ProjectStatus.QUEUED, ProjectStatus.PROCESSING)
    wait_until(lambda: repository.get(project.id).status is ProjectStatus.READY)
    assert fetch.runs == 2


def test_retry_runs_the_failed_step_again_and_not_the_steps_that_finished(
    repository: ProjectRepository,
    queue: ProjectQueue,
    worker: QueueWorker,
    fetch: CountedStage,
    transcribe: CountedStage,
) -> None:
    transcribe.fails = True
    project = queue_project(repository)
    wait_until(lambda: repository.get(project.id).status is ProjectStatus.FAILED)
    failed = repository.get(project.id)
    transcribe.fails = False

    requeue_project(project.id, repository, queue)

    wait_until(lambda: repository.get(project.id).status is ProjectStatus.READY)
    assert failed.halt_reason == (
        "“Transcribing on this Mac” did not finish. Retry to run this step again."
    )
    assert [step.state for step in failed.steps[:2]] == [StepState.DONE, StepState.PENDING]
    assert (fetch.runs, transcribe.runs) == (1, 2)


def test_a_project_that_is_neither_stopped_nor_failed_cannot_be_run_again(
    repository: ProjectRepository, queue: ProjectQueue
) -> None:
    project = queue_project(repository)

    with pytest.raises(NotHaltedError) as raised:
        requeue_project(project.id, repository, queue)

    assert raised.value.status_code == 409
    assert repository.get(project.id).status is ProjectStatus.QUEUED
