import pytest

from ..selection import Candidate, Sentence
from ..transcription import TranscriptWord
from .clip_points import (
    REFUSED_CHANGE,
    ChangeRefusedError,
    TrimLimits,
    refuse_points_past_the_limits,
    time_clip,
)
from .conftest import TALK_SECONDS
from .review_records import ClipPoint, ClipReview
from .trim_reach import TrimReach, find_trim_reach

FIRST_PART, LAST_PART = 0, 5


@pytest.fixture
def limits_of_the_first_part(
    talk_candidates: list[Candidate], talk_sentences: list[Sentence]
) -> TrimLimits:
    reach = find_trim_reach(talk_candidates[FIRST_PART], talk_sentences)
    return TrimLimits(reach, talk_sentences, TALK_SECONDS)


@pytest.fixture
def limits_of_the_last_part(
    talk_candidates: list[Candidate], talk_sentences: list[Sentence]
) -> TrimLimits:
    reach = find_trim_reach(talk_candidates[LAST_PART], talk_sentences)
    return TrimLimits(reach, talk_sentences, TALK_SECONDS)


def place(start: tuple[int, int], end: tuple[int, int]) -> ClipReview:
    return ClipReview(start=ClipPoint(*start), end=ClipPoint(*end))


def is_refused(review: ClipReview, limits: TrimLimits) -> bool:
    try:
        refuse_points_past_the_limits(review, limits)
    except ChangeRefusedError:
        return True
    return False


def test_a_clip_as_selection_cut_it_starts_and_ends_with_its_sentences(
    talk_sentences: list[Sentence],
) -> None:
    times = time_clip(place((4, 0), (12, 0)), talk_sentences)

    assert (times.start_seconds, times.end_seconds) == (11.94, 44.7)


def test_each_nudge_step_moves_a_point_by_two_tenths_of_a_second(
    talk_sentences: list[Sentence],
) -> None:
    times = time_clip(place((4, -3), (12, 5)), talk_sentences)

    assert (times.start_seconds, times.end_seconds) == (11.34, 45.7)
    assert (times.start_hundredths, times.end_hundredths) == (1134, 4570)


def test_a_point_moved_to_another_sentence_takes_the_time_of_that_sentence(
    talk_sentences: list[Sentence],
) -> None:
    times = time_clip(place((3, 0), (13, 0)), talk_sentences)

    assert (times.start_seconds, times.end_seconds) == (5.72, 50.3)


@pytest.mark.parametrize("nudge", [-5, -1, 0, 1, 5])
def test_up_to_five_nudge_steps_either_way_are_allowed(
    nudge: int, limits_of_the_first_part: TrimLimits
) -> None:
    assert not is_refused(place((4, nudge), (12, 0)), limits_of_the_first_part)
    assert not is_refused(place((4, 0), (12, nudge)), limits_of_the_first_part)


@pytest.mark.parametrize("nudge", [-6, 6])
def test_a_sixth_nudge_step_is_refused(nudge: int, limits_of_the_first_part: TrimLimits) -> None:
    assert is_refused(place((4, nudge), (12, 0)), limits_of_the_first_part)
    assert is_refused(place((4, 0), (12, nudge)), limits_of_the_first_part)


@pytest.mark.parametrize(("start", "end"), [(1, 12), (3, 12), (5, 12), (4, 11), (4, 15), (9, 9)])
def test_a_move_to_another_sentence_of_the_reach_with_no_nudge_is_allowed(
    start: int, end: int, limits_of_the_first_part: TrimLimits
) -> None:
    assert not is_refused(place((start, 0), (end, 0)), limits_of_the_first_part)


def test_an_in_point_after_the_out_point_is_refused(limits_of_the_first_part: TrimLimits) -> None:
    assert is_refused(place((10, 0), (9, 0)), limits_of_the_first_part)


@pytest.mark.parametrize(("start", "end"), [(4, 16), (0, 12), (4, 55), (-1, 12)])
def test_a_sentence_outside_the_reach_is_refused(
    start: int, end: int, limits_of_the_first_part: TrimLimits
) -> None:
    assert is_refused(place((start, 0), (end, 0)), limits_of_the_first_part)


def test_a_sentence_before_the_reach_of_a_later_clip_is_refused(
    limits_of_the_last_part: TrimLimits,
) -> None:
    assert not is_refused(place((45, 0), (51, 0)), limits_of_the_last_part)
    assert is_refused(place((44, 0), (51, 0)), limits_of_the_last_part)


def test_a_start_before_the_video_begins_is_refused(
    limits_of_the_first_part: TrimLimits, talk_sentences: list[Sentence]
) -> None:
    assert talk_sentences[0].start == 0
    assert not is_refused(place((1, 0), (12, 0)), limits_of_the_first_part)
    assert is_refused(place((1, -1), (12, 0)), limits_of_the_first_part)


def test_an_end_after_the_video_ends_is_refused(
    limits_of_the_last_part: TrimLimits, talk_sentences: list[Sentence]
) -> None:
    assert talk_sentences[-1].end == 234.56
    assert not is_refused(place((48, 0), (54, 1)), limits_of_the_last_part)
    assert is_refused(place((48, 0), (54, 2)), limits_of_the_last_part)


def test_a_clip_left_shorter_than_one_second_is_refused(
    limits_of_the_last_part: TrimLimits, talk_sentences: list[Sentence]
) -> None:
    short_sentence = talk_sentences[48]

    assert (short_sentence.start, short_sentence.end) == (198.5, 199.66)
    assert not is_refused(place((49, 0), (49, 0)), limits_of_the_last_part)
    assert is_refused(place((49, 1), (49, 0)), limits_of_the_last_part)
    assert is_refused(place((49, 0), (49, -1)), limits_of_the_last_part)


def test_a_clip_of_exactly_one_second_is_allowed() -> None:
    one_second = Sentence(1, (TranscriptWord(text=" Go.", start=10.0, end=11.0),))
    limits = TrimLimits(TrimReach(1, 1, first=1, last=1), [one_second], video_seconds=20.0)

    assert not is_refused(place((1, 0), (1, 0)), limits)
    assert is_refused(place((1, 1), (1, 0)), limits)


def test_a_video_whose_last_word_ends_with_it_lets_the_out_point_go_no_later() -> None:
    last = Sentence(1, (TranscriptWord(text=" Go on.", start=10.0, end=12.0),))
    limits = TrimLimits(TrimReach(1, 1, first=1, last=1), [last], video_seconds=12.0)

    assert not is_refused(place((1, 0), (1, 0)), limits)
    assert is_refused(place((1, 0), (1, 1)), limits)


def test_the_refusal_is_a_422_that_carries_one_sentence_and_nothing_that_was_sent(
    limits_of_the_first_part: TrimLimits,
) -> None:
    with pytest.raises(ChangeRefusedError) as refused:
        refuse_points_past_the_limits(place((4, 9), (12, 0)), limits_of_the_first_part)

    assert refused.value.status_code == 422
    assert refused.value.describe() == {"problem": {"section": None, "message": REFUSED_CHANGE}}
    assert REFUSED_CHANGE == "Clipper could not make this change. Reload the page and try again."
