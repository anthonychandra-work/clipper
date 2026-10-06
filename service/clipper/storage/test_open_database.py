import sqlite3
from pathlib import Path

import pytest

from .open_database import MIGRATIONS, open_database, read_schema_version

CREATE_NOTES = "CREATE TABLE notes (body TEXT NOT NULL);"
ADD_AUTHOR = "ALTER TABLE notes ADD COLUMN author TEXT;"
MIGRATIONS_OF_M1 = MIGRATIONS[:2]
MIGRATIONS_OF_M2 = MIGRATIONS[:3]
MIGRATIONS_BEFORE_THE_HALT_MARK = MIGRATIONS[:4]
MIGRATIONS_OF_M3 = MIGRATIONS[:5]
MIGRATIONS_OF_M4 = MIGRATIONS[:6]
READ_M4_ROWS = (
    "SELECT * FROM candidates",
    "SELECT * FROM clip_reviews",
    "SELECT * FROM project_looks",
)
ADD_RENDER = """
INSERT INTO renders (project_id, clip_id, state, percent, queue_place)
VALUES ('d4e5f6', 'c01', 'waiting', 0, 1)
"""
ADD_REVIEW = """
INSERT INTO clip_reviews (
    project_id, clip_id, decision, reject_reason, start_sentence, start_nudge, end_sentence,
    end_nudge
) VALUES ('d4e5f6', 'c01', 'reject', 'cut-off', 4, 0, 12, -2)
"""
ADD_LOOK = """
INSERT INTO project_looks (project_id, caption_style, framing, show_hook_title, show_safe_zones)
VALUES ('d4e5f6', 'plain', 'whole-frame', 0, 1)
"""
ADD_FAILED_PROJECT = """
INSERT INTO projects (
    id, title, source_kind, source_label, clip_length, platforms, brief, status, halt_reason
) VALUES (
    'f7a8b9', 'A talk', 'file', 'Uploaded file', 'standard', '["reels"]', '', 'failed',
    'No Anthropic API key is saved. Add one in Settings, then retry.'
)
"""
ADD_M2_PROJECT = """
INSERT INTO projects (
    id, title, source_kind, source_label, link, clip_length, platforms, brief, status,
    duration_seconds
) VALUES (
    'd4e5f6', 'A talk', 'link', 'Video link', 'https://example.com/talk.mp4', 'standard',
    '["reels"]', 'Advice a shop owner can use.', 'transcribed', 235.7
)
"""
ADD_M2_STEPS = """
INSERT INTO project_steps (project_id, position, kind, state, percent, label)
VALUES
    ('d4e5f6', 0, 'fetch', 'done', 100, NULL),
    ('d4e5f6', 1, 'model', 'done', 100, 'Downloading Whisper small'),
    ('d4e5f6', 2, 'transcribe', 'done', 100, NULL),
    ('d4e5f6', 3, 'score', 'pending', 0, NULL)
"""
ADD_WINDOW = """
INSERT INTO selection_windows (
    project_id, id, first_sentence, last_sentence, start_seconds, end_seconds, score,
    is_shortlisted
) VALUES ('d4e5f6', 'w01', 1, 23, 0, 89.92, 72, 1)
"""
ADD_PEAK = """
INSERT INTO replay_peaks (project_id, start_seconds, end_seconds) VALUES ('d4e5f6', 120.2, 160.3)
"""
ADD_CANDIDATE = """
INSERT INTO candidates (
    project_id, id, rank, start_seconds, end_seconds, hook_score, arc_score, value_score,
    share_score, reason, title, hook_title, hook_type, platforms, is_replay_peak
) VALUES (
    'd4e5f6', 'c01', 1, 11.94, 44.7, 23, 23, 20, 22, 'A whole story.', 'The worst day',
    'The oven broke before sunrise', 'story', '{}', 0
)
"""
ADD_M1_PROJECT = """
INSERT INTO projects (id, title, source_kind, source_label, clip_length, platforms, brief, status)
VALUES ('a1b2c3', 'talk', 'link', 'Video link', 'standard', '["reels"]', '', 'fetched')
"""
ADD_M1_STEPS = """
INSERT INTO project_steps (project_id, position, kind, state, percent)
VALUES ('a1b2c3', 0, 'fetch', 'done', 100), ('a1b2c3', 1, 'transcribe', 'pending', 0)
"""


