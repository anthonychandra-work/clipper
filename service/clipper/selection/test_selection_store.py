import sqlite3
from dataclasses import replace

import pytest

from ..projects import (
    CreateProjectRequest,
    Platform,
    Project,
    ProjectRepository,
    SourceKind,
    create_project,
)
from ..storage import BYTES_PER_GB, Database, DiskSpace
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
from .selection_store import SelectionStore
from .split_windows import Window

PLENTY = DiskSpace(free_bytes=50 * BYTES_PER_GB, total_bytes=460 * BYTES_PER_GB)
TABLES = ("selection_windows", "replay_peaks", "candidates")
ADD_REVIEW = """
INSERT INTO clip_reviews (
    project_id, clip_id, decision, start_sentence, start_nudge, end_sentence, end_nudge
) VALUES (?, ?, ?, 4, 0, 12, 0)
"""
FIRST_WINDOW = WindowRecord(Window("w01", 1, 23, 0.0, 89.92), score=72, is_shortlisted=True)
SECOND_WINDOW = WindowRecord(Window("w02", 17, 38, 63.84, 151.02), score=81, is_shortlisted=True)
THIRD_WINDOW = WindowRecord(Window("w03", 32, 49, 125.3, 199.66), score=0, is_shortlisted=False)
TEXTS = PlatformTexts(
    tiktok=PlatformText("The oven broke", "What a bad morning taught a baker. #bakery"),
    reels=PlatformText("Nobody left angry", "Customers forgive bad news. #smallbusiness"),
    shorts=PlatformText("The worst day my bakery had", "Tell them the truth."),
)


@pytest.fixture
def store(database: Database) -> SelectionStore:
    return SelectionStore(database)


@pytest.fixture
def project(repository: ProjectRepository) -> Project:
    return add_project(repository)


def add_project(repository: ProjectRepository) -> Project:
    draft = CreateProjectRequest(
        source_kind=SourceKind.LINK, link="https://example.com/talk.mp4", platforms=[Platform.REELS]
    )
    return create_project(draft, repository, PLENTY)


def make_candidate(rank: int) -> Candidate:
    return Candidate(
        id=f"c{rank:02d}",
        rank=rank,
        start_seconds=11.94 + rank,
        end_seconds=44.7 + rank,
        scores=Subscores(hook=23, arc=23 - rank, value=20, share=22),
        reason="A whole story that ends on a line worth quoting.",
        title="The worst day my bakery ever had",
        hook_title="The oven broke before sunrise",
        hook_type=HookType.STORY,
        platforms=TEXTS,
        flag=None,
        flag_note=None,
        is_replay_peak=False,
    )


def keep_first_and_reject_second(database: Database, project_id: str) -> None:
    with database.transaction() as connection:
        connection.executemany(
            ADD_REVIEW, [(project_id, "c01", "keep"), (project_id, "c02", "reject")]
        )
        connection.execute(
            "UPDATE projects SET kept_count = 1, rejected_count = 1 WHERE id = ?", [project_id]
        )


def count_reviews(database: Database) -> int:
    with database.transaction() as connection:
        count: int = connection.execute("SELECT COUNT(*) FROM clip_reviews").fetchone()[0]
        return count


def count_rows(database: Database) -> dict[str, int]:
    with database.transaction() as connection:
        return {
            table: connection.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
            for table in TABLES
        }


def test_windows_are_read_back_as_written_in_the_order_of_their_starts(
    store: SelectionStore, project: Project
) -> None:
    store.replace_windows(project.id, [THIRD_WINDOW, FIRST_WINDOW, SECOND_WINDOW])

    assert store.list_windows(project.id) == [FIRST_WINDOW, SECOND_WINDOW, THIRD_WINDOW]


def test_replacing_the_windows_leaves_none_of_the_earlier_ones(
    store: SelectionStore, project: Project
) -> None:
    store.replace_windows(project.id, [FIRST_WINDOW, SECOND_WINDOW, THIRD_WINDOW])

    store.replace_windows(project.id, [replace(SECOND_WINDOW, score=12, is_shortlisted=False)])

    assert store.list_windows(project.id) == [WindowRecord(SECOND_WINDOW.window, 12, False)]


def test_a_project_with_nothing_stored_has_no_window_no_candidate_and_no_peak(
    store: SelectionStore, project: Project
) -> None:
    assert store.list_windows(project.id) == []
    assert store.list_candidates(project.id) == []
    assert store.list_peaks(project.id) == []


def test_candidates_and_peaks_are_read_back_as_written_in_the_order_of_rank_and_start(
    store: SelectionStore, project: Project
) -> None:
    candidates = [make_candidate(rank) for rank in (3, 1, 2)]
    peaks = [ReplayPeak(141.42, 162.63), ReplayPeak(47.14, 49.5)]

    store.replace_candidates(project.id, candidates, peaks)

    assert store.list_candidates(project.id) == [make_candidate(rank) for rank in (1, 2, 3)]
    assert store.list_peaks(project.id) == [ReplayPeak(47.14, 49.5), ReplayPeak(141.42, 162.63)]


