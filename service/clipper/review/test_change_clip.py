import threading
from collections.abc import Callable
from dataclasses import replace
from functools import partial

import pytest

from ..projects import ProjectRepository
from ..storage import Database
from .change_clip import ClipAddress, ClipChange, ClipNotFoundError, change_clip
from .clip_points import ChangeRefusedError
from .conftest import CutTalk
from .describe_review import ReviewSources, describe_review
from .review_records import ClipPoint, ClipReview, Decision, RejectReason
from .review_schemas import ClipResponse
from .review_store import ReviewStore

FIRST_TITLE = "The worst day my bakery ever had"
ANSWER_TIMEOUT_SECONDS = 20
HELD_SECONDS = 0.3
PAIRS_SENT_TOGETHER = 100


class ReviewStoreThatWaitsToStore(ReviewStore):
    def __init__(self, database: Database) -> None:
        super().__init__(database)
        self.has_read = threading.Event()
        self.may_store = threading.Event()

    def save_review(self, project_id: str, clip_id: str, review: ClipReview) -> None:
        self.has_read.set()
        assert self.may_store.wait(timeout=ANSWER_TIMEOUT_SECONDS)
        super().save_review(project_id, clip_id, review)


class ChangeTheTalk:
    def __init__(self, cut_talk: CutTalk, sources: ReviewSources) -> None:
        self._cut_talk = cut_talk
        self._sources = sources

    def __call__(self, clip_id: str, **fields: object) -> ClipResponse:
        address = ClipAddress(self._cut_talk.project, clip_id)
        return change_clip(address, ClipChange.model_validate(fields), self._sources)

    def read_clip(self, clip_id: str) -> ClipResponse:
        clips = describe_review(self._cut_talk.project, self._sources).clips
        return next(clip for clip in clips if clip.id == clip_id)

    def count_reviews(self) -> int:
        return len(self._sources.reviews.list_reviews(self._cut_talk.project.id))

    def read_stored(self, clip_id: str) -> ClipReview:
        return self._sources.reviews.list_reviews(self._cut_talk.project.id)[clip_id]


@pytest.fixture
def change(cut_talk: CutTalk, sources: ReviewSources) -> ChangeTheTalk:
    return ChangeTheTalk(cut_talk, sources)


def count_decisions(repository: ProjectRepository, cut_talk: CutTalk) -> tuple[int, int]:
    project = repository.get(cut_talk.project.id)
    return project.kept_count, project.rejected_count


def send_together(*sends: Callable[[], object]) -> None:
    start_line = threading.Barrier(len(sends))

    def send_from_the_start_line(send: Callable[[], object]) -> None:
        start_line.wait(timeout=ANSWER_TIMEOUT_SECONDS)
        send()

    senders = [threading.Thread(target=send_from_the_start_line, args=[send]) for send in sends]
    for sender in senders:
        sender.start()
    for sender in senders:
        sender.join(timeout=ANSWER_TIMEOUT_SECONDS)


def test_a_kept_clip_is_answered_kept_and_read_kept(change: ChangeTheTalk) -> None:
    answered = change("c01", decision="keep")

    assert (answered.id, answered.decision, answered.reject_reason) == ("c01", "keep", None)
    assert change.read_clip("c01") == answered


def test_a_clip_is_rejected_with_each_reason_or_with_none(change: ChangeTheTalk) -> None:
    reasons = ["cut-off", "not-interesting", "needs-context", "repeat", None]

    stored = [change("c02", decision="reject", reject_reason=reason) for reason in reasons]

    assert [clip.decision for clip in stored] == [Decision.REJECT] * 5
    assert [clip.reject_reason for clip in stored] == [*RejectReason, None]
    assert change.read_clip("c02").reject_reason is None


def test_a_clip_returned_to_undecided_carries_no_reason(change: ChangeTheTalk) -> None:
    change("c02", decision="reject", reject_reason="repeat")

    answered = change("c02", decision="undecided")

    assert (answered.decision, answered.reject_reason) == ("undecided", None)
    assert change.read_clip("c02").decision == "undecided"


def test_the_counts_of_the_project_follow_a_keep_a_reject_and_a_return_to_undecided(
    change: ChangeTheTalk, cut_talk: CutTalk, repository: ProjectRepository
) -> None:
    counts = [count_decisions(repository, cut_talk)]

    for clip_id, decision in [
        ("c01", "keep"),
        ("c02", "reject"),
        ("c03", "keep"),
        ("c01", "undecided"),
    ]:
        change(clip_id, decision=decision)
        counts.append(count_decisions(repository, cut_talk))

    assert counts == [(0, 0), (1, 0), (1, 1), (2, 1), (1, 1)]


