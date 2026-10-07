import threading
from collections.abc import Sequence
from dataclasses import dataclass, replace
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter
from PIL.ImageFont import FreeTypeFont

from ..media import MediaWorkStoppedError
from ..review import CaptionStyle, CaptionWord, Framing
from .overlay_timeline import Overlay, OverlayChange
from .render_plan import FRAME_HEIGHT, FRAME_WIDTH, TimedOverlay
from .set_type import Lettering, PlacedWord, TextBox, set_text

type Colour = tuple[int, int, int]

FRAME_SIZE = (FRAME_WIDTH, FRAME_HEIGHT)
CLEAR = (0, 0, 0, 0)
WHITE: Colour = (255, 255, 255)
HIGHLIGHT: Colour = (255, 214, 0)
INK: Colour = (17, 19, 24)
BLACK: Colour = (0, 0, 0)

CAPTION_LETTERING = {
    CaptionStyle.KEYWORD: Lettering(size=79, weight=900, line_height=1.1),
    CaptionStyle.WORD_BY_WORD: Lettering(size=114, weight=900, line_height=1.1),
    CaptionStyle.PLAIN: Lettering(size=60, weight=700, line_height=1.1),
}
CAPTION_TOP = {
    Framing.FOLLOW_SPEAKER: 0.60,
    Framing.STACK_TWO: 0.45,
    Framing.WHOLE_FRAME: 0.68,
}
CAPTION_MARGIN = 0.08
SHADOW_DROP = 7
SHADOW_BLUR = 18

HOOK_LETTERING = Lettering(size=54, weight=800, line_height=1.15)
HOOK_TOP = 0.10
HOOK_MARGIN = 0.09
HOOK_CORNER = 43
HOOK_PADDING_ABOVE = 29
HOOK_PADDING_BESIDE = 36


@dataclass(frozen=True)
class OverlayLook:
    caption_style: CaptionStyle
    framing: Framing


def draw_overlays(
    changes: Sequence[OverlayChange], look: OverlayLook, work_dir: Path, stop: threading.Event
) -> list[TimedOverlay]:
    names: dict[Overlay, str] = {}
    for change in changes:
        if change.overlay in names:
            continue
        if stop.is_set():
            raise MediaWorkStoppedError()
        names[change.overlay] = f"overlay-{len(names):03d}.png"
        draw_overlay(change.overlay, look).save(work_dir / names[change.overlay])
    return [TimedOverlay(names[change.overlay], change.start_seconds) for change in changes]


def draw_overlay(overlay: Overlay, look: OverlayLook) -> Image.Image:
    picture = Image.new("RGBA", FRAME_SIZE, CLEAR)
    if overlay.hook_title:
        picture = draw_hook_title(picture, overlay.hook_title)
    if overlay.words:
        picture = draw_caption(picture, overlay.words, look)
    return picture


def draw_hook_title(picture: Image.Image, hook_title: str) -> Image.Image:
    margin, top = round(HOOK_MARGIN * FRAME_WIDTH), round(HOOK_TOP * FRAME_HEIGHT)
    text_box = TextBox(
        left=margin + HOOK_PADDING_BESIDE,
        top=top + HOOK_PADDING_ABOVE,
        width=FRAME_WIDTH - 2 * (margin + HOOK_PADDING_BESIDE),
    )
    words = [CaptionWord(text, is_highlighted=False) for text in hook_title.split()]
    title = set_text(words, HOOK_LETTERING, text_box)
    last_row = top + round(title.height) + 2 * HOOK_PADDING_ABOVE - 1
    last_column = FRAME_WIDTH - margin - 1
    paper = Image.new("L", FRAME_SIZE, 0)
    ImageDraw.Draw(paper).rounded_rectangle(
        (margin, top, last_column, last_row), radius=HOOK_CORNER, fill=255
    )
    return stamp(stamp(picture, paper, WHITE), trace_words(title.words, title.font), INK)


def draw_caption(
    picture: Image.Image, words: Sequence[CaptionWord], look: OverlayLook
) -> Image.Image:
    margin = CAPTION_MARGIN * FRAME_WIDTH
    box = TextBox(margin, CAPTION_TOP[look.framing] * FRAME_HEIGHT, FRAME_WIDTH - 2 * margin)
    lettering = CAPTION_LETTERING[look.caption_style]
    caption = set_text(letter_words(words, look.caption_style), lettering, box)
    plain = [placed for placed in caption.words if not placed.word.is_highlighted]
    highlighted = [placed for placed in caption.words if placed.word.is_highlighted]
    shaded = stamp(picture, shade(trace_words(caption.words, caption.font)), BLACK)
    lettered = stamp(shaded, trace_words(plain, caption.font), WHITE)
    return stamp(lettered, trace_words(highlighted, caption.font), HIGHLIGHT)


def letter_words(words: Sequence[CaptionWord], style: CaptionStyle) -> list[CaptionWord]:
    if style is CaptionStyle.PLAIN:
        return list(words)
    return [replace(word, text=word.text.upper()) for word in words]


def trace_words(words: Sequence[PlacedWord], font: FreeTypeFont) -> Image.Image:
    traced = Image.new("L", FRAME_SIZE, 0)
    pen = ImageDraw.Draw(traced)
    for placed in words:
        pen.text((placed.left, placed.baseline), placed.word.text, font=font, fill=255, anchor="ls")
    return traced


def shade(letters: Image.Image) -> Image.Image:
    under = ImageChops.offset(letters, 0, SHADOW_DROP)
    around = letters.filter(ImageFilter.GaussianBlur(SHADOW_BLUR))
    return ImageChops.lighter(under, around)


def stamp(picture: Image.Image, shape: Image.Image, colour: Colour) -> Image.Image:
    layer = Image.new("RGBA", FRAME_SIZE, (*colour, 0))
    layer.putalpha(shape)
    return Image.alpha_composite(picture, layer)
