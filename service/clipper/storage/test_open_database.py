import sqlite3
from pathlib import Path

import pytest

from .open_database import MIGRATIONS, open_database, read_schema_version

CREATE_NOTES = "CREATE TABLE notes (body TEXT NOT NULL);"
ADD_AUTHOR = "ALTER TABLE notes ADD COLUMN author TEXT;"
MIGRATIONS_OF_M1 = MIGRATIONS[:2]
MIGRATIONS_OF_M2 = MIGRATIONS[:3]
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
