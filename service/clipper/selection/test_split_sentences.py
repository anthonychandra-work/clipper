import pytest

from ..transcription import Transcript, TranscriptWord
from .split_sentences import Sentence, split_sentences

WORD_SECONDS = 0.4
GAP_SECONDS = 0.1


def speak(text: str, *, start: float = 0.0) -> list[TranscriptWord]:
    words: list[TranscriptWord] = []
    for at, spoken in enumerate(text.split()):
        begins = round(start + at * (WORD_SECONDS + GAP_SECONDS), 2)
        words.append(
            TranscriptWord(text=f" {spoken}", start=begins, end=round(begins + WORD_SECONDS, 2))
        )
    return words


def speak_with_pauses(pause_after: dict[int, float], word_count: int) -> list[TranscriptWord]:
    words: list[TranscriptWord] = []
    begins = 0.0
    for at in range(word_count):
        words.append(TranscriptWord(text=f" word{at}", start=begins, end=round(begins + 0.9, 2)))
        begins = round(begins + 0.9 + pause_after.get(at, GAP_SECONDS), 2)
    return words


def read_texts(sentences: list[Sentence]) -> list[str]:
    return [sentence.text for sentence in sentences]


@pytest.mark.parametrize("mark", [".", "?", "!", "…", "。", "？", "！", "?!", "..."])
def test_each_end_mark_ends_a_sentence(mark: str) -> None:
    sentences = split_sentences(speak(f"The oven broke{mark} Nobody left angry."))

    assert read_texts(sentences) == [f"The oven broke{mark}", "Nobody left angry."]


@pytest.mark.parametrize("closing", ['"', "'", "”", "’", "»", ")", "]", "”)"])
def test_a_closing_quotation_mark_or_bracket_after_an_end_mark_stays_with_its_sentence(
    closing: str,
) -> None:
    sentences = split_sentences(speak(f"I said the oven is broken.{closing} Nobody left."))

    assert read_texts(sentences) == [f"I said the oven is broken.{closing}", "Nobody left."]


def test_the_last_word_ends_a_sentence_without_an_end_mark() -> None:
    sentences = split_sentences(speak("Write things down. Every recipe and every supplier"))

    assert read_texts(sentences) == ["Write things down.", "Every recipe and every supplier"]


def test_a_mark_inside_a_word_or_a_comma_ends_nothing() -> None:
    sentences = split_sentences(speak("Bread costs 3.5 dollars, and the rent, well, is late."))

    assert read_texts(sentences) == ["Bread costs 3.5 dollars, and the rent, well, is late."]


def test_a_sentence_knows_its_number_its_words_its_start_and_its_end() -> None:
    words = speak("Good morning. That is a mistake. Smile!", start=10.0)

    first, second, third = split_sentences(words)

    assert [sentence.number for sentence in (first, second, third)] == [1, 2, 3]
    assert second.words == tuple(words[2:6])
    assert (first.start, first.end) == (10.0, 10.9)
    assert (second.start, second.end) == (11.0, 12.9)
    assert (third.start, third.end) == (13.0, 13.4)


def test_no_words_give_no_sentence() -> None:
    assert split_sentences([]) == []


def test_seventy_seconds_without_punctuation_are_split_at_the_longest_pauses() -> None:
    words = speak_with_pauses({19: 0.8, 44: 0.5, 60: 0.3}, word_count=70)

    sentences = split_sentences(words)

    assert words[-1].end - words[0].start > 70
    assert [len(sentence.words) for sentence in sentences] == [20, 25, 25]
    assert all(sentence.end - sentence.start <= 30 for sentence in sentences)
    assert [word for sentence in sentences for word in sentence.words] == words


def test_the_longest_pause_is_cut_first_wherever_it_lies() -> None:
    words = speak_with_pauses({4: 2.0}, word_count=40)

    sentences = split_sentences(words)

    assert len(sentences[0].words) == 5
    assert all(sentence.end - sentence.start <= 30 for sentence in sentences)


def test_of_equal_pauses_the_one_nearest_the_middle_is_cut() -> None:
    words = speak_with_pauses({}, word_count=70)

    sentences = split_sentences(words)

    assert [len(sentence.words) for sentence in sentences] == [17, 18, 17, 18]
    assert all(sentence.end - sentence.start <= 30 for sentence in sentences)


def test_one_word_longer_than_thirty_seconds_stays_whole() -> None:
    held = TranscriptWord(text=" Mmmmm", start=0.0, end=42.0)

    assert [sentence.words for sentence in split_sentences([held])] == [(held,)]


def test_the_committed_transcript_of_the_talk_has_54_sentences(talk_transcript: Transcript) -> None:
    sentences = split_sentences(talk_transcript.words)

    assert len(sentences) == 54
    assert sentences[0].text == "Thank you all for coming tonight."
    assert sentences[-1].text == "Please stay for a coffee, and come and say hello."
    assert round(max(sentence.end - sentence.start for sentence in sentences), 2) == 17.1
    assert sum(len(sentence.words) for sentence in sentences) == 628
