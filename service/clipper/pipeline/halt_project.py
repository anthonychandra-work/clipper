from ..problems import ConflictError
from ..projects import Project, ProjectQueue, ProjectRepository, ProjectStatus
from .run_queue import QueueWorker

HALTED_STATUSES = (ProjectStatus.STOPPED, ProjectStatus.FAILED)


class NotProcessingError(ConflictError):
    def __init__(self) -> None:
        super().__init__("This project is not being processed, so there is nothing to stop.")


class NotHaltedError(ConflictError):
    def __init__(self) -> None:
        super().__init__("This project is neither stopped nor failed, so it cannot be run again.")


def stop_project(project_id: str, repository: ProjectRepository, worker: QueueWorker) -> Project:
    if repository.get(project_id).status is not ProjectStatus.PROCESSING:
        raise NotProcessingError()
    worker.stop_project(project_id)
    return repository.get(project_id)


def requeue_project(project_id: str, repository: ProjectRepository, queue: ProjectQueue) -> Project:
    if repository.get(project_id).status not in HALTED_STATUSES:
        raise NotHaltedError()
    queue.requeue(project_id)
    return repository.get(project_id)
