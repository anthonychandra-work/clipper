import hashlib
import threading
from pathlib import Path

import numpy as np
import numpy.typing as npt
import pytest
from PIL import Image

from ..media import MediaWorkStoppedError
from ..review import CaptionStyle, CaptionWord, Framing
from .draw_overlays import OverlayLook, draw_overlay, draw_overlays
from .load_typeface import ARIAL_UNICODE_FILE, INTER_FILE, load_inter
from .overlay_timeline import Overlay, OverlayChange
from .render_plan import TimedOverlay

type Pixels = npt.NDArray[np.uint8]
type Mask = npt.NDArray[np.bool_]

INTER_CHECKSUM = "4989b125924991b90d05b2d16e0e388c48f7d5bb8b30539bbf9c755278d0ccaf"
HOOK_TITLE = "The oven broke before sunrise"
WHITE = (255, 255, 255, 255)
YELLOW = (255, 214, 0, 255)
INK = (17, 19, 24, 255)
FRAME_HEIGHT = 1920
HOOK_BOX_ROWS = (192, 311)
HOOK_BOX_COLUMNS = (97, 982)
CAPTION_BOX_COLUMNS = (86, 993)
KEYWORD_SIZE = 79
SIX_LONG_WORDS = (
    "extraordinarily complicated circumstances notwithstanding everything happened".split()
)
THIRTY_LETTERS = "Pneumonoultramicroscopicsilico"
STACKED_KEYWORDS = OverlayLook(CaptionStyle.KEYWORD, Framing.STACK_TWO)
needs_arial_unicode = pytest.mark.skipif(
    not ARIAL_UNICODE_FILE.is_file(), reason="This Mac has no Arial Unicode."
)


def caption(*texts: str, highlighted: str | None = None) -> Overlay:
    return Overlay(words=tuple(CaptionWord(text, text == highlighted) for text in texts))


def draw(
    overlay: Overlay,
    style: CaptionStyle = CaptionStyle.KEYWORD,
    framing: Framing = Framing.FOLLOW_SPEAKER,
) -> Pixels:
    return np.asarray(draw_overlay(overlay, OverlayLook(style, framing)))


def find(picture: Pixels, colour: tuple[int, int, int, int]) -> Mask:
    found: Mask = (picture == colour).all(axis=2)
    return found


def span_rows(mask: Mask) -> tuple[int, int]:
    rows = np.flatnonzero(mask.any(axis=1))
    return int(rows[0]), int(rows[-1])


def span_columns(mask: Mask) -> tuple[int, int]:
    columns = np.flatnonzero(mask.any(axis=0))
    return int(columns[0]), int(columns[-1])


def count_lines(mask: Mask) -> int:
    has_letters = mask.any(axis=1).astype(int)
    return int((np.diff(has_letters) == 1).sum())


def measure_solid_width(text: str, weight: int) -> int:
    shape = load_inter(KEYWORD_SIZE, weight).getmask(text)
    solid: Mask = np.frombuffer(bytes(shape), np.uint8).reshape(shape.size[::-1]) == 255
    first_column, last_column = span_columns(solid)
    return last_column - first_column


def test_an_overlay_is_a_picture_of_the_frame_that_is_clear_outside_the_title_and_the_caption() -> (
    None
):
    picture = draw(Overlay(caption("tell", "you", "about").words, HOOK_TITLE))

    drawn_rows = np.flatnonzero((picture[:, :, 3] > 0).any(axis=1))
    assert picture.shape == (1920, 1080, 4)
    assert drawn_rows[0] == HOOK_BOX_ROWS[0]
    assert not ((drawn_rows > HOOK_BOX_ROWS[1]) & (drawn_rows < 1090)).any()
    assert drawn_rows[-1] < 1320


def test_an_overlay_with_neither_a_caption_nor_a_hook_title_is_clear_everywhere() -> None:
    assert not draw(Overlay()).any()


