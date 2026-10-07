import sqlite3
from collections.abc import Iterable
from dataclasses import replace

import pytest

from ..storage import Database
from .history_records import LAST_DECISIONS, ClipKey, Outcome, PastDecision, RejectionCounts
from .history_store import (
    HistoryStore,
    record_decision,
    record_outcome,
    remove_decision,
    remove_outcome,
)

FIRST_CLIP = ClipKey("a1b2c3", "c01")
SECOND_CLIP = ClipKey("a1b2c3", "c02")
SAME_NAME_ELSEWHERE = ClipKey("d4e5f6", "c01")
KEPT = PastDecision(FIRST_CLIP, is_rejection=False)
CUT_OFF = PastDecision(SECOND_CLIP, is_rejection=True, reject_reason="cut-off")
POSTED = Outcome(FIRST_CLIP, views=1200, hook_type="story", seconds=32.76)


@pytest.fixture
def store(database: Database) -> HistoryStore:
    return HistoryStore(database)


def record_decisions(database: Database, decisions: Iterable[PastDecision]) -> None:
    for decision in decisions:
        with database.transaction() as connection:
            record_decision(connection, decision)


def record_outcomes(database: Database, outcomes: Iterable[Outcome]) -> None:
    for outcome in outcomes:
        with database.transaction() as connection:
            record_outcome(connection, outcome)


def reject_clip(number: int, reason: str | None) -> PastDecision:
    return PastDecision(ClipKey("a1b2c3", f"c{number:02d}"), True, reason)


def test_a_new_database_has_no_decision_and_no_outcome(store: HistoryStore) -> None:
    assert store.list_newest_decisions(LAST_DECISIONS) == []
    assert store.list_outcomes() == []
    assert store.count_rejections() == RejectionCounts(0, 0, 0, 0)


def test_the_newest_decisions_come_first_up_to_the_number_asked_for(
    store: HistoryStore, database: Database
) -> None:
    elsewhere = PastDecision(SAME_NAME_ELSEWHERE, is_rejection=True)
    record_decisions(database, [KEPT, CUT_OFF, elsewhere])

    assert store.list_newest_decisions(LAST_DECISIONS) == [elsewhere, CUT_OFF, KEPT]
    assert store.list_newest_decisions(2) == [elsewhere, CUT_OFF]


def test_a_decision_recorded_again_for_its_clip_is_held_once_as_the_newest(
    store: HistoryStore, database: Database
) -> None:
    rejected_after_all = PastDecision(FIRST_CLIP, is_rejection=True, reject_reason="repeat")
    record_decisions(database, [KEPT, CUT_OFF])

    record_decisions(database, [rejected_after_all])

    assert store.list_newest_decisions(LAST_DECISIONS) == [rejected_after_all, CUT_OFF]


def test_a_decision_taken_out_leaves_the_others(store: HistoryStore, database: Database) -> None:
    record_decisions(database, [KEPT, CUT_OFF])

    with database.transaction() as connection:
        remove_decision(connection, FIRST_CLIP)

    assert store.list_newest_decisions(LAST_DECISIONS) == [CUT_OFF]


def test_of_60_decisions_the_50_newest_are_given_and_an_older_rejection_is_not_counted(
    store: HistoryStore, database: Database
) -> None:
    oldest_ten = [reject_clip(number, "repeat") for number in range(1, 11)]
    newest_fifty = [reject_clip(number, "cut-off") for number in range(11, 61)]
    record_decisions(database, oldest_ten + newest_fifty)

    given = store.list_newest_decisions(LAST_DECISIONS)

    assert LAST_DECISIONS == 50
    assert given == newest_fifty[::-1]
    assert store.count_rejections() == RejectionCounts(cut_off=50, repeat=0)


def test_each_rejection_is_counted_under_its_reason(
    store: HistoryStore, database: Database
) -> None:
    reasons = ["cut-off", "repeat", "not-interesting", "repeat", "needs-context", "repeat"]
    rejected = [reject_clip(number, reason) for number, reason in enumerate(reasons, start=2)]
    record_decisions(database, [KEPT, *rejected])

    assert store.count_rejections() == RejectionCounts(
        cut_off=1, not_interesting=1, needs_context=1, repeat=3
    )


def test_a_rejection_without_a_reason_is_counted_under_none_of_the_four_reasons(
    store: HistoryStore, database: Database
) -> None:
    record_decisions(database, [reject_clip(1, None), CUT_OFF])

    assert store.count_rejections() == RejectionCounts(cut_off=1)
    assert [entry.is_rejection for entry in store.list_newest_decisions(LAST_DECISIONS)] == [
        True,
        True,
    ]


def test_an_outcome_recorded_twice_for_one_clip_is_held_once_with_the_later_values(
    store: HistoryStore, database: Database
) -> None:
    elsewhere = Outcome(SAME_NAME_ELSEWHERE, views=48000, hook_type="hot-take", seconds=41.32)
    trimmed_and_seen_more = replace(POSTED, views=5400, seconds=29.5)
    record_outcomes(database, [POSTED, elsewhere])

    record_outcomes(database, [trimmed_and_seen_more])

    assert store.list_outcomes() == [elsewhere, trimmed_and_seen_more]


def test_an_outcome_taken_out_is_gone(store: HistoryStore, database: Database) -> None:
    elsewhere = replace(POSTED, clip=SAME_NAME_ELSEWHERE)
    record_outcomes(database, [POSTED, elsewhere])

    with database.transaction() as connection:
        remove_outcome(connection, FIRST_CLIP)

    assert store.list_outcomes() == [elsewhere]


def test_forgetting_empties_both_lists(store: HistoryStore, database: Database) -> None:
    record_decisions(database, [KEPT, CUT_OFF])
    record_outcomes(database, [POSTED])

    store.forget_all()

    assert store.list_newest_decisions(LAST_DECISIONS) == []
    assert store.list_outcomes() == []


def test_an_entry_recorded_in_a_transaction_that_fails_is_not_kept(
    store: HistoryStore, database: Database
) -> None:
    with pytest.raises(sqlite3.OperationalError), database.transaction() as connection:
        record_decision(connection, KEPT)
        record_outcome(connection, POSTED)
        connection.execute("INSERT INTO no_such_table VALUES (1)")

    assert store.list_newest_decisions(LAST_DECISIONS) == []
    assert store.list_outcomes() == []
