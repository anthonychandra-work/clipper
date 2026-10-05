import pytest

from ..storage import BYTES_PER_GB, DataFolder, DiskSpace
from .create_project import create_project
from .delete_project import delete_project
from .project import Platform, Project, SourceKind
from .project_repository import ProjectNotFoundError, ProjectRepository
from .project_schemas import CreateProjectRequest

PLENTY = DiskSpace(free_bytes=50 * BYTES_PER_GB, total_bytes=460 * BYTES_PER_GB)


def create_link_project(repository: ProjectRepository) -> Project:
    draft = CreateProjectRequest(
        source_kind=SourceKind.LINK, link="https://example.com/talk.mp4", platforms=[Platform.REELS]
    )
    return create_project(draft, repository, PLENTY)


def test_delete_removes_the_files_of_the_project(
    repository: ProjectRepository, data_folder: DataFolder
) -> None:
    project = create_link_project(repository)
    project_dir = data_folder.project_dir(project.id)
    project_dir.mkdir()
    (project_dir / "source.mp4").write_bytes(b"video")
    (project_dir / "preview.mp4").write_bytes(b"preview")

    delete_project(project.id, repository, data_folder)

    assert not project_dir.exists()
    assert repository.find(project.id) is None


def test_delete_leaves_the_other_projects_alone(
    repository: ProjectRepository, data_folder: DataFolder
) -> None:
    kept, removed = create_link_project(repository), create_link_project(repository)
    kept_dir = data_folder.project_dir(kept.id)
    kept_dir.mkdir()
    (kept_dir / "source.mp4").write_bytes(b"video")

    delete_project(removed.id, repository, data_folder)

    assert (kept_dir / "source.mp4").read_bytes() == b"video"
    assert repository.get(kept.id) == kept


def test_delete_works_for_a_project_that_has_no_files_yet(
    repository: ProjectRepository, data_folder: DataFolder
) -> None:
    project = create_link_project(repository)

    delete_project(project.id, repository, data_folder)

    assert repository.find(project.id) is None


def test_deleting_an_unknown_project_raises_not_found(
    repository: ProjectRepository, data_folder: DataFolder
) -> None:
    with pytest.raises(ProjectNotFoundError):
        delete_project("missing", repository, data_folder)