def test_opening_creates_the_database_file_in_wal_mode(tmp_path: Path) -> None:
    database_file = tmp_path / "clipper.sqlite3"

    database = open_database(database_file)

    assert database_file.is_file()
    with database.transaction() as connection:
        assert connection.execute("PRAGMA journal_mode").fetchone()[0] == "wal"


def test_a_new_database_holds_the_project_tables_at_the_current_version(tmp_path: Path) -> None:
    database = open_database(tmp_path / "clipper.sqlite3")

    with database.transaction() as connection:
        tables = connection.execute("SELECT name FROM sqlite_master WHERE type = 'table'")
        names = {table["name"] for table in tables}
        assert {"projects", "project_steps", "preferences"} <= names
        assert read_schema_version(connection) == len(MIGRATIONS)


def test_a_database_made_by_m1_gains_the_step_label_and_keeps_its_projects(tmp_path: Path) -> None:
    database_file = tmp_path / "clipper.sqlite3"
    with open_database(database_file, MIGRATIONS_OF_M1).transaction() as connection:
        connection.execute(ADD_M1_PROJECT)
        connection.execute(ADD_M1_STEPS)

    database = open_database(database_file)

    with database.transaction() as connection:
        project = connection.execute("SELECT id, title, status FROM projects").fetchone()
        steps = connection.execute("SELECT * FROM project_steps ORDER BY position").fetchall()
        assert read_schema_version(connection) == len(MIGRATIONS)
    assert tuple(project) == ("a1b2c3", "talk", "fetched")
    assert [tuple(step) for step in steps] == [
        ("a1b2c3", 0, "fetch", "done", 100.0, None),
        ("a1b2c3", 1, "transcribe", "pending", 0.0, None),
    ]


def test_a_database_made_by_m2_gains_the_selection_tables_and_keeps_its_projects(
    tmp_path: Path,
) -> None:
    database_file = tmp_path / "clipper.sqlite3"
    with open_database(database_file, MIGRATIONS_OF_M2).transaction() as connection:
        connection.execute(ADD_M2_PROJECT)
        connection.execute(ADD_M2_STEPS)
        before = [tuple(row) for row in connection.execute("SELECT * FROM projects")]

    database = open_database(database_file)

    with database.transaction() as connection:
        projects = [tuple(row) for row in connection.execute("SELECT * FROM projects")]
        steps = connection.execute("SELECT * FROM project_steps ORDER BY position").fetchall()
        tables = connection.execute("SELECT name FROM sqlite_master WHERE type = 'table'")
        names = {table["name"] for table in tables}
    assert [project[: len(before[0])] for project in projects] == before
    assert [project[len(before[0])] for project in projects] == [0]
    assert [tuple(step) for step in steps] == [
        ("d4e5f6", 0, "fetch", "done", 100.0, None),
        ("d4e5f6", 1, "model", "done", 100.0, "Downloading Whisper small"),
        ("d4e5f6", 2, "transcribe", "done", 100.0, None),
        ("d4e5f6", 3, "score", "pending", 0.0, None),
    ]
    assert {"selection_windows", "replay_peaks", "candidates"} <= names


def test_a_database_made_before_the_halt_mark_keeps_its_projects_and_marks_none(
    tmp_path: Path,
) -> None:
    database_file = tmp_path / "clipper.sqlite3"
    earlier = open_database(database_file, MIGRATIONS_BEFORE_THE_HALT_MARK)
    with earlier.transaction() as connection:
        connection.execute(ADD_FAILED_PROJECT)
        before = [tuple(row) for row in connection.execute("SELECT * FROM projects")]

    database = open_database(database_file)

    with database.transaction() as connection:
        projects = connection.execute("SELECT * FROM projects").fetchall()
        assert read_schema_version(connection) == len(MIGRATIONS)
    assert [tuple(project)[: len(before[0])] for project in projects] == before
    assert [project["halt_opens_settings"] for project in projects] == [0]


