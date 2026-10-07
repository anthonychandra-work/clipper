import pytest

from .find_faces import Face
from .follow_faces import (
    FRAMES_PER_MOMENT,
    PICTURE_MIDDLE,
    Middle,
    follow_largest_face,
    follow_two_faces,
    glide,
)

SLACK = 1e-9


def put_face(across: float, down: float = 0.4, size: float = 0.2) -> Face:
    return Face(left=across - size / 2, top=down - size / 2, width=size, height=size, score=0.9)


def follow_and_glide(moments: list[list[Face]]) -> list[float]:
    return [middle.across for middle in glide(follow_largest_face(moments))]


def test_no_face_in_any_moment_gives_the_middle_of_the_picture_for_every_frame() -> None:
    path = glide(follow_largest_face([[], [], [], []]))

    assert path == [PICTURE_MIDDLE] * 4 * FRAMES_PER_MOMENT


def test_no_moment_at_all_gives_the_middle_of_the_picture_once() -> None:
    assert glide(follow_largest_face([])) == [PICTURE_MIDDLE]


def test_a_face_that_moves_steadily_is_followed_at_each_moment() -> None:
    moments = [[put_face(0.3 + 0.02 * moment)] for moment in range(10)]

    across = follow_and_glide(moments)

    at_moments = across[::FRAMES_PER_MOMENT]
    assert at_moments[2:8] == pytest.approx([0.3 + 0.02 * moment for moment in range(2, 8)])
    assert across == sorted(across)


def test_the_place_of_each_thirtieth_of_a_second_lies_between_the_moments_around_it() -> None:
    moments = [[put_face(across)] for across in (0.2, 0.6, 0.3, 0.7, 0.4, 0.5, 0.2)]

    across = follow_and_glide(moments)

    at_moments = [*across[::FRAMES_PER_MOMENT], across[-1]]
    for frame, place in enumerate(across):
        moment = int(frame / FRAMES_PER_MOMENT)
        low, high = sorted(at_moments[moment : moment + 2])
        assert low - SLACK <= place <= high + SLACK
    assert across[1] != across[0]


def test_the_jump_of_one_moment_moves_the_place_by_no_more_than_a_fifth_of_it() -> None:
    moments = [[put_face(0.8 if moment == 5 else 0.3)] for moment in range(11)]

    across = follow_and_glide(moments)

    assert max(across) == pytest.approx(0.3 + (0.8 - 0.3) / 5)
    assert min(across) == pytest.approx(0.3)


@pytest.mark.parametrize(
    ("seen", "filled"),
    [
        ([0.3, 0.3, None, None, None, None, None, None], [0.3] * 8),
        ([None, None, None, None, None, None, 0.7, 0.7], [0.7] * 8),
        ([0.2, None, None, None, None, None, None, 0.8], [0.2] * 4 + [0.8] * 4),
    ],
)
def test_a_moment_without_a_face_takes_the_place_of_the_nearest_moment_with_one(
    seen: list[float | None], filled: list[float]
) -> None:
    moments = [[] if across is None else [put_face(across)] for across in seen]

    across = follow_and_glide(moments)

    assert across == pytest.approx(follow_and_glide([[put_face(place)] for place in filled]))


def test_of_two_faces_that_take_turns_at_being_5_percent_larger_the_first_stays_followed() -> None:
    larger, smaller = 0.2 * 1.05**0.5, 0.2
    turns = [(larger, smaller), (smaller, larger)] * 5
    moments = [[put_face(0.3, size=first), put_face(0.7, size=second)] for first, second in turns]

    path = follow_largest_face(moments)

    assert [middle and middle.across for middle in path] == pytest.approx([0.3] * 10)


def test_the_followed_face_changes_to_one_that_is_a_quarter_larger() -> None:
    a_quarter_larger = 0.2 * 1.25**0.5 + SLACK
    even = [put_face(0.3), put_face(0.7)]
    grown = [put_face(0.3), put_face(0.7, size=a_quarter_larger)]

    path = follow_largest_face([even, even, grown, even])

    assert [middle and middle.across for middle in path] == pytest.approx([0.3, 0.3, 0.7, 0.7])


def test_the_followed_face_is_the_nearest_to_the_one_before_wherever_it_is_listed() -> None:
    moments = [[put_face(0.3)], [put_face(0.72), put_face(0.31)], [put_face(0.7), put_face(0.33)]]

    path = follow_largest_face(moments)

    assert [middle and middle.across for middle in path] == pytest.approx([0.3, 0.31, 0.33])


def test_two_faces_are_followed_as_the_left_one_and_the_right_one_of_the_two_largest() -> None:
    crowd = [put_face(0.75, size=0.3), put_face(0.5, size=0.05), put_face(0.25, down=0.6)]

    left_path, right_path = follow_two_faces([crowd, [put_face(0.5)], []])

    assert left_path == [Middle(0.25, 0.6), None, None]
    assert right_path == [Middle(0.75, 0.4), None, None]
