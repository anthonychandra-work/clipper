from dataclasses import replace

import pytest

from ..storage import Database
from .create_project import plan_project
from .project import Platform, Project, SourceKind, Upload
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