def test_the_rows_of_the_selection_tables_go_with_their_project(tmp_path: Path) -> None:
    database = open_database(tmp_path / "clipper.sqlite3")
    with database.transaction() as connection:
        connection.execute(ADD_M2_PROJECT)
        connection.execute(ADD_WINDOW)
        connection.execute(ADD_PEAK)
        connection.execute(ADD_CANDIDATE)

    with database.transaction() as connection:
        connection.execute("DELETE FROM projects WHERE id = 'd4e5f6'")

    with database.transaction() as connection:
        for table in ("selection_windows", "replay_peaks", "candidates"):
            assert connection.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0] == 0


def test_a_database_made_by_m3_keeps_its_projects_and_candidates_and_counts_no_decision(
    tmp_path: Path,
) -> None:
    database_file = tmp_path / "clipper.sqlite3"
    with open_database(database_file, MIGRATIONS_OF_M3).transaction() as connection:
        connection.execute(ADD_M2_PROJECT)
        connection.execute(ADD_WINDOW)
        connection.execute(ADD_CANDIDATE)
        connection.execute("UPDATE projects SET candidate_count = 1, status = 'ready'")
        projects_before = [tuple(row) for row in connection.execute("SELECT * FROM projects")]
        candidates_before = [tuple(row) for row in connection.execute("SELECT * FROM candidates")]

    database = open_database(database_file)

    with database.transaction() as connection:
        projects = connection.execute("SELECT * FROM projects").fetchall()
        candidates = [tuple(row) for row in connection.execute("SELECT * FROM candidates")]
        reviews = connection.execute("SELECT COUNT(*) FROM clip_reviews").fetchone()[0]
        looks = connection.execute("SELECT COUNT(*) FROM project_looks").fetchone()[0]
        assert read_schema_version(connection) == len(MIGRATIONS)
    assert [tuple(project)[: len(projects_before[0])] for project in projects] == projects_before
    assert [(project["kept_count"], project["rejected_count"]) for project in projects] == [(0, 0)]
    assert candidates == candidates_before
    assert (reviews, looks) == (0, 0)


def test_a_review_goes_with_its_candidate_and_a_look_with_its_project(tmp_path: Path) -> None:
    database = open_database(tmp_path / "clipper.sqlite3")
    with database.transaction() as connection:
        for added in (ADD_M2_PROJECT, ADD_CANDIDATE, ADD_REVIEW, ADD_LOOK):
            connection.execute(added)

    with database.transaction() as connection:
        connection.execute("DELETE FROM candidates WHERE project_id = 'd4e5f6'")
        reviews_without_candidate = connection.execute("SELECT COUNT(*) FROM clip_reviews")
        looks_without_candidate = connection.execute("SELECT COUNT(*) FROM project_looks")
        counts = (reviews_without_candidate.fetchone()[0], looks_without_candidate.fetchone()[0])
        connection.execute("DELETE FROM projects WHERE id = 'd4e5f6'")
        looks_without_project = connection.execute("SELECT COUNT(*) FROM project_looks")

        assert counts == (0, 1)
        assert looks_without_project.fetchone()[0] == 0


def test_a_review_of_a_clip_that_is_not_a_candidate_cannot_be_stored(tmp_path: Path) -> None:
    database = open_database(tmp_path / "clipper.sqlite3")
    with database.transaction() as connection:
        connection.execute(ADD_M2_PROJECT)

    with pytest.raises(sqlite3.IntegrityError), database.transaction() as connection:
        connection.execute(ADD_REVIEW)