def test_the_hook_title_is_in_a_white_box_10_percent_down_with_9_percent_free_beside_it() -> None:
    picture = draw(Overlay(hook_title=HOOK_TITLE))

    paper, letters = find(picture, WHITE), find(picture, INK)
    middle_row = sum(HOOK_BOX_ROWS) // 2
    assert span_rows(paper) == HOOK_BOX_ROWS
    assert span_columns(paper[middle_row : middle_row + 1]) == HOOK_BOX_COLUMNS
    assert not picture[HOOK_BOX_ROWS[0], HOOK_BOX_COLUMNS[0], 3]
    assert letters.any()
    assert sum(span_columns(letters)) / 2 == pytest.approx(540, abs=3)
    assert HOOK_BOX_ROWS[0] + 29 < span_rows(letters)[0] < span_rows(letters)[1] < 311 - 29


def test_a_hook_title_too_long_for_one_line_wraps_inside_a_taller_box() -> None:
    picture = draw(Overlay(hook_title=f"{HOOK_TITLE} and nobody in the whole town knew"))

    paper, letters = find(picture, WHITE), find(picture, INK)
    assert span_rows(paper) == (HOOK_BOX_ROWS[0], HOOK_BOX_ROWS[1] + 2 * 62)
    assert count_lines(letters[:, 540:541] | letters[:, 500:501] | letters[:, 580:581]) == 3
    assert HOOK_BOX_COLUMNS[0] + 36 <= span_columns(letters)[0]
    assert span_columns(letters)[1] <= HOOK_BOX_COLUMNS[1] - 36


@pytest.mark.parametrize(
    ("framing", "top_share"),
    [(Framing.FOLLOW_SPEAKER, 0.60), (Framing.STACK_TWO, 0.45), (Framing.WHOLE_FRAME, 0.68)],
)
def test_the_top_edge_of_the_caption_lies_where_the_framing_puts_it(
    framing: Framing, top_share: float
) -> None:
    picture = draw(caption("TELL", "YOU", "ABOUT"), framing=framing)

    first_letter_row = span_rows(find(picture, WHITE))[0]
    top_edge = top_share * FRAME_HEIGHT
    assert top_edge < first_letter_row < top_edge + KEYWORD_SIZE / 4


def test_a_keyword_caption_is_in_capitals_with_yellow_only_inside_the_highlighted_word() -> None:
    picture = draw(caption("tell", "you", "about", highlighted="about"))

    in_capitals = draw(caption("TELL", "YOU", "ABOUT", highlighted="ABOUT"))
    white, yellow = find(picture, WHITE), find(picture, YELLOW)
    assert np.array_equal(picture, in_capitals)
    assert span_columns(white)[1] < span_columns(yellow)[0]
    assert span_columns(yellow)[1] - span_columns(yellow)[0] == pytest.approx(
        measure_solid_width("ABOUT", weight=900), abs=2
    )


def test_a_keyword_caption_without_a_highlighted_word_has_no_yellow() -> None:
    assert not find(draw(caption("tell", "you")), YELLOW).any()


def test_an_each_word_caption_is_larger_than_a_keyword_caption() -> None:
    keyword = find(draw(caption("ABOUT")), WHITE)
    each_word = find(draw(caption("about"), style=CaptionStyle.WORD_BY_WORD), WHITE)

    keyword_height = span_rows(keyword)[1] - span_rows(keyword)[0]
    each_word_height = span_rows(each_word)[1] - span_rows(each_word)[0]
    assert each_word_height == pytest.approx(keyword_height * 114 / 79, abs=3)


def test_a_plain_caption_keeps_its_small_letters_and_is_smaller() -> None:
    as_spoken = find(draw(caption("about"), style=CaptionStyle.PLAIN), WHITE)
    in_capitals = find(draw(caption("ABOUT"), style=CaptionStyle.PLAIN), WHITE)
    keyword = find(draw(caption("ABOUT")), WHITE)

    assert not np.array_equal(as_spoken, in_capitals)
    plain_height = span_rows(in_capitals)[1] - span_rows(in_capitals)[0]
    assert plain_height == pytest.approx(
        (span_rows(keyword)[1] - span_rows(keyword)[0]) * 60 / 79, abs=3
    )


def test_a_caption_of_six_long_words_wraps_onto_more_lines_inside_the_box() -> None:
    letters = find(draw(caption(*SIX_LONG_WORDS), style=CaptionStyle.PLAIN), WHITE)

    first_column, last_column = span_columns(letters)
    assert count_lines(letters) == 3
    assert CAPTION_BOX_COLUMNS[0] <= first_column < last_column <= CAPTION_BOX_COLUMNS[1]


