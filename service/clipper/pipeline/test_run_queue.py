import threading
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
from .pipeline_stage import StageRun
from .run_queue import QueueWorker, StepCheck

PLENTY = DiskSpace(free_bytes=50 * BYTES_PER_GB, total_bytes=460 * BYTES_PER_GB)
WAIT_SECONDS = 5
DOWNLOAD_LABEL = "Downloading Whisper small"


class HeldStage:
    step = StepKind.FETCH
    resting_status = ProjectStatus.FETCHED

    def __init__(self) -> None:
        self.started: list[str] = []
        self.release = threading.Semaphore(0)

    def run(self, stage_run: StageRun) -> None:
        self.started.append(stage_run.project.id)
        while not self.release.acquire(timeout=0.02):
            if stage_run.stop.is_set():
                raise RuntimeError("stopped while held")


class ScriptedStage:
    step = StepKind.FETCH
    resting_status = ProjectStatus.FETCHED

    def __init__(self, script: Callable[[StageRun], None]) -> None:
        self._script = script

    def run(self, stage_run: StageRun) -> None:
        self._script(stage_run)


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
def held_stage() -> HeldStage:
    return HeldStage()


@pytest.fixture
def held_worker(
    repository: ProjectRepository, queue: ProjectQueue, held_stage: HeldStage
) -> Iterator[QueueWorker]:
    worker = QueueWorker(repository, queue, [held_stage])
    yield worker
    worker.stop()


def test_projects_are_taken_in_creation_order_one_at_a_time(
    repository: ProjectRepository, held_worker: QueueWorker, held_stage: HeldStage
) -> None:
    first, second, third = (queue_project(repository) for _ in range(3))
    held_worker.start()

    wait_until(lambda: held_stage.started == [first.id])
    statuses = [repository.get(project.id).status for project in (first, second, third)]
    held_stage.release.release()
    wait_until(lambda: held_stage.started == [first.id, second.id])
    held_stage.release.release()
    wait_until(lambda: held_stage.started == [first.id, second.id, third.id])

    assert statuses == [ProjectStatus.PROCESSING, ProjectStatus.QUEUED, ProjectStatus.QUEUED]
    assert repository.get(first.id).status is ProjectStatus.FETCHED
    assert repository.get(third.id).status is ProjectStatus.PROCESSING


def test_the_step_of_the_running_project_is_marked_running(
    repository: ProjectRepository, held_worker: QueueWorker, held_stage: HeldStage
) -> None:
    project = queue_project(repository)
    held_worker.start()

    wait_until(lambda: held_stage.started == [project.id])

    assert repository.get(project.id).steps[0].state is StepState.RUNNING


def test_a_finished_project_rests_fetched_with_its_other_three_steps_pending(
    repository: ProjectRepository, held_worker: QueueWorker, held_stage: HeldStage
) -> None:
    project = queue_project(repository)
    held_stage.release.release()
    held_worker.start()

    wait_until(lambda: repository.get(project.id).status is ProjectStatus.FETCHED)

    steps = repository.get(project.id).steps
    assert (steps[0].state, steps[0].percent) == (StepState.DONE, 100)
    assert [(step.state, step.percent) for step in steps[1:]] == [(StepState.PENDING, 0)] * 3


def test_a_project_that_joins_later_is_taken_once_the_queue_is_free(
    repository: ProjectRepository, held_worker: QueueWorker, held_stage: HeldStage
) -> None:
    held_worker.start()
    time.sleep(0.3)

    late = queue_project(repository)
    held_stage.release.release()

    wait_until(lambda: repository.get(late.id).status is ProjectStatus.FETCHED)


def test_the_step_percent_is_stored_and_never_falls(
    repository: ProjectRepository, queue: ProjectQueue
) -> None:
    stored: list[float] = []
    project = queue_project(repository)

    def report_out_of_order(stage_run: StageRun) -> None:
        for percent in (10, 40, 30, 60):
            stage_run.report_percent(percent)
            time.sleep(0.3)
            stored.append(repository.get(project.id).steps[0].percent)

    worker = QueueWorker(repository, queue, [ScriptedStage(report_out_of_order)])
    worker.start()
    wait_until(lambda: repository.get(project.id).status is ProjectStatus.FETCHED)
    worker.stop()

    assert stored == [10, 40, 40, 60]


def test_the_step_percent_is_stored_at_least_once_a_second(
    repository: ProjectRepository, queue: ProjectQueue
) -> None:
    seen: list[tuple[float, float]] = []
    project = queue_project(repository)

    def report_often(stage_run: StageRun) -> None:
        for tick in range(1, 61):
            stage_run.report_percent(tick)
            time.sleep(0.04)
            seen.append((time.monotonic(), repository.get(project.id).steps[0].percent))

    worker = QueueWorker(repository, queue, [ScriptedStage(report_often)])
    worker.start()
    wait_until(lambda: repository.get(project.id).status is ProjectStatus.FETCHED)
    worker.stop()

    readings = zip(seen[1:], seen, strict=False)
    changes = [at for (at, percent), (_, before) in readings if percent != before]
    gaps = [later - earlier for earlier, later in zip(changes, changes[1:], strict=False)]
    assert len(changes) >= 3
    assert max(gaps) < 1


def test_a_failing_stage_leaves_the_project_failed_with_a_reason_and_the_queue_moving(
    repository: ProjectRepository, queue: ProjectQueue
) -> None:
    broken, healthy = queue_project(repository), queue_project(repository)

    def fail_the_first(stage_run: StageRun) -> None:
        if stage_run.project.id == broken.id:
            raise RuntimeError("the disk caught fire")

    worker = QueueWorker(repository, queue, [ScriptedStage(fail_the_first)])
    worker.start()
    wait_until(lambda: repository.get(healthy.id).status is ProjectStatus.FETCHED)
    worker.stop()

    failed = repository.get(broken.id)
    assert failed.status is ProjectStatus.FAILED
    assert failed.halt_reason == "“Fetching video” did not finish. Retry to run this step again."
    assert (failed.steps[0].state, failed.steps[0].percent) == (StepState.PENDING, 0)


