from itertools import cycle, pairwise

from ..transcription import Transcript, TranscriptWord
from .split_sentences import Sentence, split_sentences
from .split_windows import Window, split_windows

THREE_HOURS = 3 * 60 * 60
SENTENCE_SECONDS = [3.2, 7.5, 12.1, 4.4, 9.8, 2.0, 15.3, 6.6, 28.0, 5.1, 1.1]
PAUSE_SECONDS = [0.3, 0.0, 0.6, 0.2, 1.4]


def make_sentences(lengths: list[float], pause: float = 0.0) -> list[Sentence]:
    sentences: list[Sentence] = []
    begins = 0.0
    for number, length in enumerate(lengths, start=1):
        word = TranscriptWord(
            text=f" Sentence{number}.", start=begins, end=round(begins + length, 2)
        )
        sentences.append(Sentence(number, (word,)))
        begins = round(word.end + pause, 2)
    return sentences


def make_long_transcript() -> list[Sentence]:
    sentences: list[Sentence] = []
    begins = 0.0
    for length, pause in zip(cycle(SENTENCE_SECONDS), cycle(PAUSE_SECONDS), strict=False):
        if begins + length > THREE_HOURS:
            return sentences
        word = TranscriptWord(text=" Said.", start=begins, end=round(begins + length, 2))
        sentences.append(Sentence(len(sentences) + 1, (word,)))
        begins = round(word.end + pause, 2)
    return sentences


def read_spans(windows: list[Window]) -> list[tuple[int, int]]:
    return [(window.first_sentence, window.last_sentence) for window in windows]


def test_every_window_of_a_three_hour_transcript_starts_and_ends_on_a_sentence() -> None:
    sentences = make_long_transcript()

    windows = split_windows(sentences)

    assert sentences[-1].end > THREE_HOURS - 30
    assert len(windows) > 150
    for window in windows:
        assert window.start_seconds == sentences[window.first_sentence - 1].start
        assert window.end_seconds == sentences[window.last_sentence - 1].end
        assert window.first_sentence <= window.last_sentence


def test_no_window_of_a_three_hour_transcript_but_the_last_is_longer_than_90_seconds() -> None:
    windows = split_windows(make_long_transcript())

    lengths = [window.end_seconds - window.start_seconds for window in windows]
    assert max(lengths[:-1]) <= 90
    assert min(lengths[:-1]) > 60


def test_each_next_window_starts_at_or_after_30_seconds_before_the_one_before_it_ends() -> None:
    windows = split_windows(make_long_transcript())

    for earlier, later in pairwise(windows):
        assert later.start_seconds >= earlier.end_seconds - 30
        assert later.first_sentence > earlier.first_sentence
        assert later.last_sentence > earlier.last_sentence


def test_every_sentence_of_a_three_hour_transcript_is_in_a_window() -> None:
    sentences = make_long_transcript()

    windows = split_windows(sentences)

    covered = {
        number
        for window in windows
        for number in range(window.first_sentence, window.last_sentence + 1)
    }
    assert covered == {sentence.number for sentence in sentences}
    assert (windows[0].first_sentence, windows[-1].last_sentence) == (1, len(sentences))


def test_windows_carry_their_names_in_the_order_of_their_starts() -> None:
    windows = split_windows(make_long_transcript())

    assert [window.id for window in windows[:3]] == ["w01", "w02", "w03"]
    assert windows[99].id == "w100"
    assert [window.start_seconds for window in windows] == sorted(
        window.start_seconds for window in windows
    )


def test_a_transcript_of_one_sentence_gives_one_window() -> None:
    (window,) = split_windows(make_sentences([12.5]))

    assert window == Window("w01", 1, 1, 0.0, 12.5)


def test_no_sentence_gives_no_window() -> None:
    assert split_windows([]) == []


def test_a_window_takes_whole_sentences_for_as_long_as_it_stays_at_or_under_90_seconds() -> None:
    windows = split_windows(make_sentences([30, 30, 30, 30, 30, 30]))

    assert read_spans(windows) == [(1, 3), (3, 5), (5, 6)]
    assert windows[0].end_seconds - windows[0].start_seconds == 90


def test_the_next_window_starts_with_the_first_sentence_inside_the_last_30_seconds() -> None:
    windows = split_windows(make_sentences([40, 20, 20, 10, 40, 40, 40]))

    assert read_spans(windows)[:2] == [(1, 4), (3, 5)]
    assert windows[1].start_seconds == 60


def test_a_window_takes_the_rest_when_less_than_30_seconds_would_be_left_after_it() -> None:
    windows = split_windows(make_sentences([40, 40, 20, 9.99]))

    assert read_spans(windows) == [(1, 4)]
    assert windows[0].end_seconds - windows[0].start_seconds > 90


def test_a_rest_of_30_seconds_gets_a_window_of_its_own() -> None:
    windows = split_windows(make_sentences([40, 40, 30]))

    assert read_spans(windows) == [(1, 2), (3, 3)]


def test_the_committed_transcript_of_the_talk_gives_four_windows(
    talk_transcript: Transcript,
) -> None:
    windows = split_windows(split_sentences(talk_transcript.words))

    assert windows == [
        Window("w01", 1, 23, 0.0, 89.92),
        Window("w02", 17, 38, 63.84, 151.02),
        Window("w03", 32, 49, 125.3, 199.66),
        Window("w04", 44, 54, 174.24, 234.56),
    ]
