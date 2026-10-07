from collections.abc import Sequence
from dataclasses import dataclass

from .split_sentences import Sentence

WINDOW_SECONDS = 90.0
SHARED_SECONDS = 30.0


@dataclass(frozen=True)
class Window:
    id: str
    first_sentence: int
    last_sentence: int
    start_seconds: float
    end_seconds: float


def split_windows(sentences: Sequence[Sentence]) -> list[Window]:
    windows: list[Window] = []
    first = 0
    while first < len(sentences):
        last = find_last_sentence(sentences, first)
        windows.append(describe_window(len(windows) + 1, sentences[first], sentences[last]))
        first = find_next_start(sentences, first, last)
    return windows


def find_last_sentence(sentences: Sequence[Sentence], first: int) -> int:
    last = first
    while last + 1 < len(sentences) and fits_window(sentences[first], sentences[last + 1]):
        last += 1
    is_rest_too_short = sentences[-1].end - sentences[last].end < SHARED_SECONDS
    return len(sentences) - 1 if is_rest_too_short else last


def fits_window(first: Sentence, last: Sentence) -> bool:
    return last.end - first.start <= WINDOW_SECONDS


def find_next_start(sentences: Sequence[Sentence], first: int, last: int) -> int:
    if last == len(sentences) - 1:
        return len(sentences)
    shared_from = sentences[last].end - SHARED_SECONDS
    later = range(first + 1, last + 1)
    return next((at for at in later if sentences[at].start >= shared_from), last + 1)


def describe_window(number: int, first: Sentence, last: Sentence) -> Window:
    return Window(
        id=f"w{number:02d}",
        first_sentence=first.number,
        last_sentence=last.number,
        start_seconds=first.start,
        end_seconds=last.end,
    )