def test_a_database_made_by_m4_keeps_its_projects_candidates_and_reviews_and_counts_no_export(
    tmp_path: Path,
) -> None:
    database_file = tmp_path / "clipper.sqlite3"
    with open_database(database_file, MIGRATIONS_OF_M4).transaction() as connection:
        for added in (ADD_M2_PROJECT, ADD_CANDIDATE, ADD_REVIEW, ADD_LOOK):
            connection.execute(added)
        connection.execute("UPDATE projects SET candidate_count = 1, rejected_count = 1")
        projects_before = [tuple(row) for row in connection.execute("SELECT * FROM projects")]
        kept_before = [[tuple(row) for row in connection.execute(read)] for read in READ_M4_ROWS]

    database = open_database(database_file)

    with database.transaction() as connection:
        projects = connection.execute("SELECT * FROM projects").fetchall()
        kept = [[tuple(row) for row in connection.execute(read)] for read in READ_M4_ROWS]
        renders = connection.execute("SELECT COUNT(*) FROM renders").fetchone()[0]
        assert read_schema_version(connection) == len(MIGRATIONS) == 7
    assert [tuple(project)[: len(projects_before[0])] for project in projects] == projects_before
    assert [project["exported_count"] for project in projects] == [0]
    assert kept == kept_before
    assert [len(rows) for rows in kept] == [1, 1, 1]
    assert renders == 0


def test_a_render_goes_with_its_candidate(tmp_path: Path) -> None:
    database = open_database(tmp_path / "clipper.sqlite3")
    with database.transaction() as connection:
        for added in (ADD_M2_PROJECT, ADD_CANDIDATE, ADD_RENDER):
            connection.execute(added)

    with database.transaction() as connection:
        stored = connection.execute("SELECT * FROM renders").fetchall()
        connection.execute("DELETE FROM candidates WHERE project_id = 'd4e5f6'")
        left = connection.execute("SELECT COUNT(*) FROM renders").fetchone()[0]

    assert [tuple(render) for render in stored] == [("d4e5f6", "c01", "waiting", 0.0, None, 1, 0)]
    assert left == 0


def test_a_render_of_a_clip_that_is_not_a_candidate_cannot_be_stored(tmp_path: Path) -> None:
    database = open_database(tmp_path / "clipper.sqlite3")
    with database.transaction() as connection:
        connection.execute(ADD_M2_PROJECT)

    with pytest.raises(sqlite3.IntegrityError), database.transaction() as connection:
        connection.execute(ADD_RENDER)


def test_the_schema_version_counts_the_migrations_applied(tmp_path: Path) -> None:
    database = open_database(tmp_path / "clipper.sqlite3", [CREATE_NOTES])

    with database.transaction() as connection:
        assert read_schema_version(connection) == 1


def test_a_later_migration_raises_the_version_and_keeps_the_rows(tmp_path: Path) -> None:
    database_file = tmp_path / "clipper.sqlite3"
    with open_database(database_file, [CREATE_NOTES]).transaction() as connection:
        connection.execute("INSERT INTO notes (body) VALUES ('kept')")

    database = open_database(database_file, [CREATE_NOTES, ADD_AUTHOR])

    with database.transaction() as connection:
        assert read_schema_version(connection) == 2
        assert connection.execute("SELECT body, author FROM notes").fetchone()["body"] == "kept"


def test_a_migration_that_fails_leaves_the_version_where_it_was(tmp_path: Path) -> None:
    database_file = tmp_path / "clipper.sqlite3"
    open_database(database_file, [CREATE_NOTES])

    with pytest.raises(sqlite3.OperationalError):
        open_database(database_file, [CREATE_NOTES, "ALTER TABLE missing ADD COLUMN author TEXT;"])

    with open_database(database_file, [CREATE_NOTES]).transaction() as connection:
        assert read_schema_version(connection) == 1


def test_a_transaction_that_fails_changes_nothing(tmp_path: Path) -> None:
    database = open_database(tmp_path / "clipper.sqlite3", [CREATE_NOTES])

    with pytest.raises(sqlite3.IntegrityError), database.transaction() as connection:
        connection.execute("INSERT INTO notes (body) VALUES ('first')")
        connection.execute("INSERT INTO notes (body) VALUES (NULL)")

    with database.transaction() as connection:
        assert connection.execute("SELECT COUNT(*) FROM notes").fetchone()[0] == 0
