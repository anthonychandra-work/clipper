from functools import lru_cache
from pathlib import Path

from PIL import ImageFont
from PIL.ImageFont import FreeTypeFont

INTER_FILE = Path(__file__).resolve().parents[3] / "web/public/fonts/inter/InterVariable.ttf"
ARIAL_UNICODE_FILE = Path("/System/Library/Fonts/Supplemental/Arial Unicode.ttf")
SMALLEST_OPTICAL_SIZE = 14
LARGEST_OPTICAL_SIZE = 32
PROBE_SIZE = 32
PROBE_WEIGHT = 400
IN_NO_TYPEFACE = "￿"


def load_typeface(text: str, size: int, weight: int) -> FreeTypeFont:
    if ARIAL_UNICODE_FILE.is_file() and not all(is_in_inter(character) for character in text):
        return load_arial_unicode(size)
    return load_inter(size, weight)


@lru_cache(maxsize=64)
def load_inter(size: int, weight: int) -> FreeTypeFont:
    font = ImageFont.truetype(INTER_FILE, size)
    optical_size = min(max(size, SMALLEST_OPTICAL_SIZE), LARGEST_OPTICAL_SIZE)
    font.set_variation_by_axes([optical_size, weight])
    return font


@lru_cache(maxsize=64)
def load_arial_unicode(size: int) -> FreeTypeFont:
    return ImageFont.truetype(ARIAL_UNICODE_FILE, size)


# A typeface draws the same box for every character it lacks, so that box marks a missing one.
@lru_cache(maxsize=4096)
def is_in_inter(character: str) -> bool:
    return character.isspace() or draw_shape(character) != draw_shape(IN_NO_TYPEFACE)


@lru_cache(maxsize=4096)
def draw_shape(character: str) -> tuple[tuple[int, int], bytes]:
    shape = load_inter(PROBE_SIZE, PROBE_WEIGHT).getmask(character)
    return shape.size, bytes(shape)
