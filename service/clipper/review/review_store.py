import sqlite3

from ..storage import Database
from .review_records import (
    STARTING_LOOK,
    CaptionStyle,
    ClipPoint,
    ClipReview,
    Decision,
    Framing,
    Look,
    RejectReason,
)

LIST_REVIEWS = "SELECT * FROM clip_reviews WHERE project_id = ?"
SAVE_REVIEW = """
INSERT OR REPLACE INTO clip_reviews (
    project_id, clip_id, decision, reject_reason, title, start_sentence, start_nudge,
    end_sentence, end_nudge
) VALUES (
    :project_id, :clip_id, :decision, :reject_reason, :title, :start_sentence, :start_nudge,
    :end_sentence, :end_nudge
)
"""
COUNT_DECISIONS = """
UPDATE projects
SET kept_count = (
        SELECT COUNT(*) FROM clip_reviews WHERE project_id = :project_id AND decision = 'keep'
    ),
    rejected_count = (
        SELECT COUNT(*) FROM clip_reviews WHERE project_id = :project_id AND decision = 'reject'
    )
WHERE id = :project_id
"""
READ_LOOK = "SELECT * FROM project_looks WHERE project_id = ?"
SAVE_LOOK = """
INSERT OR REPLACE INTO project_looks (
    project_id, caption_style, framing, show_hook_title, show_safe_zones
) VALUES (?, ?, ?, ?, ?)
"""


class ReviewStore:
    def __init__(self, database: Database) -> None:
        self._database = database

    def list_reviews(self, project_id: str) -> dict[str, ClipReview]:
        with self._database.transaction() as connection:
            rows = connection.execute(LIST_REVIEWS, [project_id])
            return {row["clip_id"]: read_review(row) for row in rows}

    def save_review(self, project_id: str, clip_id: str, review: ClipReview) -> None:
        row = describe_review_row(project_id, clip_id, review)
        with self._database.transaction() as connection:
            connection.execute(SAVE_REVIEW, row)
            connection.execute(COUNT_DECISIONS, {"project_id": project_id})

    def read_look(self, project_id: str) -> Look:
        with self._database.transaction() as connection:
            row = connection.execute(READ_LOOK, [project_id]).fetchone()
            return read_look_row(row) if row else STARTING_LOOK

    def save_look(self, project_id: str, look: Look) -> None:
        row = (
            project_id,
            look.caption_style,
            look.framing,
            look.show_hook_title,
            look.show_safe_zones,
        )
        with self._database.transaction() as connection:
            connection.execute(SAVE_LOOK, row)


def describe_review_row(
    project_id: str, clip_id: str, review: ClipReview
) -> dict[str, str | int | None]:
    return {
        "project_id": project_id,
        "clip_id": clip_id,
        "decision": review.decision,
        "reject_reason": review.reject_reason,
        "title": review.title,
        "start_sentence": review.start.sentence,
        "start_nudge": review.start.nudge,
        "end_sentence": review.end.sentence,
        "end_nudge": review.end.nudge,
    }


def read_review(row: sqlite3.Row) -> ClipReview:
    return ClipReview(
        start=ClipPoint(row["start_sentence"], row["start_nudge"]),
        end=ClipPoint(row["end_sentence"], row["end_nudge"]),
        decision=Decision(row["decision"]),
        reject_reason=RejectReason(row["reject_reason"]) if row["reject_reason"] else None,
        title=row["title"],
    )


def read_look_row(row: sqlite3.Row) -> Look:
    return Look(
        caption_style=CaptionStyle(row["caption_style"]),
        framing=Framing(row["framing"]),
        show_hook_title=bool(row["show_hook_title"]),
        show_safe_zones=bool(row["show_safe_zones"]),
    )
