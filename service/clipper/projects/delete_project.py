import shutil

from ..storage import DataFolder
from .project_repository import ProjectRepository


def delete_project(project_id: str, repository: ProjectRepository, data_folder: DataFolder) -> None:
    project = repository.get(project_id)
    project_dir = data_folder.project_dir(project.id)
    if project_dir.exists():
        shutil.rmtree(project_dir)
    repository.delete(project.id)
