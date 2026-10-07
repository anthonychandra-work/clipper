import sqlite3

from ..storage import Database
from .history_records import (
    LAST_DECISIONS,
    ClipKey,
    Outcome,
    PastDecision,
    RejectionCounts,
    count_rejections,
)

RECORD_DECISION = """
INSERT OR REPLACE INTO decision_history (project_id, clip_id, is_rejection, reject_reason)
VALUES (:project_id, :clip_id, :is_rejection, :reject_reason)
"""
REMOVE_DECISION = (
    "DELETE FROM decision_history WHERE project_id = :project_id AND clip_id = :clip_id"
)
RECORD_OUTCOME = """
INSERT OR REPLACE INTO outcome_history (project_id, clip_id, views, hook_type, seconds)
VALUES (:project_id, :clip_id, :views, :hook_type, :seconds)
"""
REMOVE_OUTCOME = "DELETE FROM outcome_history WHERE project_id = :project_id AND clip_id = :clip_id"
LIST_NEWEST_DECISIONS = "SELECT * FROM decision_history ORDER BY place DESC LIMIT ?"
LIST_OUTCOMES = "SELECT * FROM outcome_history ORDER BY place"


class HistoryStore:
    def __init__(self, database: Database) -> None:
        self._database = database

    def list_newest_decisions(self, limit: int) -> list[PastDecision]:
        with self._database.transaction() as connection:
            rows = connection.execute(LIST_NEWEST_DECISIONS, [limit])
            return [read_decision(row) for row in rows]

    def count_rejections(self) -> RejectionCounts:
        return count_rejections(self.list_newest_decisions(LAST_DECISIONS))

    def list_outcomes(self) -> list[Outcome]:
        with self._database.transaction() as connection:
            return [read_outcome(row) for row in connection.execute(LIST_OUTCOMES)]

    def forget_all(self) -> None:
        with self._database.transaction() as connection:
            connection.execute("DELETE FROM decision_history")
            connection.execute("DELETE FROM outcome_history")


def record_decision(connection: sqlite3.Connection, decision: PastDecision) -> None:
    named = {"is_rejection": decision.is_rejection, "reject_reason": decision.reject_reason}
    connection.execute(RECORD_DECISION, {**name_clip(decision.clip), **named})


def remove_decision(connection: sqlite3.Connection, clip: ClipKey) -> None:
    connection.execute(REMOVE_DECISION, name_clip(clip))


def record_outcome(connection: sqlite3.Connection, outcome: Outcome) -> None:
    named = {"views": outcome.views, "hook_type": outcome.hook_type, "seconds": outcome.seconds}
    connection.execute(RECORD_OUTCOME, {**name_clip(outcome.clip), **named})


def remove_outcome(connection: sqlite3.Connection, clip: ClipKey) -> None:
    connection.execute(REMOVE_OUTCOME, name_clip(clip))


def name_clip(clip: ClipKey) -> dict[str, str]:
    return {"project_id": clip.project_id, "clip_id": clip.clip_id}


def read_decision(row: sqlite3.Row) -> PastDecision:
    return PastDecision(
        clip=ClipKey(row["project_id"], row["clip_id"]),
        is_rejection=bool(row["is_rejection"]),
        reject_reason=row["reject_reason"],
    )


def read_outcome(row: sqlite3.Row) -> Outcome:
    return Outcome(
        clip=ClipKey(row["project_id"], row["clip_id"]),
        views=row["views"],
        hook_type=row["hook_type"],
        seconds=row["seconds"],
    )
