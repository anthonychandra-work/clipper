import sqlite3
from pathlib import Path

import pytest

from .open_database import MIGRATIONS, open_database, read_schema_version

CREATE_NOTES = "CREATE TABLE notes (body TEXT NOT NULL);"
ADD_AUTHOR = "ALTER TABLE notes ADD COLUMN author TEXT;"
MIGRATIONS_OF_M1 = MIGRATIONS[:2]
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
        assert read_schema_version(connection) == 3
    assert tuple(project) == ("a1b2c3", "talk", "fetched")
    assert [tuple(step) for step in steps] == [
        ("a1b2c3", 0, "fetch", "done", 100.0, None),
        ("a1b2c3", 1, "transcribe", "pending", 0.0, None),
    ]


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