def test_a_word_of_thirty_letters_is_drawn_smaller_and_stays_inside_the_box() -> None:
    usual = find(draw(caption("about"), style=CaptionStyle.WORD_BY_WORD), WHITE)

    letters = find(draw(caption(THIRTY_LETTERS), style=CaptionStyle.WORD_BY_WORD), WHITE)

    first_column, last_column = span_columns(letters)
    assert CAPTION_BOX_COLUMNS[0] <= first_column < last_column <= CAPTION_BOX_COLUMNS[1]
    assert last_column - first_column > 0.9 * (CAPTION_BOX_COLUMNS[1] - CAPTION_BOX_COLUMNS[0])
    assert span_rows(letters)[1] - span_rows(letters)[0] < 0.6 * (
        span_rows(usual)[1] - span_rows(usual)[0]
    )


def test_the_letters_are_as_wide_as_inter_at_weight_900_and_wider_than_at_weight_400() -> None:
    first_column, last_column = span_columns(find(draw(caption("ABOUT")), WHITE))

    drawn_width = last_column - first_column
    assert drawn_width == pytest.approx(measure_solid_width("ABOUT", weight=900), abs=2)
    assert drawn_width > measure_solid_width("ABOUT", weight=400) + 5


def test_a_caption_has_a_black_shadow_under_it_and_a_soft_one_around_it() -> None:
    picture = draw(caption("ABOUT"))

    first_row, last_row = span_rows(find(picture, WHITE))
    first_column, last_column = span_columns(find(picture, WHITE))
    under = picture[last_row + 4, first_column:last_column]
    around = picture[first_row - 20, first_column:last_column]
    assert (under[:, 3] == 255).any()
    assert not under[under[:, 3] == 255][:, :3].any()
    assert (around[:, 3] > 0).all()
    assert (around[:, 3] < 255).all()
    assert not around[:, :3].any()


@needs_arial_unicode
def test_a_caption_in_japanese_is_drawn_in_other_shapes_than_the_box_of_a_missing_character() -> (
    None
):
    forwards = find(draw(caption("日本語")), WHITE)
    backwards = find(draw(caption("語本日")), WHITE)

    assert forwards.any()
    assert not np.array_equal(forwards, backwards)


def test_the_file_the_drawing_reads_has_the_checksum_of_inter_4_1() -> None:
    assert hashlib.sha256(INTER_FILE.read_bytes()).hexdigest() == INTER_CHECKSUM


def test_each_distinct_overlay_is_drawn_once_into_the_work_folder_and_listed_with_its_moments(
    tmp_path: Path,
) -> None:
    said, more = caption("tell", "you"), caption("about")
    changes = [
        OverlayChange(0.0, Overlay()),
        OverlayChange(0.5, said),
        OverlayChange(1.4, more),
        OverlayChange(2.2, said),
    ]

    timed = draw_overlays(changes, STACKED_KEYWORDS, tmp_path, threading.Event())

    assert timed == [
        TimedOverlay("overlay-000.png", 0.0),
        TimedOverlay("overlay-001.png", 0.5),
        TimedOverlay("overlay-002.png", 1.4),
        TimedOverlay("overlay-001.png", 2.2),
    ]
    assert sorted(written.name for written in tmp_path.iterdir()) == [
        "overlay-000.png",
        "overlay-001.png",
        "overlay-002.png",
    ]
    with Image.open(tmp_path / "overlay-001.png") as written:
        assert (written.size, written.mode) == ((1080, 1920), "RGBA")
        assert np.array_equal(np.asarray(written), draw(said, framing=Framing.STACK_TWO))


def test_a_stop_ends_the_drawing_as_stopped_before_the_next_picture(tmp_path: Path) -> None:
    stop = threading.Event()
    stop.set()
    changes = [OverlayChange(0.0, Overlay()), OverlayChange(0.5, caption("tell", "you"))]

    with pytest.raises(MediaWorkStoppedError):
        draw_overlays(changes, STACKED_KEYWORDS, tmp_path, stop)

    assert list(tmp_path.iterdir()) == []
