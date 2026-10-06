from dataclasses import replace

import pytest

from ..projects import ProjectRepository
from ..selection import SelectionStore
from ..storage import Database
from .conftest import CutTalk, CutTheTalk
from .review_records import (
    STARTING_LOOK,
    CaptionStyle,
    ClipPoint,
    ClipReview,
    Decision,
    Framing,
    Look,
    RejectReason,
)
from .review_store import ReviewStore

AS_CUT = ClipReview(start=ClipPoint(4), end=ClipPoint(12))
KEPT = replace(AS_CUT, decision=Decision.KEEP)
REJECTED = replace(AS_CUT, decision=Decision.REJECT, reject_reason=RejectReason.NOT_INTERESTING)
MOVED_AND_RENAMED = ClipReview(
    start=ClipPoint(sentence=2, nudge=-3),
    end=ClipPoint(sentence=14, nudge=5),
    decision=Decision.REJECT,
    reject_reason=RejectReason.CUT_OFF,
    title="The morning the oven broke",
)
PLAIN_LOOK = Look(
    caption_style=CaptionStyle.PLAIN,
    framing=Framing.WHOLE_FRAME,
    show_hook_title=False,
    show_safe_zones=True,
)
REVIEW_TABLES = ("clip_reviews", "project_looks")


@pytest.fixture
def store(database: Database) -> ReviewStore:
    return ReviewStore(database)


def count_decisions(repository: ProjectRepository, project_id: str) -> tuple[int, int]:
    project = repository.get(project_id)
    return project.kept_count, project.rejected_count


def count_rows(database: Database) -> dict[str, int]:
    with database.transaction() as connection:
        return {
            table: connection.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
            for table in REVIEW_TABLES
        }


def test_a_project_with_nothing_stored_has_no_review_and_the_starting_look(
    store: ReviewStore, cut_talk: CutTalk
) -> None:
    assert store.list_reviews(cut_talk.project.id) == {}
    assert store.read_look(cut_talk.project.id) == STARTING_LOOK
    assert STARTING_LOOK == Look(CaptionStyle.KEYWORD, Framing.FOLLOW_SPEAKER, True, False)


def test_a_review_is_read_back_as_written_under_the_name_of_its_clip(
    store: ReviewStore, cut_talk: CutTalk
) -> None:
    store.save_review(cut_talk.project.id, "c01", MOVED_AND_RENAMED)
    store.save_review(cut_talk.project.id, "c03", KEPT)

    assert store.list_reviews(cut_talk.project.id) == {"c01": MOVED_AND_RENAMED, "c03": KEPT}


def test_a_review_without_a_reason_or_a_title_is_read_back_with_none(
    store: ReviewStore, cut_talk: CutTalk
) -> None:
    store.save_review(cut_talk.project.id, "c02", AS_CUT)

    stored = store.list_reviews(cut_talk.project.id)["c02"]
    assert (stored.decision, stored.reject_reason, stored.title) == (Decision.UNDECIDED, None, None)
    assert (stored.start, stored.end) == (ClipPoint(4, 0), ClipPoint(12, 0))


def test_a_second_save_of_a_clip_replaces_the_first(store: ReviewStore, cut_talk: CutTalk) -> None:
    store.save_review(cut_talk.project.id, "c01", REJECTED)

    store.save_review(cut_talk.project.id, "c01", MOVED_AND_RENAMED)

    assert store.list_reviews(cut_talk.project.id) == {"c01": MOVED_AND_RENAMED}


def test_the_counts_follow_a_keep_a_reject_and_a_return_to_undecided(
    store: ReviewStore, cut_talk: CutTalk, repository: ProjectRepository
) -> None:
    project_id = cut_talk.project.id
    counts: list[tuple[int, int]] = [count_decisions(repository, project_id)]

    for clip_id, review in [("c01", KEPT), ("c02", REJECTED), ("c03", KEPT), ("c01", AS_CUT)]:
        store.save_review(project_id, clip_id, review)
        counts.append(count_decisions(repository, project_id))

    assert counts == [(0, 0), (1, 0), (1, 1), (2, 1), (1, 1)]


def test_a_decision_changed_from_kept_to_rejected_moves_from_one_count_to_the_other(
    store: ReviewStore, cut_talk: CutTalk, repository: ProjectRepository
) -> None:
    store.save_review(cut_talk.project.id, "c01", KEPT)

    store.save_review(cut_talk.project.id, "c01", REJECTED)

    assert count_decisions(repository, cut_talk.project.id) == (0, 1)


def test_each_project_counts_its_own_decisions(
    store: ReviewStore, cut_the_talk: CutTheTalk, repository: ProjectRepository
) -> None:
    first, second = cut_the_talk().project, cut_the_talk().project

    store.save_review(first.id, "c01", KEPT)
    store.save_review(second.id, "c01", REJECTED)
    store.save_review(second.id, "c02", REJECTED)

    assert count_decisions(repository, first.id) == (1, 0)
    assert count_decisions(repository, second.id) == (0, 2)
    assert store.list_reviews(first.id) == {"c01": KEPT}


def test_a_saved_look_is_read_back_and_a_second_one_replaces_it(
    store: ReviewStore, cut_the_talk: CutTheTalk
) -> None:
    project, other = cut_the_talk().project, cut_the_talk().project
    store.save_look(project.id, replace(PLAIN_LOOK, framing=Framing.STACK_TWO))

    store.save_look(project.id, PLAIN_LOOK)

    assert store.read_look(project.id) == PLAIN_LOOK
    assert store.read_look(other.id) == STARTING_LOOK


def test_deleting_the_project_leaves_no_review_and_no_look(
    store: ReviewStore, cut_talk: CutTalk, repository: ProjectRepository, database: Database
) -> None:
    store.save_review(cut_talk.project.id, "c01", KEPT)
    store.save_review(cut_talk.project.id, "c02", REJECTED)
    store.save_look(cut_talk.project.id, PLAIN_LOOK)
    assert count_rows(database) == {"clip_reviews": 2, "project_looks": 1}

    repository.delete(cut_talk.project.id)

    assert count_rows(database) == {"clip_reviews": 0, "project_looks": 0}


def test_cutting_again_leaves_no_review_and_both_counts_at_0_and_keeps_the_look(
    store: ReviewStore, cut_talk: CutTalk, repository: ProjectRepository, database: Database
) -> None:
    project_id = cut_talk.project.id
    store.save_review(project_id, "c01", KEPT)
    store.save_review(project_id, "c02", REJECTED)
    store.save_look(project_id, PLAIN_LOOK)

    SelectionStore(database).replace_candidates(project_id, cut_talk.candidates[:2], [])

    assert store.list_reviews(project_id) == {}
    assert count_decisions(repository, project_id) == (0, 0)
    assert repository.get(project_id).candidate_count == 2
    assert store.read_look(project_id) == PLAIN_LOOK
