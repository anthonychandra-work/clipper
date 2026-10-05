import hashlib
import os
from pathlib import Path

import pytest

from ..storage import BYTES_PER_GB, DataFolder, DiskSpace
from .create_project import create_project
from .project import Platform, Project, ProjectStatus, SourceKind, StepState
from .project_repository import ProjectNotFoundError, ProjectRepository
from .project_schemas import CreateProjectRequest
from .receive_upload import (
    NotUploadingError,
    UploadOutOfStepError,
    UploadPart,
    name_upload_file,
    receive_upload_part,
)

PLENTY = DiskSpace(free_bytes=50 * BYTES_PER_GB, total_bytes=460 * BYTES_PER_GB)


def create_file_project(repository: ProjectRepository, size: int) -> Project:
    draft = CreateProjectRequest(
        source_kind=SourceKind.FILE,
        file_name="talk.mp4",
        file_size_bytes=size,
        platforms=[Platform.REELS],
    )
    return create_project(draft, repository, PLENTY)


def stored_file(data_folder: DataFolder, project: Project) -> Path:
    return data_folder.project_dir(project.id) / "source.mp4"


def test_an_upload_is_appended_part_by_part_with_its_size_intact(
    repository: ProjectRepository, data_folder: DataFolder
) -> None:
    content = os.urandom(2500)
    project = create_file_project(repository, size=len(content))

    counts = [
        receive_upload_part(
            UploadPart(project.id, start, content[start : start + 1000]), repository, data_folder
        )
        for start in range(0, len(content), 1000)
    ]

    assert counts == [1000, 2000, 2500]
    stored = stored_file(data_folder, project).read_bytes()
    assert hashlib.sha256(stored).digest() == hashlib.sha256(content).digest()


def test_the_bytes_held_are_recorded_as_the_first_70_percent_of_the_step(
    repository: ProjectRepository, data_folder: DataFolder
) -> None:
    project = create_file_project(repository, size=2000)

    receive_upload_part(UploadPart(project.id, 0, b"x" * 500), repository, data_folder)

    stored = repository.get(project.id)
    assert stored.upload is not None
    assert stored.upload.received_bytes == 500
    assert stored.steps[0].percent == 17.5
    assert stored.status is ProjectStatus.UPLOADING


def test_the_project_joins_the_queue_when_the_last_part_lands(
    repository: ProjectRepository, data_folder: DataFolder
) -> None:
    project = create_file_project(repository, size=6)

    receive_upload_part(UploadPart(project.id, 0, b"abc"), repository, data_folder)
    receive_upload_part(UploadPart(project.id, 3, b"def"), repository, data_folder)

    stored = repository.get(project.id)
    assert stored.status is ProjectStatus.QUEUED
    assert stored.steps[0].state is StepState.PENDING
    assert stored.steps[0].percent == 70
    assert stored.label_of(stored.steps[0]) == "Preparing video"


@pytest.mark.parametrize("offset", [0, 2, 4, 100])
def test_another_offset_is_refused_with_the_count_held(
    repository: ProjectRepository, data_folder: DataFolder, offset: int
) -> None:
    project = create_file_project(repository, size=10)
    receive_upload_part(UploadPart(project.id, 0, b"abc"), repository, data_folder)

    with pytest.raises(UploadOutOfStepError) as raised:
        receive_upload_part(UploadPart(project.id, offset, b"def"), repository, data_folder)

    assert raised.value.status_code == 409
    assert raised.value.describe()["receivedBytes"] == 3
    assert stored_file(data_folder, project).read_bytes() == b"abc"


def test_a_part_that_would_pass_the_declared_size_is_refused(
    repository: ProjectRepository, data_folder: DataFolder
) -> None:
    project = create_file_project(repository, size=4)

    with pytest.raises(UploadOutOfStepError) as raised:
        receive_upload_part(UploadPart(project.id, 0, b"abcde"), repository, data_folder)

    assert raised.value.received_bytes == 0
    assert not stored_file(data_folder, project).exists()


def test_a_project_that_is_not_uploading_refuses_parts(
    repository: ProjectRepository, data_folder: DataFolder
) -> None:
    project = create_file_project(repository, size=3)
    receive_upload_part(UploadPart(project.id, 0, b"abc"), repository, data_folder)

    with pytest.raises(NotUploadingError) as raised:
        receive_upload_part(UploadPart(project.id, 3, b"d"), repository, data_folder)

    assert raised.value.status_code == 409


def test_a_part_for_an_unknown_project_is_not_found(
    repository: ProjectRepository, data_folder: DataFolder
) -> None:
    with pytest.raises(ProjectNotFoundError):
        receive_upload_part(UploadPart("missing", 0, b"abc"), repository, data_folder)


@pytest.mark.parametrize(
    ("file_name", "stored_name"),
    [
        ("talk.mp4", "source.mp4"),
        ("Interview.MOV", "source.mov"),
        ("no-extension", "source.video"),
        ("../../escape.sh;rm", "source.video"),
        ("archive.tar.gz", "source.gz"),
    ],
)
def test_the_stored_name_never_comes_from_the_name_the_browser_sent(
    file_name: str, stored_name: str
) -> None:
    assert name_upload_file(file_name) == stored_name
