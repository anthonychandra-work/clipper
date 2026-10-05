import sqlite3
from collections.abc import Iterator, Sequence
from contextlib import closing, contextmanager
from pathlib import Path

BUSY_TIMEOUT_SECONDS = 10.0
MIGRATIONS: tuple[str, ...] = ()


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
