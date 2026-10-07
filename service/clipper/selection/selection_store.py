import json
import sqlite3
from collections.abc import Sequence
from dataclasses import asdict

from ..storage import Database
from .selection_records import (
    Candidate,
    ClipFlag,
    HookType,
    PlatformText,
    PlatformTexts,
    ReplayPeak,
    Subscores,
    WindowRecord,
)
from .split_windows import Window

DELETE_WINDOWS = "DELETE FROM selection_windows WHERE project_id = ?"
INSERT_WINDOW = """
INSERT INTO selection_windows (
    project_id, id, first_sentence, last_sentence, start_seconds, end_seconds, score,
    is_shortlisted
) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
"""
LIST_WINDOWS = "SELECT * FROM selection_windows WHERE project_id = ? ORDER BY start_seconds"
DELETE_CANDIDATES = "DELETE FROM candidates WHERE project_id = ?"
INSERT_CANDIDATE = """
INSERT INTO candidates (
    project_id, id, rank, start_seconds, end_seconds, hook_score, arc_score, value_score,
    share_score, reason, title, hook_title, hook_type, platforms, flag, flag_note, is_replay_peak
) VALUES (
    :project_id, :id, :rank, :start_seconds, :end_seconds, :hook_score, :arc_score, :value_score,
    :share_score, :reason, :title, :hook_title, :hook_type, :platforms, :flag, :flag_note,
    :is_replay_peak
)
"""
LIST_CANDIDATES = "SELECT * FROM candidates WHERE project_id = ? ORDER BY rank"
DELETE_PEAKS = "DELETE FROM replay_peaks WHERE project_id = ?"
INSERT_PEAK = "INSERT INTO replay_peaks (project_id, start_seconds, end_seconds) VALUES (?, ?, ?)"
LIST_PEAKS = "SELECT * FROM replay_peaks WHERE project_id = ? ORDER BY start_seconds"
# Deleting a candidate removes its review with it, so no clip of the new cut is kept or rejected.
SET_COUNTS_OF_NEW_CUT = """
UPDATE projects SET candidate_count = ?, kept_count = 0, rejected_count = 0 WHERE id = ?
"""


class SelectionStore:
    def __init__(self, database: Database) -> None:
        self._database = database

    def replace_windows(self, project_id: str, windows: Sequence[WindowRecord]) -> None:
        rows = [describe_window_row(project_id, record) for record in windows]
        with self._database.transaction() as connection:
            connection.execute(DELETE_WINDOWS, [project_id])
            connection.executemany(INSERT_WINDOW, rows)

    def list_windows(self, project_id: str) -> list[WindowRecord]:
        with self._database.transaction() as connection:
            return [read_window(row) for row in connection.execute(LIST_WINDOWS, [project_id])]

    def replace_candidates(
        self, project_id: str, candidates: Sequence[Candidate], peaks: Sequence[ReplayPeak]
    ) -> None:
        candidate_rows = [describe_candidate_row(project_id, candidate) for candidate in candidates]
        peak_rows = [(project_id, peak.start_seconds, peak.end_seconds) for peak in peaks]
        with self._database.transaction() as connection:
            connection.execute(DELETE_CANDIDATES, [project_id])
            connection.execute(DELETE_PEAKS, [project_id])
            connection.executemany(INSERT_CANDIDATE, candidate_rows)
            connection.executemany(INSERT_PEAK, peak_rows)
            connection.execute(SET_COUNTS_OF_NEW_CUT, [len(candidate_rows), project_id])

    def list_candidates(self, project_id: str) -> list[Candidate]:
        with self._database.transaction() as connection:
            rows = connection.execute(LIST_CANDIDATES, [project_id])
            return [read_candidate(row) for row in rows]

    def list_peaks(self, project_id: str) -> list[ReplayPeak]:
        with self._database.transaction() as connection:
            rows = connection.execute(LIST_PEAKS, [project_id])
            return [ReplayPeak(row["start_seconds"], row["end_seconds"]) for row in rows]


def describe_window_row(
    project_id: str, record: WindowRecord
) -> tuple[str, str, int, int, float, float, int, bool]:
    window = record.window
    return (
        project_id,
        window.id,
        window.first_sentence,
        window.last_sentence,
        window.start_seconds,
        window.end_seconds,
        record.score,
        record.is_shortlisted,
    )


def read_window(row: sqlite3.Row) -> WindowRecord:
    window = Window(
        id=row["id"],
        first_sentence=row["first_sentence"],
        last_sentence=row["last_sentence"],
        start_seconds=row["start_seconds"],
        end_seconds=row["end_seconds"],
    )
    return WindowRecord(window, score=row["score"], is_shortlisted=bool(row["is_shortlisted"]))


def describe_candidate_row(
    project_id: str, candidate: Candidate
) -> dict[str, str | int | float | None]:
    return {
        "project_id": project_id,
        "id": candidate.id,
        "rank": candidate.rank,
        "start_seconds": candidate.start_seconds,
        "end_seconds": candidate.end_seconds,
        "hook_score": candidate.scores.hook,
        "arc_score": candidate.scores.arc,
        "value_score": candidate.scores.value,
        "share_score": candidate.scores.share,
        "reason": candidate.reason,
        "title": candidate.title,
        "hook_title": candidate.hook_title,
        "hook_type": candidate.hook_type,
        "platforms": json.dumps(asdict(candidate.platforms)),
        "flag": candidate.flag,
        "flag_note": candidate.flag_note,
        "is_replay_peak": candidate.is_replay_peak,
    }


def read_candidate(row: sqlite3.Row) -> Candidate:
    scores = Subscores(
        hook=row["hook_score"],
        arc=row["arc_score"],
        value=row["value_score"],
        share=row["share_score"],
    )
    return Candidate(
        id=row["id"],
        rank=row["rank"],
        start_seconds=row["start_seconds"],
        end_seconds=row["end_seconds"],
        scores=scores,
        reason=row["reason"],
        title=row["title"],
        hook_title=row["hook_title"],
        hook_type=HookType(row["hook_type"]),
        platforms=read_platforms(row["platforms"]),
        flag=ClipFlag(row["flag"]) if row["flag"] else None,
        flag_note=row["flag_note"],
        is_replay_peak=bool(row["is_replay_peak"]),
    )


def read_platforms(stored: str) -> PlatformTexts:
    texts = {name: PlatformText(**text) for name, text in json.loads(stored).items()}
    return PlatformTexts(**texts)
