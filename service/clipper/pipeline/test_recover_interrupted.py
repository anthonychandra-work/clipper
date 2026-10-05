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
from .recover_interrupted import recover_interrupted

PLENTY = DiskSpace(free_bytes=50 * BYTES_PER_GB, total_bytes=460 * BYTES_PER_GB)


def queue_project(repository: ProjectRepository) -> Project:
    draft = CreateProjectRequest(
        source_kind=SourceKind.LINK, link="https://video.example/talk", platforms=[Platform.REELS]
    )
    return create_project(draft, repository, PLENTY)


def interrupt_mid_step(queue: ProjectQueue) -> str:
    project_id = queue.take_oldest_queued()
    assert project_id is not None
    queue.start_step(project_id, StepKind.FETCH)
    queue.raise_step_percent(project_id, StepKind.FETCH, 40)
    return project_id


def test_a_project_found_processing_goes_back_to_the_queue_with_its_step_at_the_start(
    repository: ProjectRepository, queue: ProjectQueue
) -> None:
    queue_project(repository)
    interrupted = interrupt_mid_step(queue)

    recovered = recover_interrupted(queue)

    project = repository.get(interrupted)
    assert recovered == [interrupted]
    assert project.status is ProjectStatus.QUEUED
    assert (project.steps[0].state, project.steps[0].percent) == (StepState.PENDING, 0)


def test_a_recovered_project_is_the_next_one_taken(
    repository: ProjectRepository, queue: ProjectQueue
) -> None:
    queue_project(repository)
    waiting = queue_project(repository)
    interrupted = interrupt_mid_step(queue)

    recover_interrupted(queue)

    assert queue.take_oldest_queued() == interrupted
    assert repository.get(waiting.id).status is ProjectStatus.QUEUED


def test_projects_that_were_not_processing_are_left_as_they_were(
    repository: ProjectRepository, queue: ProjectQueue
) -> None:
    failed, fetched, waiting = (queue_project(repository) for _ in range(3))
    queue.halt(failed.id, ProjectStatus.FAILED, "The video could not be downloaded.")
    queue.take_oldest_queued()
    queue.rest(fetched.id, ProjectStatus.FETCHED)

    recovered = recover_interrupted(queue)

    assert recovered == []
    assert repository.get(failed.id).status is ProjectStatus.FAILED
    assert repository.get(failed.id).halt_reason == "The video could not be downloaded."
    assert repository.get(fetched.id).status is ProjectStatus.FETCHED
    assert repository.get(waiting.id).status is ProjectStatus.QUEUED


def test_nothing_is_recovered_from_an_empty_library(queue: ProjectQueue) -> None:
    assert recover_interrupted(queue) == []
