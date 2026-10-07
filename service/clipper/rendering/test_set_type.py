from pathlib import Path

import pytest

from ..review import CaptionWord
from .load_typeface import ARIAL_UNICODE_FILE, INTER_FILE, is_in_inter, load_inter, load_typeface
from .set_type import Lettering, SetText, TextBox, set_text

LETTERING = Lettering(size=60, weight=700, line_height=1.1)
BOX = TextBox(left=86.4, top=1152.0, width=907.2)
needs_arial_unicode = pytest.mark.skipif(
    not ARIAL_UNICODE_FILE.is_file(), reason="This Mac has no Arial Unicode."
)


def set_words(*texts: str) -> SetText:
    return set_text([CaptionWord(text, is_highlighted=False) for text in texts], LETTERING, BOX)


def list_lines(text: SetText) -> list[list[str]]:
    baselines = sorted({placed.baseline for placed in text.words})
    return [
        [placed.word.text for placed in text.words if placed.baseline == baseline]
        for baseline in baselines
    ]


def test_words_that_fit_stand_on_one_line_in_the_middle_of_the_box() -> None:
    text = set_words("tell", "you", "about")

    font = load_inter(60, 700)
    line_width = font.getlength("tell you about")
    assert list_lines(text) == [["tell", "you", "about"]]
    assert text.words[0].left == pytest.approx(BOX.left + (BOX.width - line_width) / 2)
    assert text.words[1].left == pytest.approx(text.words[0].left + font.getlength("tell "))
    assert text.height == pytest.approx(66.0)


def test_the_first_baseline_lies_where_a_line_of_that_height_centres_the_letters() -> None:
    text = set_words("tell")

    ascent, descent = load_inter(60, 700).getmetrics()
    assert text.words[0].baseline == pytest.approx(BOX.top + (66.0 - ascent - descent) / 2 + ascent)


def test_words_too_wide_for_one_line_wrap_onto_lines_one_line_height_apart() -> None:
    text = set_words("extraordinarily", "complicated", "circumstances", "notwithstanding")

    lines = list_lines(text)
    baselines = sorted({placed.baseline for placed in text.words})
    assert lines == [["extraordinarily", "complicated"], ["circumstances", "notwithstanding"]]
    assert baselines[1] - baselines[0] == pytest.approx(66.0)
    assert text.height == pytest.approx(132.0)


def test_a_word_wider_than_the_box_is_set_smaller_until_it_fits() -> None:
    long_word = "Pneumonoultramicroscopicsilicovolcanoconiosis"

    text = set_words(long_word)

    assert text.font.size < LETTERING.size
    assert text.font.getlength(long_word) <= BOX.width
    assert load_inter(int(text.font.size) + 2, 700).getlength(long_word) > BOX.width
    assert text.height == pytest.approx(text.font.size * 1.1)


def test_a_latin_text_is_set_in_the_inter_file_of_the_web_app() -> None:
    font = load_typeface("The oven broke — “before” sunrise?", 54, 800)

    assert Path(str(font.path)) == INTER_FILE
    assert INTER_FILE.parts[-5:] == ("web", "public", "fonts", "inter", "InterVariable.ttf")


def test_inter_is_wider_at_a_heavier_weight() -> None:
    assert load_inter(79, 900).getlength("ABOUT") > load_inter(79, 400).getlength("ABOUT") + 5


@pytest.mark.parametrize("character", ["A", "é", "я", "λ", " "])
def test_inter_holds_latin_greek_and_cyrillic_letters_and_a_space_counts_as_held(
    character: str,
) -> None:
    assert is_in_inter(character)


@pytest.mark.parametrize("character", ["日", "한", "ع", "ह", "ไ"])
def test_inter_lacks_the_letters_of_other_scripts(character: str) -> None:
    assert not is_in_inter(character)


@needs_arial_unicode
def test_a_text_with_a_character_inter_lacks_is_set_whole_in_arial_unicode() -> None:
    font = load_typeface("Tokyo 東京", 79, 900)

    assert Path(str(font.path)) == ARIAL_UNICODE_FILE
