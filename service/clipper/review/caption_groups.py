from collections.abc import Sequence
from dataclasses import dataclass

from ..selection import Sentence
from ..transcription import TranscriptWord
from .review_records import CaptionStyle

WORDS_PER_CAPTION = {
    CaptionStyle.KEYWORD: 3,
    CaptionStyle.WORD_BY_WORD: 1,
    CaptionStyle.PLAIN: 6,
}
KEYWORD_MIN_CHARACTERS = 6
QUOTATION_MARKS = "\"'“”‘’«»„"
PUNCTUATION_AFTER = ".,?!:;…。？！，、)]" + QUOTATION_MARKS
HUNDREDTHS = 100


@dataclass(frozen=True)
class CaptionWord:
    text: str
    is_highlighted: bool


@dataclass(frozen=True)
class Caption:
    start_seconds: float
    words: tuple[CaptionWord, ...]


def group_captions(
    sentences: Sequence[Sentence], style: CaptionStyle, clip_start_seconds: float
) -> list[Caption]:
    groups = [group for sentence in sentences for group in split_sentence(sentence.words, style)]
    return [write_caption(group, style, clip_start_seconds) for group in groups]


def split_sentence(
    words: Sequence[TranscriptWord], style: CaptionStyle
) -> list[Sequence[TranscriptWord]]:
    size = WORDS_PER_CAPTION[style]
    return [words[first : first + size] for first in range(0, len(words), size)]


def write_caption(
    group: Sequence[TranscriptWord], style: CaptionStyle, clip_start_seconds: float
) -> Caption:
    shown = [show_word(word.text) for word in group]
    keyword_place = find_keyword(shown) if style is CaptionStyle.KEYWORD else None
    start_hundredths = round(group[0].start * HUNDREDTHS) - round(clip_start_seconds * HUNDREDTHS)
    return Caption(
        start_seconds=start_hundredths / HUNDREDTHS,
        words=tuple(
            CaptionWord(text, is_highlighted=place == keyword_place)
            for place, text in enumerate(shown)
        ),
    )


def show_word(text: str) -> str:
    return text.strip().lstrip(QUOTATION_MARKS).rstrip(PUNCTUATION_AFTER)


def find_keyword(shown: Sequence[str]) -> int | None:
    strong = [place for place, text in enumerate(shown) if is_strong(text)]
    return max(strong, key=lambda place: len(shown[place]), default=None)


def is_strong(text: str) -> bool:
    return any(character.isdigit() for character in text) or len(text) >= KEYWORD_MIN_CHARACTERS
