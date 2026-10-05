import re
from collections.abc import Sequence
from dataclasses import dataclass

from .split_sentences import Sentence
from .split_windows import Window

NOT_A_LETTER_OR_DIGIT = re.compile(r"[\W_]+")


@dataclass(frozen=True)
class Placement:
    first_sentence: int
    last_sentence: int
    start_seconds: float
    end_seconds: float


@dataclass(frozen=True)
class SpokenWord:
    plain: str
    sentence: Sentence


def place_quote(
    opening_words: str, closing_words: str, window: Window, sentences: Sequence[Sentence]
) -> Placement | None:
    spoken = list_spoken_words(sentences[window.first_sentence - 1 :])
    in_window = sum(1 for word in spoken if word.sentence.number <= window.last_sentence)
    opens_at = find_quote(spoken, opening_words, range(in_window))
    if opens_at is None:
        return None
    closes_at = find_quote(spoken, closing_words, range(opens_at, len(spoken)))
    if closes_at is None:
        return None
    first = spoken[opens_at].sentence
    last = spoken[closes_at + len(strip_to_plain_words(closing_words)) - 1].sentence
    return Placement(first.number, last.number, start_seconds=first.start, end_seconds=last.end)


def list_spoken_words(sentences: Sequence[Sentence]) -> list[SpokenWord]:
    return [
        SpokenWord(plain, sentence)
        for sentence in sentences
        for word in sentence.words
        for plain in strip_to_plain_words(word.text)
    ]


def find_quote(spoken: Sequence[SpokenWord], quote: str, starts: range) -> int | None:
    quoted = strip_to_plain_words(quote)
    if not quoted:
        return None
    plain = [word.plain for word in spoken]
    return next((at for at in starts if plain[at : at + len(quoted)] == quoted), None)


def strip_to_plain_words(text: str) -> list[str]:
    stripped = (NOT_A_LETTER_OR_DIGIT.sub("", word.casefold()) for word in text.split())
    return [word for word in stripped if word]
