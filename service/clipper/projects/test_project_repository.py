from dataclasses import replace

import pytest

from ..storage import Database
from .create_project import plan_project
from .project import (
    Platform,
    Project,
    ProjectStatus,
    SourceKind,
    Step,
    StepKind,
    StepState,
    Upload,
)
from .project_repository import ProjectNotFoundError, ProjectRepository
from .project_schemas import CreateProjectRequest


def plan_link_project(title: str) -> Project:
    draft = CreateProjectRequest(
        source_kind=SourceKind.LINK, link="https://example.com/talk.mp4", platforms=[Platform.REELS]
    )
    return replace(plan_project(draft), title=title)


def plan_file_project() -> Project:
    draft = CreateProjectRequest(
        source_kind=SourceKind.FILE,
        file_name="talk.mp4",
        file_size_bytes=4096,
        platforms=[Platform.TIKTOK, Platform.SHORTS],
    )
    return plan_project(draft)


def test_a_stored_project_is_read_back_unchanged(repository: ProjectRepository) -> None:
    project = plan_link_project("Talk")

    repository.add(project)

    assert repository.get(project.id) == project


def test_a_new_project_has_no_candidate_and_a_stored_count_is_read_back(
    repository: ProjectRepository,
) -> None:
    new, selected = plan_link_project("New"), replace(plan_link_project("Ready"), candidate_count=6)

    repository.add(new)
    repository.add(selected)

    assert repository.get(new.id).candidate_count == 0
    assert repository.get(selected.id) == selected
    assert [project.candidate_count for project in repository.list_newest_first()] == [6, 0]


def test_a_new_project_has_no_kept_or_rejected_clip_and_stored_counts_are_read_back(
    repository: ProjectRepository,
) -> None:
    new = plan_link_project("New")
    reviewed = replace(
        plan_link_project("Reviewed"), candidate_count=6, kept_count=2, rejected_count=1
    )

    repository.add(new)
    repository.add(reviewed)

    assert (repository.get(new.id).kept_count, repository.get(new.id).rejected_count) == (0, 0)
    assert repository.get(reviewed.id) == reviewed
    assert [project.kept_count for project in repository.list_newest_first()] == [2, 0]
    assert [project.rejected_count for project in repository.list_newest_first()] == [1, 0]


def test_a_failure_that_points_to_settings_is_read_back_with_its_mark(
    repository: ProjectRepository,
) -> None:
    plain = plan_link_project("Plain")
    marked = replace(
        plan_link_project("Marked"),
        status=ProjectStatus.FAILED,
        halt_reason="No Anthropic API key is saved. Add one in Settings, then retry.",
        halt_opens_settings=True,
    )

    repository.add(plain)
    repository.add(marked)

    assert repository.get(plain.id).halt_opens_settings is False
    assert repository.get(marked.id) == marked
    assert [project.halt_opens_settings for project in repository.list_newest_first()] == [
        True,
        False,
    ]


def test_a_step_with_a_label_of_its_own_is_stored_with_it(repository: ProjectRepository) -> None:
    project = plan_link_project("Talk")
    download = Step(StepKind.MODEL, StepState.PENDING, 0.0, "Downloading Whisper small")
    labelled = replace(project, steps=(project.steps[0], download, *project.steps[1:]))

    repository.add(labelled)

    assert repository.get(labelled.id) == labelled
    assert [step.label for step in repository.get(project.id).steps[2:]] == [None, None, None]


def test_a_file_project_keeps_its_upload(repository: ProjectRepository) -> None:
    project = plan_file_project()

    repository.add(project)

    assert repository.get(project.id).upload == Upload("talk.mp4", 4096, 0)
    assert repository.get(project.id).platforms == (Platform.TIKTOK, Platform.SHORTS)


def test_projects_are_listed_newest_first(repository: ProjectRepository) -> None:
    for title in ["first", "second", "third"]:
        repository.add(plan_link_project(title))

    titles = [project.title for project in repository.list_newest_first()]

    assert titles == ["third", "second", "first"]


def test_each_listed_project_carries_its_own_steps_in_order(repository: ProjectRepository) -> None:
    first, second = plan_link_project("first"), plan_file_project()
    repository.add(first)
    repository.add(second)

    listed = {project.id: project for project in repository.list_newest_first()}

    assert listed[first.id].steps == first.steps
    assert listed[second.id].steps == second.steps


def test_finding_an_unknown_id_returns_nothing(repository: ProjectRepository) -> None:
    assert repository.find("missing") is None


def test_getting_an_unknown_id_raises_not_found(repository: ProjectRepository) -> None:
    with pytest.raises(ProjectNotFoundError) as raised:
        repository.get("missing")

    assert raised.value.status_code == 404


def test_deleting_removes_the_project_and_its_steps(
    repository: ProjectRepository, database: Database
) -> None:
    kept, removed = plan_link_project("kept"), plan_link_project("removed")
    repository.add(kept)
    repository.add(removed)

    repository.delete(removed.id)

    assert [project.id for project in repository.list_newest_first()] == [kept.id]
    with database.transaction() as connection:
        step_owners = connection.execute("SELECT DISTINCT project_id FROM project_steps").fetchall()
    assert [owner["project_id"] for owner in step_owners] == [kept.id]


def test_projects_survive_reopening_the_database(
    repository: ProjectRepository, database: Database
) -> None:
    project = plan_link_project("Talk")
    repository.add(project)

    reopened = ProjectRepository(database)

    assert reopened.get(project.id) == project
