from collections.abc import Sequence
from dataclasses import dataclass

from ..review import Framing
from .follow_faces import Middle, Moments, follow_largest_face, follow_two_faces, glide
from .render_plan import (
    FRAME_HEIGHT,
    FRAME_WIDTH,
    Layout,
    PicturePart,
    Place,
    SpeakerLayout,
    StackedLayout,
    WholePictureLayout,
)


@dataclass(frozen=True)
class PictureShape:
    width: int
    height: int

    @property
    def width_over_height(self) -> float:
        return self.width / self.height


@dataclass(frozen=True)
class PartCut:
    width_over_height: float
    widest_share: float


WHOLE_FRAME_CUT = PartCut(FRAME_WIDTH / FRAME_HEIGHT, widest_share=1.0)
HALF_FRAME_CUT = PartCut(2 * FRAME_WIDTH / FRAME_HEIGHT, widest_share=0.5)


def frame_picture(moments: Moments, shape: PictureShape, wanted: Framing) -> Layout:
    match choose_framing(moments, wanted):
        case Framing.WHOLE_FRAME:
            return WholePictureLayout()
        case Framing.STACK_TWO:
            left_path, right_path = follow_two_faces(moments)
            return StackedLayout(
                upper=cut_part(HALF_FRAME_CUT, shape, glide(left_path)),
                lower=cut_part(HALF_FRAME_CUT, shape, glide(right_path)),
            )
        case Framing.FOLLOW_SPEAKER:
            followed = glide(follow_largest_face(moments))
            return SpeakerLayout(cut_part(WHOLE_FRAME_CUT, shape, followed))


def choose_framing(moments: Moments, wanted: Framing) -> Framing:
    if wanted is Framing.STACK_TWO and not shows_two_faces_in_half(moments):
        return Framing.FOLLOW_SPEAKER
    return wanted


def shows_two_faces_in_half(moments: Moments) -> bool:
    with_two = sum(1 for faces in moments if len(faces) >= 2)
    return with_two > 0 and 2 * with_two >= len(moments)


def cut_part(cut: PartCut, shape: PictureShape, middles: Sequence[Middle]) -> PicturePart:
    width = min(cut.widest_share, cut.width_over_height / shape.width_over_height)
    height = width * shape.width_over_height / cut.width_over_height
    places = [
        Place(
            left=keep_inside(middle.across - width / 2, furthest=1 - width),
            top=keep_inside(middle.down - height / 2, furthest=1 - height),
        )
        for middle in middles
    ]
    return PicturePart(width, height, places)


def keep_inside(edge: float, furthest: float) -> float:
    return min(max(edge, 0.0), max(furthest, 0.0))
