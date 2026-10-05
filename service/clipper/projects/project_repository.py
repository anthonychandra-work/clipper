import json
import sqlite3
from collections import defaultdict
from collections.abc import Iterable

from ..problems import NotFoundError
from ..storage import Database
from .project import (
    ClipLength,
    Platform,
    Project,
    ProjectStatus,
    SourceKind,
    Step,
    StepKind,
    StepState,
    Upload,
)

INSERT_PROJECT = """
INSERT INTO projects (
    id, title, source_kind, source_label, link, file_name, file_size_bytes, received_bytes,
    clip_length, platforms, brief, status, duration_seconds, halt_reason
) VALUES (
    :id, :title, :source_kind, :source_label, :link, :file_name, :file_size_bytes, :received_bytes,
    :clip_length, :platforms, :brief, :status, :duration_seconds, :halt_reason
)
"""
INSERT_STEP = """
INSERT INTO project_steps (project_id, position, kind, state, percent) VALUES (?, ?, ?, ?, ?)
"""


class ProjectNotFoundError(NotFoundError):
    def __init__(self) -> None:
        super().__init__("This project does not exist.")


class ProjectRepository:
    def __init__(self, database: Database) -> None:
        self._database = database

    def add(self, project: Project) -> None:
        with self._database.transaction() as connection:
            connection.execute(INSERT_PROJECT, describe_project_row(project))
            connection.executemany(INSERT_STEP, describe_step_rows(project))

    def list_newest_first(self) -> list[Project]:
        with self._database.transaction() as connection:
            rows = connection.execute("SELECT * FROM projects ORDER BY created_order DESC")
            steps = connection.execute("SELECT * FROM project_steps ORDER BY position")
            steps_by_project = group_steps(steps)
            return [read_project(row, steps_by_project[row["id"]]) for row in rows]

    def find(self, project_id: str) -> Project | None:
        with self._database.transaction() as connection:
            row = connection.execute("SELECT * FROM projects WHERE id = ?", [project_id]).fetchone()
            steps = connection.execute(
                "SELECT * FROM project_steps WHERE project_id = ? ORDER BY position", [project_id]
            )
            return read_project(row, [read_step(step) for step in steps]) if row else None

    def get(self, project_id: str) -> Project:
        project = self.find(project_id)
        if project is None:
            raise ProjectNotFoundError()
        return project

    def delete(self, project_id: str) -> None:
        with self._database.transaction() as connection:
            connection.execute("DELETE FROM projects WHERE id = ?", [project_id])


def describe_project_row(project: Project) -> dict[str, str | int | float | None]:
    upload = project.upload
    return {
        "id": project.id,
        "title": project.title,
        "source_kind": project.source_kind,
        "source_label": project.source_label,
        "link": project.link,
        "file_name": upload.file_name if upload else None,
        "file_size_bytes": upload.size_bytes if upload else None,
        "received_bytes": upload.received_bytes if upload else 0,
        "clip_length": project.clip_length,
        "platforms": json.dumps(project.platforms),
        "brief": project.brief,
        "status": project.status,
        "duration_seconds": project.duration_seconds,
        "halt_reason": project.halt_reason,
    }


def describe_step_rows(project: Project) -> list[tuple[str, int, str, str, float]]:
    return [
        (project.id, position, step.kind, step.state, step.percent)
        for position, step in enumerate(project.steps)
    ]


def group_steps(rows: Iterable[sqlite3.Row]) -> dict[str, list[Step]]:
    steps_by_project: dict[str, list[Step]] = defaultdict(list)
    for row in rows:
        steps_by_project[row["project_id"]].append(read_step(row))
    return steps_by_project


def read_step(row: sqlite3.Row) -> Step:
    return Step(kind=StepKind(row["kind"]), state=StepState(row["state"]), percent=row["percent"])


def read_project(row: sqlite3.Row, steps: list[Step]) -> Project:
    return Project(
        id=row["id"],
        title=row["title"],
        source_kind=SourceKind(row["source_kind"]),
        source_label=row["source_label"],
        link=row["link"],
        clip_length=ClipLength(row["clip_length"]),
        platforms=tuple(Platform(name) for name in json.loads(row["platforms"])),
        brief=row["brief"],
        status=ProjectStatus(row["status"]),
        duration_seconds=row["duration_seconds"],
        steps=tuple(steps),
        halt_reason=row["halt_reason"],
        upload=read_upload(row),
    )


def read_upload(row: sqlite3.Row) -> Upload | None:
    if row["file_name"] is None:
        return None
    return Upload(
        file_name=row["file_name"],
        size_bytes=row["file_size_bytes"],
        received_bytes=row["received_bytes"],
    )
