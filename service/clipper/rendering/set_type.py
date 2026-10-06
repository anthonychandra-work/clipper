from collections.abc import Sequence
from dataclasses import dataclass

from PIL.ImageFont import FreeTypeFont

from ..review import CaptionWord
from .load_typeface import load_typeface

SMALLEST_SIZE = 12


@dataclass(frozen=True)
class Lettering:
    size: int
    weight: int
    line_height: float


@dataclass(frozen=True)
class TextBox:
    left: float
    top: float
    width: float


@dataclass(frozen=True)
class PlacedWord:
    word: CaptionWord
    left: float
    baseline: float


@dataclass(frozen=True)
class SetText:
    font: FreeTypeFont
    words: list[PlacedWord]
    height: float


def set_text(words: Sequence[CaptionWord], lettering: Lettering, box: TextBox) -> SetText:
    font = fit_typeface(words, lettering, box.width)
    line_height = font.size * lettering.line_height
    ascent, descent = font.getmetrics()
    first_baseline = box.top + (line_height - ascent - descent) / 2 + ascent
    lines = wrap_words(words, font, box.width)
    placed = [
        placed_word
        for number, line in enumerate(lines)
        for placed_word in place_line(line, font, box, first_baseline + number * line_height)
    ]
    return SetText(font, placed, len(lines) * line_height)


def fit_typeface(words: Sequence[CaptionWord], lettering: Lettering, width: float) -> FreeTypeFont:
    whole_text = " ".join(word.text for word in words)
    size = lettering.size
    font = load_typeface(whole_text, size, lettering.weight)
    while size > SMALLEST_SIZE and (widest := measure_widest_word(words, font)) > width:
        size = max(SMALLEST_SIZE, min(size - 1, int(size * width / widest)))
        font = load_typeface(whole_text, size, lettering.weight)
    return font


def measure_widest_word(words: Sequence[CaptionWord], font: FreeTypeFont) -> float:
    return max(font.getlength(word.text) for word in words)


def wrap_words(
    words: Sequence[CaptionWord], font: FreeTypeFont, width: float
) -> list[list[CaptionWord]]:
    lines: list[list[CaptionWord]] = []
    for word in words:
        if lines and measure_line([*lines[-1], word], font) <= width:
            lines[-1].append(word)
        else:
            lines.append([word])
    return lines


def measure_line(line: Sequence[CaptionWord], font: FreeTypeFont) -> float:
    return font.getlength(" ".join(word.text for word in line))


def place_line(
    line: Sequence[CaptionWord], font: FreeTypeFont, box: TextBox, baseline: float
) -> list[PlacedWord]:
    line_left = box.left + (box.width - measure_line(line, font)) / 2
    placed: list[PlacedWord] = []
    for word in line:
        words_before = " ".join([*(earlier.word.text for earlier in placed), ""])
        placed.append(PlacedWord(word, line_left + font.getlength(words_before), baseline))
    return placed