def test_stopping_the_worker_ends_the_running_stage_and_leaves_its_project_processing(
    repository: ProjectRepository, queue: ProjectQueue, held_stage: HeldStage
) -> None:
    project = queue_project(repository)
    worker = QueueWorker(repository, queue, [held_stage])
    worker.start()
    wait_until(lambda: held_stage.started == [project.id])
    started = time.monotonic()

    worker.stop()

    assert time.monotonic() - started < 2
    assert repository.get(project.id).status is ProjectStatus.PROCESSING
    assert repository.get(project.id).halt_reason is None


def test_a_project_deleted_while_it_waits_is_skipped(
    repository: ProjectRepository, held_worker: QueueWorker, held_stage: HeldStage
) -> None:
    running, removed, last = (queue_project(repository) for _ in range(3))
    held_worker.start()
    wait_until(lambda: held_stage.started == [running.id])

    repository.delete(removed.id)
    held_stage.release.release()

    wait_until(lambda: held_stage.started == [running.id, last.id])


class RecordingStage:
    def __init__(self, step: StepKind, resting_status: ProjectStatus, ran: list[StepKind]) -> None:
        self.step = step
        self.resting_status = resting_status
        self.waits_for_stop = False
        self._ran = ran

    def run(self, stage_run: StageRun) -> None:
        self._ran.append(self.step)
        while self.waits_for_stop and not stage_run.stop.wait(0.02):
            stage_run.report_percent(40)
        if stage_run.stop.is_set():
            raise RuntimeError("stopped")


def add_download_once(queue: ProjectQueue) -> StepCheck:
    def check(project: Project) -> None:
        if all(step.kind is not StepKind.MODEL for step in project.steps):
            queue.put_step_ahead(
                project.id, kind=StepKind.MODEL, label=DOWNLOAD_LABEL, ahead_of=StepKind.TRANSCRIBE
            )

    return check


@pytest.fixture
def ran() -> list[StepKind]:
    return []


@pytest.fixture
def stages(ran: list[StepKind]) -> dict[StepKind, RecordingStage]:
    return {
        StepKind.FETCH: RecordingStage(StepKind.FETCH, ProjectStatus.FETCHED, ran),
        StepKind.MODEL: RecordingStage(StepKind.MODEL, ProjectStatus.FETCHED, ran),
        StepKind.TRANSCRIBE: RecordingStage(StepKind.TRANSCRIBE, ProjectStatus.TRANSCRIBED, ran),
    }


def test_a_check_that_puts_a_step_ahead_of_the_second_makes_it_run_first_and_the_second_after(
    repository: ProjectRepository,
    queue: ProjectQueue,
    stages: dict[StepKind, RecordingStage],
    ran: list[StepKind],
) -> None:
    project = queue_project(repository)
    checks = {StepKind.TRANSCRIBE: add_download_once(queue)}
    worker = QueueWorker(repository, queue, list(stages.values()), checks)

    worker.start()
    wait_until(lambda: repository.get(project.id).status is ProjectStatus.TRANSCRIBED)
    worker.stop()

    rested = repository.get(project.id)
    assert ran == [StepKind.FETCH, StepKind.MODEL, StepKind.TRANSCRIBE]
    assert [step.kind for step in rested.steps] == ["fetch", "model", "transcribe", "score", "cut"]
    assert [step.state for step in rested.steps[:3]] == [StepState.DONE] * 3
    assert rested.label_of_kind(StepKind.MODEL) == DOWNLOAD_LABEL
    assert rested.percent() == 50


def test_the_stop_reason_of_an_added_step_carries_its_own_label(
    repository: ProjectRepository,
    queue: ProjectQueue,
    stages: dict[StepKind, RecordingStage],
    ran: list[StepKind],
) -> None:
    stages[StepKind.MODEL].waits_for_stop = True
    project = queue_project(repository)
    checks = {StepKind.TRANSCRIBE: add_download_once(queue)}
    worker = QueueWorker(repository, queue, list(stages.values()), checks)
    worker.start()
    wait_until(lambda: ran == [StepKind.FETCH, StepKind.MODEL])

    has_ended = worker.stop_project(project.id)
    worker.stop()

    stopped = repository.get(project.id)
    assert has_ended
    assert stopped.status is ProjectStatus.STOPPED
    assert stopped.halt_reason == f"Stopped at “{DOWNLOAD_LABEL}”. The stages before it are kept."
    assert (stopped.steps[1].state, stopped.steps[1].percent) == (StepState.PENDING, 0)


def test_a_check_that_fails_leaves_the_project_failed_at_the_step_it_was_for(
    repository: ProjectRepository,
    queue: ProjectQueue,
    stages: dict[StepKind, RecordingStage],
    ran: list[StepKind],
) -> None:
    def refuse(project: Project) -> None:
        raise RuntimeError(f"nothing can be checked for {project.id}")

    project = queue_project(repository)
    worker = QueueWorker(repository, queue, list(stages.values()), {StepKind.TRANSCRIBE: refuse})

    worker.start()
    wait_until(lambda: repository.get(project.id).status is ProjectStatus.FAILED)
    worker.stop()

    assert ran == [StepKind.FETCH]
    assert repository.get(project.id).halt_reason == (
        "“Transcribing on this Mac” did not finish. Retry to run this step again."
    )