@pytest.mark.parametrize("decision", ["keep", "undecided"])
def test_a_reason_sent_with_any_decision_but_a_rejection_is_not_kept(
    decision: str, change: ChangeTheTalk
) -> None:
    answered = change("c03", decision=decision, reject_reason="not-interesting")

    assert (answered.decision, answered.reject_reason) == (decision, None)
    assert change.read_clip("c03").reject_reason is None


def test_a_reason_sent_alone_for_a_clip_that_is_not_rejected_is_not_kept(
    change: ChangeTheTalk,
) -> None:
    answered = change("c03", reject_reason="repeat")

    assert (answered.decision, answered.reject_reason) == ("undecided", None)


def test_a_change_of_the_title_keeps_the_decision_and_its_reason(change: ChangeTheTalk) -> None:
    change("c02", decision="reject", reject_reason="cut-off")

    answered = change("c02", title="Hire the calm one")

    assert (answered.decision, answered.reject_reason) == ("reject", "cut-off")
    assert answered.title == "Hire the calm one"


def test_a_title_is_stored_without_the_blanks_around_it(change: ChangeTheTalk) -> None:
    answered = change("c01", title="   The morning the oven broke \n")

    assert answered.title == "The morning the oven broke"
    assert change.read_clip("c01").title == "The morning the oven broke"


@pytest.mark.parametrize("emptied", ["", "   ", None])
def test_an_empty_title_brings_back_the_title_selection_gave(
    emptied: str | None, change: ChangeTheTalk
) -> None:
    change("c01", title="The morning the oven broke")

    answered = change("c01", title=emptied)

    assert answered.title == FIRST_TITLE
    assert change.read_clip("c01").title == FIRST_TITLE


def test_an_in_point_moved_one_sentence_earlier_changes_the_start_the_length_and_the_captions(
    change: ChangeTheTalk,
) -> None:
    before = change.read_clip("c01")

    moved = change("c01", start_sentence=3, start_nudge=0, end_sentence=12, end_nudge=0)

    assert (before.start_seconds, before.end_seconds) == (11.94, 44.7)
    assert (moved.start_sentence, moved.start_seconds, moved.end_seconds) == (3, 5.72, 44.7)
    assert moved.end_seconds - moved.start_seconds == pytest.approx(38.98)
    assert [word.text for word in before.captions.keyword[0].words] == ["I", "want", "to"]
    assert [word.text for word in moved.captions.keyword[0].words] == ["The", "coffee", "is"]
    assert len(moved.captions.word_by_word) > len(before.captions.word_by_word)
    assert change.read_clip("c01") == moved


def test_an_out_point_nudged_later_moves_the_end_by_two_tenths_a_step(
    change: ChangeTheTalk,
) -> None:
    nudged = change("c01", end_nudge=3)

    assert (nudged.end_sentence, nudged.end_nudge, nudged.end_seconds) == (12, 3, 45.3)
    assert (nudged.start_sentence, nudged.start_nudge, nudged.start_seconds) == (4, 0, 11.94)


def test_a_nudged_in_point_moves_the_times_of_the_captions_with_it(change: ChangeTheTalk) -> None:
    nudged = change("c01", start_nudge=-2)

    assert nudged.start_seconds == 11.54
    assert nudged.captions.keyword[0].start_seconds == 0.4
    assert [word.text for word in nudged.captions.keyword[0].words] == ["I", "want", "to"]


def test_a_point_sent_to_another_sentence_without_a_nudge_loses_the_nudge_it_had(
    change: ChangeTheTalk,
) -> None:
    change("c01", start_nudge=-4, end_nudge=2)

    moved = change("c01", start_sentence=5)

    assert (moved.start_sentence, moved.start_nudge) == (5, 0)
    assert (moved.end_sentence, moved.end_nudge) == (12, 2)


def test_a_move_of_the_points_keeps_the_decision_and_the_title(change: ChangeTheTalk) -> None:
    change("c01", decision="keep", title="The morning the oven broke")

    moved = change("c01", end_sentence=13)

    assert (moved.decision, moved.title) == ("keep", "The morning the oven broke")
    assert (moved.end_sentence, moved.end_seconds) == (13, 50.3)


