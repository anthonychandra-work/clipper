import pytest

from ..review import Framing
from .find_faces import Face
from .follow_faces import FRAMES_PER_MOMENT
from .frame_picture import PictureShape, choose_framing, frame_picture
from .render_plan import PicturePart, SpeakerLayout, StackedLayout, WholePictureLayout

WIDE = PictureShape(1280, 720)
AS_UPRIGHT_AS_THE_FRAME = PictureShape(1080, 1920)
MORE_UPRIGHT = PictureShape(1080, 2400)
UPRIGHT_SHARE_OF_WIDE = (9 / 16) / (16 / 9)
TEN_MOMENTS = 10
FRAMES_OF_TEN_MOMENTS = TEN_MOMENTS * FRAMES_PER_MOMENT


def put_face(across: float, down: float = 0.4, size: float = 0.2) -> Face:
    return Face(left=across - size / 2, top=down - size / 2, width=size, height=size, score=0.9)


def follow_speaker(moments: list[list[Face]], shape: PictureShape = WIDE) -> PicturePart:
    layout = frame_picture(moments, shape, Framing.FOLLOW_SPEAKER)
    assert isinstance(layout, SpeakerLayout)
    return layout.part


def stack_two(moments: list[list[Face]]) -> StackedLayout:
    layout = frame_picture(moments, WIDE, Framing.STACK_TWO)
    assert isinstance(layout, StackedLayout)
    return layout


def show_two_faces_in(moments_with_two: int) -> list[list[Face]]:
    two = [put_face(0.75, size=0.3), put_face(0.25)]
    return [two] * moments_with_two + [[put_face(0.75, size=0.3)]] * (
        TEN_MOMENTS - moments_with_two
    )


def list_lefts(part: PicturePart) -> list[float]:
    return [place.left for place in part.places]


def list_tops(part: PicturePart) -> list[float]:
    return [place.top for place in part.places]


def test_no_face_in_any_moment_gives_the_upright_middle_of_a_wide_picture() -> None:
    part = follow_speaker([[]] * TEN_MOMENTS)

    centred = (1 - UPRIGHT_SHARE_OF_WIDE) / 2
    assert (part.width, part.height) == pytest.approx((UPRIGHT_SHARE_OF_WIDE, 1.0))
    assert list_lefts(part) == pytest.approx([centred] * FRAMES_OF_TEN_MOMENTS)
    assert list_tops(part) == [0.0] * FRAMES_OF_TEN_MOMENTS


@pytest.mark.parametrize(("across", "left"), [(0.05, 0.0), (0.97, 1 - UPRIGHT_SHARE_OF_WIDE)])
def test_a_face_near_an_edge_gives_a_part_that_stays_inside_the_picture(
    across: float, left: float
) -> None:
    part = follow_speaker([[put_face(across)]] * TEN_MOMENTS)

    assert list_lefts(part) == pytest.approx([left] * FRAMES_OF_TEN_MOMENTS)
    assert all(0 <= place.left <= 1 - part.width for place in part.places)


def test_a_face_in_the_picture_has_the_part_around_its_middle() -> None:
    part = follow_speaker([[put_face(0.6)]] * TEN_MOMENTS)

    assert list_lefts(part) == pytest.approx([0.6 - part.width / 2] * FRAMES_OF_TEN_MOMENTS)


def test_a_picture_as_upright_as_the_frame_is_shown_whole() -> None:
    part = follow_speaker([[put_face(0.2, down=0.9)]] * TEN_MOMENTS, AS_UPRIGHT_AS_THE_FRAME)

    assert (part.width, part.height) == pytest.approx((1.0, 1.0))
    assert {(place.left, place.top) for place in part.places} == {(0.0, 0.0)}


@pytest.mark.parametrize(("down", "top"), [(0.2, 0.0), (0.5, 0.1), (0.9, 0.2)])
def test_a_more_upright_picture_moves_the_part_up_and_down_with_the_face(
    down: float, top: float
) -> None:
    part = follow_speaker([[put_face(0.5, down=down)]] * TEN_MOMENTS, MORE_UPRIGHT)

    assert (part.width, part.height) == pytest.approx((1.0, 0.8))
    assert list_tops(part) == pytest.approx([top] * FRAMES_OF_TEN_MOMENTS)
    assert list_lefts(part) == [0.0] * FRAMES_OF_TEN_MOMENTS


@pytest.mark.parametrize("moments_with_two", [5, 10])
def test_two_faces_in_at_least_half_of_the_moments_are_stacked_with_the_left_face_above(
    moments_with_two: int,
) -> None:
    layout = stack_two(show_two_faces_in(moments_with_two))

    assert (layout.upper.width, layout.lower.width) == (0.5, 0.5)
    assert layout.upper.height == layout.lower.height == pytest.approx(0.5 * (16 / 9) / (9 / 8))
    assert list_lefts(layout.upper) == pytest.approx([0.0] * FRAMES_OF_TEN_MOMENTS)
    assert list_lefts(layout.lower) == pytest.approx([0.5] * FRAMES_OF_TEN_MOMENTS)


def test_a_stacked_part_is_centred_on_its_face_from_top_to_bottom() -> None:
    two = [put_face(0.75, down=0.5, size=0.3), put_face(0.25, down=0.45)]

    layout = stack_two([two] * TEN_MOMENTS)

    assert layout.upper.places[0].top + layout.upper.height / 2 == pytest.approx(0.45)
    assert layout.lower.places[0].top + layout.lower.height / 2 == pytest.approx(0.5)


def test_two_faces_in_fewer_than_half_of_the_moments_give_the_speaker_layout() -> None:
    layout = frame_picture(show_two_faces_in(4), WIDE, Framing.STACK_TWO)

    assert isinstance(layout, SpeakerLayout)
    assert layout.part.places[-1].left + layout.part.width / 2 == pytest.approx(0.75)
    assert choose_framing(show_two_faces_in(4), Framing.STACK_TWO) is Framing.FOLLOW_SPEAKER
    assert choose_framing(show_two_faces_in(5), Framing.STACK_TWO) is Framing.STACK_TWO
    assert choose_framing([], Framing.STACK_TWO) is Framing.FOLLOW_SPEAKER


@pytest.mark.parametrize("moments", [[], [[]] * 3, show_two_faces_in(10)])
def test_the_full_frame_framing_gives_the_whole_picture_whatever_the_faces(
    moments: list[list[Face]],
) -> None:
    assert frame_picture(moments, WIDE, Framing.WHOLE_FRAME) == WholePictureLayout()
    assert choose_framing(moments, Framing.WHOLE_FRAME) is Framing.WHOLE_FRAME


def test_the_speaker_framing_stays_the_speaker_framing_with_two_faces() -> None:
    assert choose_framing(show_two_faces_in(10), Framing.FOLLOW_SPEAKER) is Framing.FOLLOW_SPEAKER
