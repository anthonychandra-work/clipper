from ..storage import Database
from .project import ARRIVAL_SHARE_PERCENT, ProjectStatus, StepKind, StepState

OLDEST_QUEUED = "SELECT id FROM projects WHERE status = 'queued' ORDER BY created_order LIMIT 1"
MARK_PROCESSING = "UPDATE projects SET status = 'processing', halt_reason = NULL WHERE id = ?"
SET_STEP_STATE = "UPDATE project_steps SET state = ? WHERE project_id = ? AND kind = ?"
RAISE_STEP_PERCENT = """
UPDATE project_steps SET percent = MAX(percent, ?)
WHERE project_id = ? AND kind = ? AND state = 'running'
"""
FINISH_STEP = """
UPDATE project_steps SET state = 'done', percent = 100 WHERE project_id = ? AND kind = ?
"""
REST = "UPDATE projects SET status = ? WHERE id = ? AND status = 'processing'"
HALT = "UPDATE projects SET status = ?, halt_reason = ? WHERE id = ?"
REQUEUE = "UPDATE projects SET status = 'queued', halt_reason = NULL WHERE id = ?"
PROCESSING_IDS = "SELECT id FROM projects WHERE status = 'processing' ORDER BY created_order"
RESTART_RUNNING_STEP = """
UPDATE project_steps
SET state = 'pending',
    percent = CASE
        WHEN kind = 'fetch' AND EXISTS (
            SELECT 1 FROM projects WHERE id = project_id AND source_kind = 'file'
        ) THEN ?
        ELSE 0
    END
WHERE project_id = ? AND state = 'running'
"""


class ProjectQueue:
    def __init__(self, database: Database) -> None:
        self._database = database

    def take_oldest_queued(self) -> str | None:
        with self._database.transaction() as connection:
            oldest = connection.execute(OLDEST_QUEUED).fetchone()
            if oldest is None:
                return None
            connection.execute(MARK_PROCESSING, [oldest["id"]])
            return str(oldest["id"])

    def start_step(self, project_id: str, step: StepKind) -> None:
        with self._database.transaction() as connection:
            connection.execute(SET_STEP_STATE, [StepState.RUNNING, project_id, step])

    def raise_step_percent(self, project_id: str, step: StepKind, percent: float) -> None:
        with self._database.transaction() as connection:
            connection.execute(RAISE_STEP_PERCENT, [percent, project_id, step])

    def finish_step(self, project_id: str, step: StepKind) -> None:
        with self._database.transaction() as connection:
            connection.execute(FINISH_STEP, [project_id, step])

    def rest(self, project_id: str, status: ProjectStatus) -> None:
        with self._database.transaction() as connection:
            connection.execute(REST, [status, project_id])

    def halt(self, project_id: str, status: ProjectStatus, reason: str) -> None:
        with self._database.transaction() as connection:
            connection.execute(HALT, [status, reason, project_id])
            connection.execute(RESTART_RUNNING_STEP, [ARRIVAL_SHARE_PERCENT, project_id])

    def requeue(self, project_id: str) -> None:
        with self._database.transaction() as connection:
            connection.execute(REQUEUE, [project_id])
            connection.execute(RESTART_RUNNING_STEP, [ARRIVAL_SHARE_PERCENT, project_id])

    def list_processing(self) -> list[str]:
        with self._database.transaction() as connection:
            return [str(row["id"]) for row in connection.execute(PROCESSING_IDS)]
