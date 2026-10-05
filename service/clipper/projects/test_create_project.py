import re

import pytest

from ..problems import RefusedError
from ..storage import BYTES_PER_GB, DiskSpace
from .create_project import create_project
from .project import ClipLength, Platform, ProjectStatus, SourceKind, StepKind, StepState
from .project_repository import ProjectRepository
from .project_schemas import CreateProjectRequest

PLENTY = DiskSpace(free_bytes=50 * BYTES_PER_GB, total_bytes=460 * BYTES_PER_GB)
ALL_PLATFORMS = [Platform.TIKTOK, Platform.REELS, Platform.SHORTS]


def link_draft(link: str = "https://www.youtube.com/watch?v=abc123") -> CreateProjectRequest:
    return CreateProjectRequest(source_kind=SourceKind.LINK, link=link, platforms=ALL_PLATFORMS)


def file_draft(name: str = "talk.mp4", size: int = 3_000_000) -> CreateProjectRequest:
    return CreateProjectRequest(
        source_kind=SourceKind.FILE, file_name=name, file_size_bytes=size, platforms=ALL_PLATFORMS
    )


def refusal_of(draft: CreateProjectRequest, repository: ProjectRepository) -> RefusedError:
    with pytest.raises(RefusedError) as raised:
        create_project(draft, repository, PLENTY)
    return raised.value


def test_a_link_project_waits_in_the_queue_under_a_placeholder_title(
    repository: ProjectRepository,
) -> None:
    project = create_project(link_draft(), repository, PLENTY)

    assert project.status is ProjectStatus.QUEUED
    assert project.title == "New video from link"
    assert project.link == "https://www.youtube.com/watch?v=abc123"
    assert project.upload is None
    assert repository.get(project.id) == project


def test_a_file_project_starts_uploading_under_its_file_name(
    repository: ProjectRepository,
) -> None:
    project = create_project(file_draft("interview.mov", 123_456), repository, PLENTY)

    assert project.status is ProjectStatus.UPLOADING
    assert project.title == "interview.mov"
    assert project.source_label == "Uploaded file"
    assert project.upload is not None
    assert (project.upload.size_bytes, project.upload.received_bytes) == (123_456, 0)


def test_a_project_has_four_steps_that_have_not_started(repository: ProjectRepository) -> None:
    project = create_project(link_draft(), repository, PLENTY)

    assert [step.kind for step in project.steps] == [
        StepKind.FETCH,
        StepKind.TRANSCRIBE,
        StepKind.SCORE,
        StepKind.CUT,
    ]
    assert {step.state for step in project.steps} == {StepState.PENDING}
    assert project.percent() == 0


def test_the_first_step_of_a_file_project_runs_while_it_uploads(
    repository: ProjectRepository,
) -> None:
    project = create_project(file_draft(), repository, PLENTY)

    assert project.steps[0].state is StepState.RUNNING
    assert project.label_of(project.steps[0]) == "Uploading video"


def test_the_id_is_safe_for_an_address(repository: ProjectRepository) -> None:
    first = create_project(link_draft(), repository, PLENTY)
    second = create_project(link_draft(), repository, PLENTY)

    assert re.fullmatch(r"[0-9a-f]{12}", first.id)
    assert first.id != second.id


@pytest.mark.parametrize(
    ("link", "label"),
    [
        ("https://www.youtube.com/watch?v=abc123", "YouTube link"),
        ("https://youtu.be/abc123", "YouTube link"),
        ("https://m.youtube.com/watch?v=abc123", "YouTube link"),
        ("http://127.0.0.1:8000/talk.mp4", "Video link"),
        ("https://notyoutube.com/talk.mp4", "Video link"),
    ],
)
def test_the_source_label_names_where_a_link_points(
    repository: ProjectRepository, link: str, label: str
) -> None:
    assert create_project(link_draft(link), repository, PLENTY).source_label == label


def test_the_choices_of_the_draft_are_kept(repository: ProjectRepository) -> None:
    draft = CreateProjectRequest(
        source_kind=SourceKind.LINK,
        link="  https://example.com/talk.mp4  ",
        clip_length=ClipLength.LONG,
        platforms=[Platform.SHORTS, Platform.SHORTS, Platform.TIKTOK],
        brief="  Pricing advice.  ",
    )

    project = create_project(draft, repository, PLENTY)

    assert project.link == "https://example.com/talk.mp4"
    assert project.clip_length is ClipLength.LONG
    assert project.platforms == (Platform.SHORTS, Platform.TIKTOK)
    assert project.brief == "Pricing advice."


@pytest.mark.parametrize("link", ["", "youtube.com/watch", "https://nodots", "ftp://a.b/c"])
def test_a_link_that_is_not_a_link_is_refused_under_the_source(
    repository: ProjectRepository, link: str
) -> None:
    refusal = refusal_of(link_draft(link), repository)

    assert refusal.section == "source"
    assert refusal.message == "Paste the full link, starting with https://"
    assert repository.list_newest_first() == []


@pytest.mark.parametrize(("name", "size"), [("", 100), ("empty.mp4", 0)])
def test_a_missing_file_is_refused_under_the_source(
    repository: ProjectRepository, name: str, size: int
) -> None:
    refusal = refusal_of(file_draft(name, size), repository)

    assert refusal.section == "source"
    assert refusal.message == "Choose a video file first."


def test_no_platform_is_refused_under_the_platforms(repository: ProjectRepository) -> None:
    draft = CreateProjectRequest(source_kind=SourceKind.LINK, link="https://a.example/v")

    refusal = refusal_of(draft, repository)

    assert refusal.section == "platforms"
    assert refusal.message == "Turn on at least one platform."


def test_a_file_over_4_gb_is_refused(repository: ProjectRepository) -> None:
    refusal = refusal_of(file_draft("long.mp4", 4 * BYTES_PER_GB + 1), repository)

    assert refusal.section == "source"
    assert refusal.message == "This file is larger than 4 GB. Choose a smaller one."


def test_a_file_of_exactly_4_gb_is_accepted(repository: ProjectRepository) -> None:
    project = create_project(file_draft("long.mp4", 4 * BYTES_PER_GB), repository, PLENTY)

    assert project.status is ProjectStatus.UPLOADING


def test_a_new_project_is_refused_under_5_gb_free(repository: ProjectRepository) -> None:
    low = DiskSpace(free_bytes=int(3.2 * BYTES_PER_GB), total_bytes=460 * BYTES_PER_GB)

    with pytest.raises(RefusedError) as raised:
        create_project(link_draft(), repository, low)

    assert raised.value.section == "source"
    assert raised.value.message == (
        "Only 3.2 GB is free on this Mac, and a new project needs 5 GB. "
        "Delete a project or free some space."
    )
    assert repository.list_newest_first() == []


def test_the_refusal_never_shows_the_5_gb_it_asks_for(repository: ProjectRepository) -> None:
    almost = DiskSpace(free_bytes=5 * BYTES_PER_GB - 1, total_bytes=460 * BYTES_PER_GB)

    with pytest.raises(RefusedError) as raised:
        create_project(link_draft(), repository, almost)

    assert raised.value.message.startswith("Only 4.9 GB is free on this Mac")


def test_a_new_project_is_accepted_at_exactly_5_gb_free(repository: ProjectRepository) -> None:
    enough = DiskSpace(free_bytes=5 * BYTES_PER_GB, total_bytes=460 * BYTES_PER_GB)

    assert create_project(link_draft(), repository, enough).status is ProjectStatus.QUEUED
