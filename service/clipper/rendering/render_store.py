import sqlite3
from collections.abc import Sequence

from ..storage import Database
from .render_records import QueuedRender, Render, RenderState

QUEUE_CLIP = """
INSERT INTO renders (project_id, clip_id, state, percent, queue_place)
VALUES (
    :project_id, :clip_id, 'waiting', 0, (SELECT COALESCE(MAX(queue_place), 0) + 1 FROM renders)
)
ON CONFLICT (project_id, clip_id) DO UPDATE SET
    state = 'waiting', percent = 0, reason = NULL, queue_place = excluded.queue_place
WHERE renders.state NOT IN ('waiting', 'rendering')
"""
TAKE_OLDEST_WAITING = """
UPDATE renders SET state = 'rendering', percent = 0
WHERE (project_id, clip_id) = (
    SELECT project_id, clip_id FROM renders WHERE state = 'waiting' ORDER BY queue_place LIMIT 1
)
RETURNING project_id, clip_id
"""
RAISE_PERCENT = """
UPDATE renders SET percent = MAX(percent, :percent)
WHERE project_id = :project_id AND clip_id = :clip_id AND state = 'rendering'
"""
MARK_DONE = """
UPDATE renders SET state = 'done', percent = 100, reason = NULL, has_export = 1
WHERE project_id = :project_id AND clip_id = :clip_id
"""
COUNT_EXPORTS = """
UPDATE projects
SET exported_count = (
    SELECT COUNT(*) FROM renders WHERE project_id = :project_id AND has_export = 1
)
WHERE id = :project_id
"""
MARK_EXPORTED = (
    "UPDATE projects SET status = 'exported' WHERE id = :project_id AND status = 'ready'"
)
MARK_FAILED = """
UPDATE renders SET state = 'failed', percent = 0, reason = :reason
WHERE project_id = :project_id AND clip_id = :clip_id
"""
WAITING_OF_THE_PROJECT = "project_id = :project_id AND state = 'waiting'"
THE_QUEUED_CLIP = """
project_id = :project_id AND clip_id = :clip_id AND state IN ('waiting', 'rendering')
"""
RETURN_TO_ITS_EXPORT = """
UPDATE renders SET state = 'done', percent = 100, reason = NULL WHERE has_export = 1 AND
"""
FORGET_WITHOUT_EXPORT = "DELETE FROM renders WHERE has_export = 0 AND "
PUT_BACK_INTERRUPTED = "UPDATE renders SET state = 'waiting', percent = 0 WHERE state = 'rendering'"
LIST_RENDERS = "SELECT * FROM renders WHERE project_id = ?"
COUNT_QUEUED = """
SELECT COUNT(*) FROM renders WHERE project_id = ? AND state IN ('waiting', 'rendering')
"""


class RenderStore:
    def __init__(self, database: Database) -> None:
        self._database = database

    def queue_clips(self, project_id: str, clip_ids: Sequence[str]) -> None:
        with self._database.transaction() as connection:
            for clip_id in clip_ids:
                connection.execute(QUEUE_CLIP, {"project_id": project_id, "clip_id": clip_id})

    def take_oldest_waiting(self) -> QueuedRender | None:
        with self._database.transaction() as connection:
            taken = connection.execute(TAKE_OLDEST_WAITING).fetchall()
            return QueuedRender(taken[0]["project_id"], taken[0]["clip_id"]) if taken else None

    def raise_percent(self, render: QueuedRender, percent: float) -> None:
        with self._database.transaction() as connection:
            connection.execute(RAISE_PERCENT, {**name_render(render), "percent": percent})

    def mark_done(self, render: QueuedRender) -> None:
        with self._database.transaction() as connection:
            for statement in (MARK_DONE, COUNT_EXPORTS, MARK_EXPORTED):
                connection.execute(statement, name_render(render))

    def mark_failed(self, render: QueuedRender, reason: str) -> None:
        with self._database.transaction() as connection:
            connection.execute(MARK_FAILED, {**name_render(render), "reason": reason})

    def cancel_waiting(self, project_id: str) -> None:
        self._leave_queue(WAITING_OF_THE_PROJECT, {"project_id": project_id})

    def take_out(self, render: QueuedRender) -> None:
        self._leave_queue(THE_QUEUED_CLIP, name_render(render))

    def put_back_interrupted(self) -> None:
        with self._database.transaction() as connection:
            connection.execute(PUT_BACK_INTERRUPTED)

    def list_renders(self, project_id: str) -> dict[str, Render]:
        with self._database.transaction() as connection:
            rows = connection.execute(LIST_RENDERS, [project_id])
            return {row["clip_id"]: read_render(row) for row in rows}

    def has_queued_clip(self, project_id: str) -> bool:
        with self._database.transaction() as connection:
            queued: int = connection.execute(COUNT_QUEUED, [project_id]).fetchone()[0]
            return queued > 0

    def _leave_queue(self, leaving: str, named: dict[str, str]) -> None:
        with self._database.transaction() as connection:
            connection.execute(RETURN_TO_ITS_EXPORT + leaving, named)
            connection.execute(FORGET_WITHOUT_EXPORT + leaving, named)


def name_render(render: QueuedRender) -> dict[str, str]:
    return {"project_id": render.project_id, "clip_id": render.clip_id}


def read_render(row: sqlite3.Row) -> Render:
    return Render(
        clip_id=row["clip_id"],
        state=RenderState(row["state"]),
        percent=row["percent"],
        reason=row["reason"],
        queue_place=row["queue_place"],
        has_export=bool(row["has_export"]),
    )
