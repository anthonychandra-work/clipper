from ..storage import Database
from .project import ARRIVAL_SHARE_PERCENT, ProjectStatus, StepKind, StepState

OLDEST_QUEUED = "SELECT id FROM projects WHERE status = 'queued' ORDER BY created_order LIMIT 1"
MARK_PROCESSING = """
UPDATE projects SET status = 'processing', halt_reason = NULL, halt_opens_settings = 0
WHERE id = ?
"""
SET_STEP_STATE = "UPDATE project_steps SET state = ? WHERE project_id = ? AND kind = ?"
RAISE_STEP_PERCENT = """
UPDATE project_steps SET percent = MAX(percent, ?)
WHERE project_id = ? AND kind = ? AND state = 'running'
"""
FINISH_STEP = """
UPDATE project_steps SET state = 'done', percent = 100 WHERE project_id = ? AND kind = ?
"""
REST = "UPDATE projects SET status = ? WHERE id = ? AND status = 'processing'"
HALT = "UPDATE projects SET status = ?, halt_reason = ?, halt_opens_settings = ? WHERE id = ?"
REQUEUE = """
UPDATE projects SET status = 'queued', halt_reason = NULL, halt_opens_settings = 0 WHERE id = ?
"""
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
RESET_STEP = """
UPDATE project_steps SET state = 'pending', percent = 0, label = ?
WHERE project_id = ? AND kind = ?
"""
POSITION_OF_STEP = "SELECT position FROM project_steps WHERE project_id = ? AND kind = ?"
# Two rows never share a position: the later steps wait below zero until the new one is in.
MOVE_LATER_STEPS_ASIDE = """
UPDATE project_steps SET position = -(position + 1) WHERE project_id = ? AND position >= ?
"""
INSERT_WAITING_STEP = """
INSERT INTO project_steps (project_id, position, kind, state, percent, label)
VALUES (?, ?, ?, 'pending', 0, ?)
"""
SETTLE_MOVED_STEPS = """
UPDATE project_steps SET position = -position WHERE project_id = ? AND position < 0
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

    def halt(
        self, project_id: str, status: ProjectStatus, reason: str, *, opens_settings: bool = False
    ) -> None:
        with self._database.transaction() as connection:
            connection.execute(HALT, [status, reason, opens_settings, project_id])
            connection.execute(RESTART_RUNNING_STEP, [ARRIVAL_SHARE_PERCENT, project_id])

    def requeue(self, project_id: str) -> None:
        with self._database.transaction() as connection:
            connection.execute(REQUEUE, [project_id])
            connection.execute(RESTART_RUNNING_STEP, [ARRIVAL_SHARE_PERCENT, project_id])

    def list_processing(self) -> list[str]:
        with self._database.transaction() as connection:
            return [str(row["id"]) for row in connection.execute(PROCESSING_IDS)]

    def put_step_ahead(
        self, project_id: str, *, kind: StepKind, label: str, ahead_of: StepKind
    ) -> None:
        with self._database.transaction() as connection:
            if connection.execute(RESET_STEP, [label, project_id, kind]).rowcount > 0:
                return
            found = connection.execute(POSITION_OF_STEP, [project_id, ahead_of]).fetchone()
            if found is None:
                return
            connection.execute(MOVE_LATER_STEPS_ASIDE, [project_id, found["position"]])
            connection.execute(INSERT_WAITING_STEP, [project_id, found["position"], kind, label])
            connection.execute(SETTLE_MOVED_STEPS, [project_id])
