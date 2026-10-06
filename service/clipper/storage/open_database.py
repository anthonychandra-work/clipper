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

CREATE_PREFERENCES = """
CREATE TABLE preferences (
    name TEXT PRIMARY KEY,
    choice TEXT NOT NULL
);
"""

ADD_STEP_LABEL = "ALTER TABLE project_steps ADD COLUMN label TEXT;"

CREATE_SELECTION = """
CREATE TABLE selection_windows (
    project_id TEXT NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    id TEXT NOT NULL,
    first_sentence INTEGER NOT NULL,
    last_sentence INTEGER NOT NULL,
    start_seconds REAL NOT NULL,
    end_seconds REAL NOT NULL,
    score INTEGER NOT NULL,
    is_shortlisted INTEGER NOT NULL,
    PRIMARY KEY (project_id, id)
);
CREATE TABLE replay_peaks (
    project_id TEXT NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    start_seconds REAL NOT NULL,
    end_seconds REAL NOT NULL,
    PRIMARY KEY (project_id, start_seconds)
);
CREATE TABLE candidates (
    project_id TEXT NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    id TEXT NOT NULL,
    rank INTEGER NOT NULL,
    start_seconds REAL NOT NULL,
    end_seconds REAL NOT NULL,
    hook_score INTEGER NOT NULL,
    arc_score INTEGER NOT NULL,
    value_score INTEGER NOT NULL,
    share_score INTEGER NOT NULL,
    reason TEXT NOT NULL,
    title TEXT NOT NULL,
    hook_title TEXT NOT NULL,
    hook_type TEXT NOT NULL,
    platforms TEXT NOT NULL,
    flag TEXT,
    flag_note TEXT,
    is_replay_peak INTEGER NOT NULL,
    PRIMARY KEY (project_id, id)
);
ALTER TABLE projects ADD COLUMN candidate_count INTEGER NOT NULL DEFAULT 0;
"""

ADD_HALT_MARK = "ALTER TABLE projects ADD COLUMN halt_opens_settings INTEGER NOT NULL DEFAULT 0;"

CREATE_REVIEW = """
CREATE TABLE clip_reviews (
    project_id TEXT NOT NULL,
    clip_id TEXT NOT NULL,
    decision TEXT NOT NULL,
    reject_reason TEXT,
    title TEXT,
    start_sentence INTEGER NOT NULL,
    start_nudge INTEGER NOT NULL,
    end_sentence INTEGER NOT NULL,
    end_nudge INTEGER NOT NULL,
    PRIMARY KEY (project_id, clip_id),
    FOREIGN KEY (project_id, clip_id) REFERENCES candidates (project_id, id) ON DELETE CASCADE
);
CREATE TABLE project_looks (
    project_id TEXT PRIMARY KEY REFERENCES projects (id) ON DELETE CASCADE,
    caption_style TEXT NOT NULL,
    framing TEXT NOT NULL,
    show_hook_title INTEGER NOT NULL,
    show_safe_zones INTEGER NOT NULL
);
ALTER TABLE projects ADD COLUMN kept_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE projects ADD COLUMN rejected_count INTEGER NOT NULL DEFAULT 0;
"""

CREATE_RENDERS = """
CREATE TABLE renders (
    project_id TEXT NOT NULL,
    clip_id TEXT NOT NULL,
    state TEXT NOT NULL,
    percent REAL NOT NULL,
    reason TEXT,
    queue_place INTEGER NOT NULL,
    has_export INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (project_id, clip_id),
    FOREIGN KEY (project_id, clip_id) REFERENCES candidates (project_id, id) ON DELETE CASCADE
);
ALTER TABLE projects ADD COLUMN exported_count INTEGER NOT NULL DEFAULT 0;
"""

CREATE_HISTORY = """
CREATE TABLE decision_history (
    place INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT NOT NULL,
    clip_id TEXT NOT NULL,
    is_rejection INTEGER NOT NULL,
    reject_reason TEXT,
    UNIQUE (project_id, clip_id)
);
CREATE TABLE outcome_history (
    place INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT NOT NULL,
    clip_id TEXT NOT NULL,
    views INTEGER NOT NULL,
    hook_type TEXT NOT NULL,
    seconds REAL NOT NULL,
    UNIQUE (project_id, clip_id)
);
INSERT INTO decision_history (project_id, clip_id, is_rejection, reject_reason)
SELECT project_id, clip_id, decision = 'reject', reject_reason
FROM clip_reviews
WHERE decision IN ('keep', 'reject')
ORDER BY rowid;
"""

MIGRATIONS: tuple[str, ...] = (
    CREATE_PROJECTS,
    CREATE_PREFERENCES,
    ADD_STEP_LABEL,
    CREATE_SELECTION,
    ADD_HALT_MARK,
    CREATE_REVIEW,
    CREATE_RENDERS,
    CREATE_HISTORY,
)


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
