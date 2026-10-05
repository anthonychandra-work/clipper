import sqlite3
from pathlib import Path

import pytest

from .open_database import MIGRATIONS, open_database, read_schema_version

CREATE_NOTES = "CREATE TABLE notes (body TEXT NOT NULL);"
ADD_AUTHOR = "ALTER TABLE notes ADD COLUMN author TEXT;"


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
