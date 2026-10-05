from ..transcription import TranscriptWord
from .place_quote import Placement, place_quote
from .split_sentences import Sentence, split_sentences
from .split_windows import Window

TALK = (
    "Thank you for coming. The oven broke before sunrise. Nobody left angry. "
    "Customers forgive bad news. What they do not forgive is silence. "
    "Now let me talk about price. The oven broke again in spring. Smile, and let them go."
)


def speak(text: str) -> list[Sentence]:
    words = [
        TranscriptWord(text=f" {spoken}", start=float(at), end=at + 0.8)
        for at, spoken in enumerate(text.split())
    ]
    return split_sentences(words)


def span(sentences: list[Sentence], first: int, last: int) -> Window:
    return Window("w01", first, last, sentences[first - 1].start, sentences[last - 1].end)


def test_quoted_words_give_the_sentences_that_hold_them_with_their_times() -> None:
    sentences = speak(TALK)

    placed = place_quote(
        "The oven broke before sunrise.",
        "What they do not forgive is silence.",
        span(sentences, 1, 8),
        sentences,
    )

    assert placed == Placement(2, 5, start_seconds=sentences[1].start, end_seconds=sentences[4].end)
    assert (placed.start_seconds, placed.end_seconds) == (4.0, 22.8)


def test_quoted_words_are_found_whatever_their_case_and_punctuation() -> None:
    sentences = speak(TALK)

    placed = place_quote(
        "the OVEN broke, before sunrise",
        "“What they do not forgive… is silence!”",
        span(sentences, 1, 8),
        sentences,
    )

    assert placed is not None
    assert (placed.first_sentence, placed.last_sentence) == (2, 5)


def test_words_quoted_from_the_middle_of_sentences_give_the_whole_sentences() -> None:
    sentences = speak(TALK)

    placed = place_quote("broke before", "do not forgive", span(sentences, 1, 8), sentences)

    assert placed == Placement(2, 5, start_seconds=sentences[1].start, end_seconds=sentences[4].end)


def test_words_that_also_occur_before_the_window_are_found_inside_it() -> None:
    sentences = speak(TALK)

    placed = place_quote("The oven broke", "let them go.", span(sentences, 6, 8), sentences)

    assert placed is not None
    assert (placed.first_sentence, placed.last_sentence) == (7, 8)


def test_a_clip_may_end_after_its_window_does() -> None:
    sentences = speak(TALK)

    placed = place_quote("Nobody left angry.", "let them go.", span(sentences, 2, 4), sentences)

    assert placed is not None
    assert (placed.first_sentence, placed.last_sentence) == (3, 8)


def test_opening_words_that_are_not_in_the_window_give_nothing() -> None:
    sentences = speak(TALK)
    window = span(sentences, 1, 4)

    assert place_quote("The secret to pricing bread", "is silence.", window, sentences) is None
    assert place_quote("Now let me talk about price.", "let them go.", window, sentences) is None


def test_opening_words_that_begin_in_the_last_sentence_of_the_window_are_found() -> None:
    sentences = speak(TALK)

    placed = place_quote("Customers forgive", "is silence.", span(sentences, 1, 4), sentences)

    assert placed is not None
    assert (placed.first_sentence, placed.last_sentence) == (4, 5)


def test_closing_words_that_come_only_before_the_opening_words_give_nothing() -> None:
    sentences = speak(TALK)

    placed = place_quote(
        "What they do not forgive", "Nobody left angry.", span(sentences, 1, 8), sentences
    )

    assert placed is None


def test_closing_words_that_are_nowhere_in_the_transcript_give_nothing() -> None:
    sentences = speak(TALK)

    placed = place_quote(
        "Nobody left angry.", "and that was that.", span(sentences, 1, 8), sentences
    )

    assert placed is None


def test_a_quote_of_no_words_gives_nothing() -> None:
    sentences = speak(TALK)
    window = span(sentences, 1, 8)

    assert place_quote("", "is silence.", window, sentences) is None
    assert place_quote("Nobody left angry.", " … ", window, sentences) is None


def test_a_clip_of_one_sentence_opens_and_closes_in_it() -> None:
    sentences = speak(TALK)

    placed = place_quote("Nobody left", "left angry.", span(sentences, 1, 8), sentences)

    assert placed == Placement(3, 3, start_seconds=sentences[2].start, end_seconds=sentences[2].end)


def test_of_closing_words_said_twice_the_first_after_the_opening_is_taken() -> None:
    sentences = speak("One day it broke. We closed. Then it broke. We closed. So we moved.")

    placed = place_quote("One day it broke.", "We closed.", span(sentences, 1, 5), sentences)

    assert placed is not None
    assert (placed.first_sentence, placed.last_sentence) == (1, 2)
