from ..storage import BYTES_PER_GB, DataFolder, DiskSpace
from .create_project import create_project
from .project import Platform, Project, ProjectStatus, SourceKind, StepKind, StepState
from .project_queue import ProjectQueue
from .project_repository import ProjectRepository
from .project_schemas import CreateProjectRequest
from .receive_upload import UploadPart, receive_upload_part

PLENTY = DiskSpace(free_bytes=50 * BYTES_PER_GB, total_bytes=460 * BYTES_PER_GB)


def queue_link_project(repository: ProjectRepository) -> Project:
    draft = CreateProjectRequest(
        source_kind=SourceKind.LINK, link="https://video.example/talk", platforms=[Platform.REELS]
    )
    return create_project(draft, repository, PLENTY)


def start_fetching_the_oldest(queue: ProjectQueue) -> str:
    project_id = queue.take_oldest_queued()
    assert project_id is not None
    queue.start_step(project_id, StepKind.FETCH)
    return project_id


def test_the_oldest_queued_project_is_taken_and_marked_processing(
    repository: ProjectRepository, queue: ProjectQueue
) -> None:
    first, second = queue_link_project(repository), queue_link_project(repository)

    taken = queue.take_oldest_queued()

    assert taken == first.id
    assert repository.get(first.id).status is ProjectStatus.PROCESSING
    assert repository.get(second.id).status is ProjectStatus.QUEUED


def test_nothing_is_taken_from_an_empty_queue(queue: ProjectQueue) -> None:
    assert queue.take_oldest_queued() is None


def test_a_step_percent_is_stored_while_the_step_runs_and_never_falls(
    repository: ProjectRepository, queue: ProjectQueue
) -> None:
    queue_link_project(repository)
    project_id = start_fetching_the_oldest(queue)

    queue.raise_step_percent(project_id, StepKind.FETCH, 40)
    queue.raise_step_percent(project_id, StepKind.FETCH, 25)

    fetch = repository.get(project_id).steps[0]
    assert (fetch.state, fetch.percent) == (StepState.RUNNING, 40)


def test_a_finished_step_is_done_at_100_percent_and_the_project_rests(
    repository: ProjectRepository, queue: ProjectQueue
) -> None:
    queue_link_project(repository)
    project_id = start_fetching_the_oldest(queue)

    queue.finish_step(project_id, StepKind.FETCH)
    queue.rest(project_id, ProjectStatus.FETCHED)

    rested = repository.get(project_id)
    assert rested.status is ProjectStatus.FETCHED
    assert (rested.steps[0].state, rested.steps[0].percent) == (StepState.DONE, 100)
    assert {step.state for step in rested.steps[1:]} == {StepState.PENDING}
    assert rested.percent() == 25


def test_a_halt_stores_the_reason_and_returns_the_step_to_its_start(
    repository: ProjectRepository, queue: ProjectQueue
) -> None:
    queue_link_project(repository)
    project_id = start_fetching_the_oldest(queue)
    queue.raise_step_percent(project_id, StepKind.FETCH, 40)

    queue.halt(project_id, ProjectStatus.FAILED, "The video could not be downloaded.")

    halted = repository.get(project_id)
    assert halted.status is ProjectStatus.FAILED
    assert halted.halt_reason == "The video could not be downloaded."
    assert (halted.steps[0].state, halted.steps[0].percent) == (StepState.PENDING, 0)


def test_a_requeued_project_waits_again_without_its_reason(
    repository: ProjectRepository, queue: ProjectQueue
) -> None:
    queue_link_project(repository)
    project_id = start_fetching_the_oldest(queue)
    queue.halt(project_id, ProjectStatus.STOPPED, "Stopped.")

    queue.requeue(project_id)

    requeued = repository.get(project_id)
    assert requeued.status is ProjectStatus.QUEUED
    assert requeued.halt_reason is None
    assert queue.take_oldest_queued() == project_id


def test_an_uploaded_file_keeps_the_share_its_arrival_earned_when_its_step_restarts(
    repository: ProjectRepository, queue: ProjectQueue, data_folder: DataFolder
) -> None:
    draft = CreateProjectRequest(
        source_kind=SourceKind.FILE,
        file_name="talk.mp4",
        file_size_bytes=3,
        platforms=[Platform.REELS],
    )
    uploaded = create_project(draft, repository, PLENTY)
    receive_upload_part(UploadPart(uploaded.id, 0, b"abc"), repository, data_folder)
    project_id = start_fetching_the_oldest(queue)
    queue.raise_step_percent(project_id, StepKind.FETCH, 85)

    queue.requeue(project_id)

    fetch = repository.get(project_id).steps[0]
    assert (fetch.state, fetch.percent) == (StepState.PENDING, 70)


def test_processing_projects_are_listed_oldest_first(
    repository: ProjectRepository, queue: ProjectQueue
) -> None:
    first, second = queue_link_project(repository), queue_link_project(repository)
    queue_link_project(repository)
    queue.take_oldest_queued()
    queue.take_oldest_queued()

    assert queue.list_processing() == [first.id, second.id]
