import pytest

from ..storage import BYTES_PER_GB, DataFolder, DiskSpace
from .create_project import create_project
from .delete_project import delete_project
from .project import Platform, Project, ProjectStatus, SourceKind
from .project_queue import ProjectQueue
from .project_repository import ProjectNotFoundError, ProjectRepository
from .project_schemas import CreateProjectRequest

PLENTY = DiskSpace(free_bytes=50 * BYTES_PER_GB, total_bytes=460 * BYTES_PER_GB)


def create_link_project(repository: ProjectRepository) -> Project:
    draft = CreateProjectRequest(
        source_kind=SourceKind.LINK, link="https://example.com/talk.mp4", platforms=[Platform.REELS]
    )
    return create_project(draft, repository, PLENTY)


def stop_nothing(project_id: str) -> None:
    del project_id


def refuse_to_stop(project_id: str) -> None:
    raise AssertionError(f"Project {project_id} does not exist and must not be stopped.")


def test_delete_removes_the_files_of_the_project(
    repository: ProjectRepository, data_folder: DataFolder
) -> None:
    project = create_link_project(repository)
    project_dir = data_folder.project_dir(project.id)
    project_dir.mkdir()
    (project_dir / "source.mp4").write_bytes(b"video")
    (project_dir / "preview.mp4").write_bytes(b"preview")

    delete_project(project.id, repository, data_folder, stop_nothing)

    assert not project_dir.exists()
    assert repository.find(project.id) is None


def test_delete_removes_the_exports_of_the_project_with_its_folder(
    repository: ProjectRepository, data_folder: DataFolder
) -> None:
    project = create_link_project(repository)
    export = data_folder.export_file(project.id, 1, "c01")
    export.parent.mkdir(parents=True)
    export.write_bytes(b"a finished clip")

    delete_project(project.id, repository, data_folder, stop_nothing)

    assert not export.exists()
    assert not data_folder.project_dir(project.id).exists()


def test_delete_leaves_the_other_projects_alone(
    repository: ProjectRepository, data_folder: DataFolder
) -> None:
    kept, removed = create_link_project(repository), create_link_project(repository)
    kept_dir = data_folder.project_dir(kept.id)
    kept_dir.mkdir()
    (kept_dir / "source.mp4").write_bytes(b"video")

    delete_project(removed.id, repository, data_folder, stop_nothing)

    assert (kept_dir / "source.mp4").read_bytes() == b"video"
    assert repository.get(kept.id) == kept


def test_delete_works_for_a_project_that_has_no_files_yet(
    repository: ProjectRepository, data_folder: DataFolder
) -> None:
    project = create_link_project(repository)

    delete_project(project.id, repository, data_folder, stop_nothing)

    assert repository.find(project.id) is None


@pytest.mark.parametrize(
    "status", [ProjectStatus.PROCESSING, ProjectStatus.READY, ProjectStatus.EXPORTED]
)
def test_the_work_of_a_project_is_stopped_before_its_files_are_removed_whatever_its_status(
    status: ProjectStatus,
    repository: ProjectRepository,
    data_folder: DataFolder,
    queue: ProjectQueue,
) -> None:
    project = create_link_project(repository)
    project_dir = data_folder.project_dir(project.id)
    project_dir.mkdir()
    queue.take_oldest_queued()
    queue.rest(project.id, status)
    files_when_stopped: list[bool] = []

    def record_stop(project_id: str) -> None:
        assert project_id == project.id
        files_when_stopped.append(project_dir.exists())

    delete_project(project.id, repository, data_folder, record_stop)

    assert files_when_stopped == [True]
    assert not project_dir.exists()


def test_deleting_an_unknown_project_raises_not_found(
    repository: ProjectRepository, data_folder: DataFolder
) -> None:
    with pytest.raises(ProjectNotFoundError):
        delete_project("missing", repository, data_folder, refuse_to_stop)
