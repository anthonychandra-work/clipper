from ..learning import ClipKey, Outcome, record_outcome, remove_outcome
from ..storage import Database

LIST_VIEWS = "SELECT clip_id, views FROM clip_views WHERE project_id = ?"
SAVE_VIEWS = """
INSERT OR REPLACE INTO clip_views (project_id, clip_id, views)
VALUES (:project_id, :clip_id, :views)
"""
CLEAR_VIEWS = "DELETE FROM clip_views WHERE project_id = :project_id AND clip_id = :clip_id"
COUNT_LOGGED = """
UPDATE projects
SET logged_count = (SELECT COUNT(*) FROM clip_views WHERE project_id = :project_id)
WHERE id = :project_id
"""


class ResultsStore:
    def __init__(self, database: Database) -> None:
        self._database = database

    def list_views(self, project_id: str) -> dict[str, int]:
        with self._database.transaction() as connection:
            rows = connection.execute(LIST_VIEWS, [project_id])
            return {row["clip_id"]: row["views"] for row in rows}

    def save_views(self, outcome: Outcome) -> None:
        named = {**name_clip(outcome.clip), "views": outcome.views}
        with self._database.transaction() as connection:
            connection.execute(SAVE_VIEWS, named)
            connection.execute(COUNT_LOGGED, named)
            record_outcome(connection, outcome)

    def clear_views(self, clip: ClipKey) -> None:
        with self._database.transaction() as connection:
            connection.execute(CLEAR_VIEWS, name_clip(clip))
            connection.execute(COUNT_LOGGED, name_clip(clip))
            remove_outcome(connection, clip)


def name_clip(clip: ClipKey) -> dict[str, str | int]:
    return {"project_id": clip.project_id, "clip_id": clip.clip_id}
