import shutil
from collections.abc import Callable

from ..storage import DataFolder
from .project_repository import ProjectRepository
from .receive_upload import append_lock


# The stop is asked whatever the status: an exported project may have a clip rendering.
def delete_project(
    project_id: str,
    repository: ProjectRepository,
    data_folder: DataFolder,
    stop_processing: Callable[[str], object],
) -> None:
    project = repository.get(project_id)
    stop_processing(project.id)
    with append_lock:
        project_dir = data_folder.project_dir(project.id)
        if project_dir.exists():
            shutil.rmtree(project_dir)
        repository.delete(project.id)