def test_a_flag_its_note_and_the_replay_marker_are_stored_with_a_candidate(
    store: SelectionStore, project: Project
) -> None:
    flagged = replace(
        make_candidate(1),
        flag=ClipFlag.NEEDS_CONTEXT,
        flag_note="Opens on “also”, and a viewer has not heard what came before.",
        hook_type=HookType.HOT_TAKE,
        is_replay_peak=True,
    )
    weak = replace(make_candidate(2), flag=ClipFlag.NOT_RECOMMENDED, flag_note="No payoff.")

    store.replace_candidates(project.id, [flagged, weak, make_candidate(3)], [])

    first, second, third = store.list_candidates(project.id)
    assert (first, second) == (flagged, weak)
    assert (third.flag, third.flag_note, third.is_replay_peak) == (None, None, False)


def test_the_total_of_a_candidate_is_worked_out_from_its_subscores(
    store: SelectionStore, project: Project
) -> None:
    store.replace_candidates(project.id, [make_candidate(1)], [])

    (stored,) = store.list_candidates(project.id)
    assert stored.scores == Subscores(hook=23, arc=22, value=20, share=22)
    assert stored.total == 87


def test_storing_candidates_sets_the_count_of_the_project(
    store: SelectionStore, project: Project, repository: ProjectRepository
) -> None:
    other = add_project(repository)

    store.replace_candidates(project.id, [make_candidate(rank) for rank in (1, 2, 3)], [])

    assert repository.get(project.id).candidate_count == 3
    assert repository.get(other.id).candidate_count == 0


def test_replacing_the_candidates_replaces_the_peaks_and_the_count_with_them(
    store: SelectionStore, project: Project, repository: ProjectRepository
) -> None:
    store.replace_candidates(
        project.id, [make_candidate(rank) for rank in (1, 2, 3)], [ReplayPeak(47.14, 49.5)]
    )

    store.replace_candidates(project.id, [make_candidate(1)], [])

    assert store.list_candidates(project.id) == [make_candidate(1)]
    assert store.list_peaks(project.id) == []
    assert repository.get(project.id).candidate_count == 1


def test_replacing_the_candidates_removes_their_reviews_and_counts_no_decision(
    store: SelectionStore, project: Project, repository: ProjectRepository, database: Database
) -> None:
    store.replace_candidates(project.id, [make_candidate(rank) for rank in (1, 2)], [])
    keep_first_and_reject_second(database, project.id)

    store.replace_candidates(project.id, [make_candidate(rank) for rank in (1, 2)], [])

    recut = repository.get(project.id)
    assert count_reviews(database) == 0
    assert (recut.candidate_count, recut.kept_count, recut.rejected_count) == (2, 0, 0)


def test_candidates_that_cannot_be_stored_leave_the_reviews_and_their_counts(
    store: SelectionStore, project: Project, repository: ProjectRepository, database: Database
) -> None:
    store.replace_candidates(project.id, [make_candidate(rank) for rank in (1, 2)], [])
    keep_first_and_reject_second(database, project.id)

    with pytest.raises(sqlite3.IntegrityError):
        store.replace_candidates(project.id, [make_candidate(3), make_candidate(3)], [])

    kept = repository.get(project.id)
    assert count_reviews(database) == 2
    assert (kept.candidate_count, kept.kept_count, kept.rejected_count) == (2, 1, 1)


def test_candidates_that_cannot_be_stored_leave_the_earlier_ones_and_their_count(
    store: SelectionStore, project: Project, repository: ProjectRepository
) -> None:
    store.replace_candidates(project.id, [make_candidate(1)], [ReplayPeak(47.14, 49.5)])
    twice = [make_candidate(2), make_candidate(2)]

    with pytest.raises(sqlite3.IntegrityError):
        store.replace_candidates(project.id, twice, [])

    assert store.list_candidates(project.id) == [make_candidate(1)]
    assert store.list_peaks(project.id) == [ReplayPeak(47.14, 49.5)]
    assert repository.get(project.id).candidate_count == 1


def test_the_records_of_one_project_are_kept_apart_from_those_of_another(
    store: SelectionStore, project: Project, repository: ProjectRepository
) -> None:
    other = add_project(repository)
    store.replace_windows(project.id, [FIRST_WINDOW])
    store.replace_candidates(project.id, [make_candidate(1)], [ReplayPeak(47.14, 49.5)])

    store.replace_windows(other.id, [SECOND_WINDOW])
    store.replace_candidates(other.id, [make_candidate(1), make_candidate(2)], [])

    assert store.list_windows(project.id) == [FIRST_WINDOW]
    assert store.list_candidates(project.id) == [make_candidate(1)]
    assert store.list_peaks(project.id) == [ReplayPeak(47.14, 49.5)]
    assert len(store.list_candidates(other.id)) == 2


def test_deleting_the_project_leaves_no_row_of_the_three_tables(
    store: SelectionStore, project: Project, repository: ProjectRepository, database: Database
) -> None:
    store.replace_windows(project.id, [FIRST_WINDOW, SECOND_WINDOW])
    store.replace_candidates(project.id, [make_candidate(1)], [ReplayPeak(47.14, 49.5)])
    assert count_rows(database) == {"selection_windows": 2, "replay_peaks": 1, "candidates": 1}

    repository.delete(project.id)

    assert count_rows(database) == {"selection_windows": 0, "replay_peaks": 0, "candidates": 0}
