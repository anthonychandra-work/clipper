from dataclasses import replace

from ..selection import Candidate, Sentence
from .trim_reach import TrimReach, find_trim_reach, list_reach

REACH_OF_EACH_PART = [(1, 15), (20, 33), (10, 25), (28, 43), (38, 50), (45, 54)]
CUT_OF_EACH_PART = [(4, 12), (23, 30), (13, 22), (31, 40), (41, 47), (48, 51)]


def place_on(candidate: Candidate, first: Sentence, last: Sentence) -> Candidate:
    return replace(candidate, start_seconds=first.start, end_seconds=last.end)


def test_the_sentences_selection_cut_a_clip_on_are_found_from_its_start_and_its_end(
    talk_candidates: list[Candidate], talk_sentences: list[Sentence]
) -> None:
    reaches = [find_trim_reach(candidate, talk_sentences) for candidate in talk_candidates]

    assert [(reach.cut_start, reach.cut_end) for reach in reaches] == CUT_OF_EACH_PART


def test_the_six_parts_of_the_talk_reach_three_sentences_further_on_each_side(
    talk_candidates: list[Candidate], talk_sentences: list[Sentence]
) -> None:
    reaches = [find_trim_reach(candidate, talk_sentences) for candidate in talk_candidates]

    assert len(talk_sentences) == 54
    assert [(reach.first, reach.last) for reach in reaches] == REACH_OF_EACH_PART


def test_a_clip_on_the_first_sentence_reaches_nothing_before_it(
    talk_candidates: list[Candidate], talk_sentences: list[Sentence]
) -> None:
    opening = place_on(talk_candidates[0], talk_sentences[0], talk_sentences[1])

    assert find_trim_reach(opening, talk_sentences) == TrimReach(1, 2, first=1, last=5)


def test_a_clip_on_the_last_sentence_reaches_nothing_after_it(
    talk_candidates: list[Candidate], talk_sentences: list[Sentence]
) -> None:
    closing = place_on(talk_candidates[0], talk_sentences[52], talk_sentences[53])

    assert find_trim_reach(closing, talk_sentences) == TrimReach(53, 54, first=50, last=54)


def test_a_sentence_that_starts_where_the_one_before_ends_is_told_from_it(
    talk_candidates: list[Candidate], talk_sentences: list[Sentence]
) -> None:
    fifteenth, sixteenth = talk_sentences[14], talk_sentences[15]
    one_sentence = place_on(talk_candidates[0], sixteenth, sixteenth)

    reach = find_trim_reach(one_sentence, talk_sentences)

    assert fifteenth.end == sixteenth.start
    assert (reach.cut_start, reach.cut_end) == (16, 16)


def test_the_reach_is_listed_as_the_sentences_from_its_first_to_its_last(
    talk_candidates: list[Candidate], talk_sentences: list[Sentence]
) -> None:
    reach = find_trim_reach(talk_candidates[1], talk_sentences)

    reached = list_reach(reach, talk_sentences)

    assert [sentence.number for sentence in reached] == list(range(20, 34))
    assert reach.holds(20) and reach.holds(33)
    assert not reach.holds(19) and not reach.holds(34)
