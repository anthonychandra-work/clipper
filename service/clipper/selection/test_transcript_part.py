from ..transcription import Transcript, TranscriptWord
from .split_sentences import Sentence, split_sentences
from .transcript_part import write_transcript_part


def say(number: int, text: str, start: float) -> Sentence:
    return Sentence(number, (TranscriptWord(text=text, start=start, end=start + 2),))


def test_each_sentence_is_one_line_with_its_number_its_start_and_its_text() -> None:
    sentences = [say(1, " Good morning.", 0), say(2, " That is a mistake.", 2.5)]

    assert write_transcript_part(sentences) == "1 [0.00] Good morning.\n2 [2.50] That is a mistake."


def test_the_start_is_given_in_seconds_to_a_hundredth() -> None:
    part = write_transcript_part([say(118, " Write things down.", 7198.5)])

    assert part == "118 [7198.50] Write things down."


def test_a_line_break_inside_a_sentence_does_not_break_its_line() -> None:
    part = write_transcript_part([say(1, " Smile,\n and  let them go.", 80.64)])

    assert part == "1 [80.64] Smile, and let them go."


def test_no_sentence_gives_an_empty_part() -> None:
    assert write_transcript_part([]) == ""


def test_the_part_of_the_committed_transcript_is_the_same_text_every_time(
    talk_transcript: Transcript,
) -> None:
    first = write_transcript_part(split_sentences(talk_transcript.words))
    second = write_transcript_part(split_sentences(talk_transcript.words))

    lines = first.splitlines()
    assert first == second
    assert len(lines) == 54
    assert lines[0] == "1 [0.00] Thank you all for coming tonight."
    assert lines[11] == "12 [42.56] What they do not forgive is silence."
    assert lines[53] == "54 [231.30] Please stay for a coffee, and come and say hello."