@pytest.mark.parametrize(
    "points",
    [
        {"start_sentence": 10, "end_sentence": 9},
        {"start_sentence": 13, "end_sentence": 12},
        {"end_sentence": 16},
        {"start_sentence": 0},
        {"start_sentence": 1, "start_nudge": -1},
        {"start_nudge": -6},
        {"end_nudge": 6},
        {"start_sentence": 10, "end_sentence": 10, "end_nudge": -2},
    ],
)
def test_points_past_a_limit_are_refused_and_nothing_is_stored(
    points: dict[str, int], change: ChangeTheTalk
) -> None:
    with pytest.raises(ChangeRefusedError):
        change("c01", decision="keep", title="A new title", **points)

    untouched = change.read_clip("c01")
    assert change.count_reviews() == 0
    assert (untouched.decision, untouched.title) == ("undecided", FIRST_TITLE)
    assert (untouched.start_sentence, untouched.end_sentence) == (4, 12)


def test_an_end_after_the_video_ends_is_refused(change: ChangeTheTalk) -> None:
    allowed = change("c06", end_sentence=54, end_nudge=1)

    with pytest.raises(ChangeRefusedError):
        change("c06", end_nudge=2)

    assert (allowed.end_seconds, change.read_clip("c06").end_nudge) == (234.76, 1)


def test_a_refused_move_leaves_the_review_that_was_stored_before(change: ChangeTheTalk) -> None:
    change("c01", decision="reject", reject_reason="repeat", start_nudge=2)

    with pytest.raises(ChangeRefusedError):
        change("c01", decision="keep", start_sentence=20)

    stored = change.read_clip("c01")
    assert (stored.decision, stored.reject_reason, stored.start_nudge) == ("reject", "repeat", 2)


def test_a_change_without_points_is_stored_even_where_the_stored_points_stand(
    change: ChangeTheTalk, sources: ReviewSources, cut_talk: CutTalk
) -> None:
    change("c01", start_nudge=5, end_nudge=-5)

    kept = change("c01", decision="keep")

    stored = sources.reviews.list_reviews(cut_talk.project.id)["c01"]
    assert kept.decision == "keep"
    assert (stored.start, stored.end) == (ClipPoint(4, 5), ClipPoint(12, -5))


def test_an_unknown_clip_is_not_found_and_stores_nothing(change: ChangeTheTalk) -> None:
    with pytest.raises(ClipNotFoundError) as missing:
        change("c07", decision="keep")

    assert missing.value.status_code == 404
    assert missing.value.message == "This clip does not exist."
    assert change.count_reviews() == 0


def test_a_change_that_arrives_while_another_waits_to_be_stored_is_applied_to_what_that_one_stored(
    cut_talk: CutTalk, sources: ReviewSources, database: Database
) -> None:
    reviews = ReviewStoreThatWaitsToStore(database)
    change = ChangeTheTalk(cut_talk, replace(sources, reviews=reviews))
    keeping = threading.Thread(target=partial(change, "c01", decision="keep"))
    moving = threading.Thread(target=partial(change, "c01", end_sentence=13, end_nudge=3))

    keeping.start()
    assert reviews.has_read.wait(timeout=ANSWER_TIMEOUT_SECONDS)
    moving.start()
    moving.join(timeout=HELD_SECONDS)
    is_the_move_waiting = moving.is_alive()
    reviews.may_store.set()
    keeping.join(timeout=ANSWER_TIMEOUT_SECONDS)
    moving.join(timeout=ANSWER_TIMEOUT_SECONDS)

    stored = change.read_stored("c01")
    assert is_the_move_waiting
    assert (stored.decision, stored.end) == (Decision.KEEP, ClipPoint(13, 3))


def test_a_hundred_pairs_of_changes_sent_from_two_threads_at_the_same_moment_are_all_stored_whole(
    change: ChangeTheTalk,
) -> None:
    sent = [
        (Decision.KEEP if number % 2 == 0 else Decision.REJECT, ClipPoint(12, number % 5))
        for number in range(PAIRS_SENT_TOGETHER)
    ]
    stored: list[tuple[Decision, ClipPoint]] = []

    for decision, end in sent:
        send_together(
            partial(change, "c01", decision=decision.value),
            partial(change, "c01", end_nudge=end.nudge),
        )
        review = change.read_stored("c01")
        stored.append((review.decision, review.end))

    assert stored == sent
