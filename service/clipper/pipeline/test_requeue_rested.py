from ..projects import (
    CreateProjectRequest,
    Platform,
    Project,
    ProjectQueue,
    ProjectRepository,
    ProjectStatus,
    SourceKind,
    StepKind,
    create_project,
)
from ..storage import BYTES_PER_GB, DiskSpace
from .pipeline_stage import StageRun
from .requeue_rested import requeue_rested

PLENTY = DiskSpace(free_bytes=50 * BYTES_PER_GB, total_bytes=460 * BYTES_PER_GB)


class IdleStage:
    def __init__(self, step: StepKind, resting_status: ProjectStatus) -> None:
        self.step = step
        self.resting_status = resting_status

    def run(self, stage_run: StageRun) -> None:
        del stage_run


FETCH = IdleStage(StepKind.FETCH, ProjectStatus.FETCHED)
TRANSCRIBE = IdleStage(StepKind.TRANSCRIBE, ProjectStatus.TRANSCRIBED)


def queue_project(repository: ProjectRepository) -> Project:
    draft = CreateProjectRequest(
        source_kind=SourceKind.LINK, link="https://video.example/talk", platforms=[Platform.REELS]
    )
    return create_project(draft, repository, PLENTY)


def rest_fetched(repository: ProjectRepository, queue: ProjectQueue) -> str:
    project = queue_project(repository)
    queue.take_oldest_queued()
    queue.start_step(project.id, StepKind.FETCH)
    queue.finish_step(project.id, StepKind.FETCH)
    queue.rest(project.id, ProjectStatus.FETCHED)
    return project.id


def test_a_project_that_rests_goes_back_into_the_queue_when_its_next_step_has_a_stage(
    repository: ProjectRepository, queue: ProjectQueue
) -> None:
    fetched = rest_fetched(repository, queue)

    requeued = requeue_rested(repository, queue, [FETCH, TRANSCRIBE])

    project = repository.get(fetched)
    assert requeued == [fetched]
    assert project.status is ProjectStatus.QUEUED
    assert [step.percent for step in project.steps] == [100, 0, 0, 0]


def test_a_project_that_rests_stays_as_it_is_when_its_next_step_has_no_stage(
    repository: ProjectRepository, queue: ProjectQueue
) -> None:
    fetched = rest_fetched(repository, queue)

    requeued = requeue_rested(repository, queue, [FETCH])

    assert requeued == []
    assert repository.get(fetched).status is ProjectStatus.FETCHED


def test_projects_that_do_not_rest_are_left_as_they_were(
    repository: ProjectRepository, queue: ProjectQueue
) -> None:
    failed, stopped, waiting = (queue_project(repository) for _ in range(3))
    queue.halt(failed.id, ProjectStatus.FAILED, "The video could not be downloaded.")
    queue.halt(stopped.id, ProjectStatus.STOPPED, "Stopped.")

    requeued = requeue_rested(repository, queue, [FETCH, TRANSCRIBE])

    assert requeued == []
    assert repository.get(failed.id).status is ProjectStatus.FAILED
    assert repository.get(stopped.id).status is ProjectStatus.STOPPED
    assert repository.get(waiting.id).status is ProjectStatus.QUEUED


def test_rested_projects_are_requeued_oldest_first(
    repository: ProjectRepository, queue: ProjectQueue
) -> None:
    older = rest_fetched(repository, queue)
    newer = rest_fetched(repository, queue)

    requeued = requeue_rested(repository, queue, [FETCH, TRANSCRIBE])

    assert requeued == [older, newer]
    assert queue.take_oldest_queued() == older
