import pytest

from .run_transcriber import HeardSound, HeardWord
from .transcript import NoSpeechError, Transcript, TranscriptWord, build_transcript

TEN_SECONDS = 10.0


def hear(*words: tuple[str, float, float]) -> HeardSound:
    heard = [HeardWord(text=text, start=start, end=end) for text, start, end in words]
    return HeardSound(language="en", words=heard)


def list_times(transcript: Transcript) -> list[tuple[float, float]]:
    return [(word.start, word.end) for word in transcript.words]


def test_the_transcript_holds_the_language_the_model_and_the_words_in_order() -> None:
    heard = hear((" Bread", 0.5, 0.9), (" rises", 0.9, 1.4), (" slowly.", 1.6, 2.2))

    transcript = build_transcript(heard, "small", TEN_SECONDS)

    assert transcript == Transcript(
        language="en",
        model="small",
        words=[
            TranscriptWord(text=" Bread", start=0.5, end=0.9),
            TranscriptWord(text=" rises", start=0.9, end=1.4),
            TranscriptWord(text=" slowly.", start=1.6, end=2.2),
        ],
    )


def test_the_text_of_a_word_is_kept_as_the_model_gave_it() -> None:
    heard = hear((" Café", 0, 1), ("-au", 1, 2), (" lait,", 2, 3), ("好", 3, 4))

    transcript = build_transcript(heard, "small", TEN_SECONDS)

    assert [word.text for word in transcript.words] == [" Café", "-au", " lait,", "好"]


def test_times_are_rounded_to_hundredths_of_a_second() -> None:
    heard = hear((" one", 0.123456, 0.456789), (" two", 1.005001, 1.994999))

    transcript = build_transcript(heard, "small", TEN_SECONDS)

    assert list_times(transcript) == [(0.12, 0.46), (1.01, 1.99)]


def test_a_word_that_starts_before_the_word_before_it_ends_starts_where_that_one_ends() -> None:
    heard = hear((" one", 1.0, 2.0), (" two", 1.5, 2.5), (" three", 0.2, 3.0))

    transcript = build_transcript(heard, "small", TEN_SECONDS)

    assert list_times(transcript) == [(1.0, 2.0), (2.0, 2.5), (2.5, 3.0)]


def test_a_word_that_ends_before_it_starts_ends_where_it_starts() -> None:
    heard = hear((" one", 1.0, 0.4), (" two", 3.0, 2.0), (" three", 1.0, 1.5))

    transcript = build_transcript(heard, "small", TEN_SECONDS)

    assert list_times(transcript) == [(1.0, 1.0), (3.0, 3.0), (3.0, 3.0)]


def test_every_time_is_brought_inside_the_length_of_the_video() -> None:
    heard = hear((" early", -0.4, 0.3), (" late", 9.8, 10.6), (" later", 11.0, 12.0))

    transcript = build_transcript(heard, "small", TEN_SECONDS)

    assert list_times(transcript) == [(0.0, 0.3), (9.8, 10.0), (10.0, 10.0)]


def test_a_length_between_two_hundredths_keeps_every_time_under_it() -> None:
    heard = hear((" last", 235.5, 235.94))

    transcript = build_transcript(heard, "small", 235.933333)

    assert list_times(transcript) == [(235.5, 235.93)]


def test_no_word_at_all_raises_no_speech() -> None:
    with pytest.raises(NoSpeechError):
        build_transcript(HeardSound(language="en", words=[]), "small", TEN_SECONDS)


def test_sound_that_never_reached_the_model_raises_no_speech() -> None:
    with pytest.raises(NoSpeechError):
        build_transcript(HeardSound(language=None, words=[]), "small", TEN_SECONDS)
