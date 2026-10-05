import sqlite3
from collections.abc import Iterator, Sequence
from contextlib import closing, contextmanager
from pathlib import Path

BUSY_TIMEOUT_SECONDS = 10.0

CREATE_PROJECTS = """
CREATE TABLE projects (
    created_order INTEGER PRIMARY KEY AUTOINCREMENT,
    id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    source_kind TEXT NOT NULL,
    source_label TEXT NOT NULL,
    link TEXT,
    file_name TEXT,
    file_size_bytes INTEGER,
    received_bytes INTEGER NOT NULL DEFAULT 0,
    clip_length TEXT NOT NULL,
    platforms TEXT NOT NULL,
    brief TEXT NOT NULL,
    status TEXT NOT NULL,
    duration_seconds REAL,
    halt_reason TEXT
);
CREATE TABLE project_steps (
    project_id TEXT NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    kind TEXT NOT NULL,
    state TEXT NOT NULL,
    percent REAL NOT NULL,
    PRIMARY KEY (project_id, position)
);
"""

MIGRATIONS: tuple[str, ...] = (CREATE_PROJECTS,)


class Database:
    def __init__(self, database_file: Path) -> None:
        self._database_file = database_file

    @contextmanager
    def transaction(self) -> Iterator[sqlite3.Connection]:
        with closing(self._connect()) as connection, connection:
            yield connection

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self._database_file, timeout=BUSY_TIMEOUT_SECONDS)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON")
        return connection


def open_database(database_file: Path, migrations: Sequence[str] = MIGRATIONS) -> Database:
    with closing(sqlite3.connect(database_file)) as connection:
        connection.execute("PRAGMA journal_mode = WAL")
        raise_schema_version(connection, migrations)
    return Database(database_file)


def raise_schema_version(connection: sqlite3.Connection, migrations: Sequence[str]) -> None:
    applied = read_schema_version(connection)
    for version in range(applied + 1, len(migrations) + 1):
        step = migrations[version - 1]
        connection.executescript(f"BEGIN;\n{step}\nPRAGMA user_version = {version};\nCOMMIT;")


def read_schema_version(connection: sqlite3.Connection) -> int:
    version: int = connection.execute("PRAGMA user_version").fetchone()[0]
    return version
