from pathlib import Path

import cv2
import numpy as np
import pytest
from cv2.typing import MatLike

from ..conftest import SCRIPTS_DIR
from .find_faces import FaceFinder, UnreadablePictureError

PORTRAIT = SCRIPTS_DIR.parent / "fixtures" / "portrait.jpg"
ENLARGED_WIDTH = 2400
GREY = 128
GROUND_SIZE = (720, 1280)
LARGE_HEIGHT = 640
SMALL_HEIGHT = 320
SAME_PLACE_SLACK = 0.03


@pytest.fixture(scope="module")
def finder() -> FaceFinder:
    return FaceFinder()


def write_picture(pixels: MatLike, target: Path) -> Path:
    assert cv2.imwrite(str(target), pixels)
    return target


def read_portrait(height: int) -> MatLike:
    portrait = cv2.imread(str(PORTRAIT))
    assert portrait is not None
    width = round(portrait.shape[1] * height / portrait.shape[0])
    return cv2.resize(portrait, (width, height), interpolation=cv2.INTER_CUBIC)


def draw_grey_ground() -> MatLike:
    return np.full((*GROUND_SIZE, 3), GREY, np.uint8)


def draw_two_portraits() -> MatLike:
    ground = draw_grey_ground()
    small, large = read_portrait(SMALL_HEIGHT), read_portrait(LARGE_HEIGHT)
    ground[40 : 40 + SMALL_HEIGHT, 80 : 80 + small.shape[1]] = small
    ground[40 : 40 + LARGE_HEIGHT, 700 : 700 + large.shape[1]] = large
    return ground


def test_the_portrait_gives_one_face_in_its_upper_two_thirds(finder: FaceFinder) -> None:
    faces = finder.find_faces(PORTRAIT)

    assert len(faces) == 1
    assert 0.2 < faces[0].left < faces[0].left + faces[0].width < 0.75
    assert 0 < faces[0].top < faces[0].top + faces[0].height < 2 / 3
    assert faces[0].score >= 0.6


def test_the_portrait_enlarged_to_2400_pixels_gives_the_same_face(
    finder: FaceFinder, tmp_path: Path
) -> None:
    enlarged = read_portrait(height=round(ENLARGED_WIDTH * 774 / 600))
    assert enlarged.shape[1] == ENLARGED_WIDTH

    faces = finder.find_faces(write_picture(enlarged, tmp_path / "enlarged.jpg"))

    (face,), (original,) = faces, finder.find_faces(PORTRAIT)
    assert face.left == pytest.approx(original.left, abs=SAME_PLACE_SLACK)
    assert face.top == pytest.approx(original.top, abs=SAME_PLACE_SLACK)
    assert face.width == pytest.approx(original.width, abs=SAME_PLACE_SLACK)
    assert face.height == pytest.approx(original.height, abs=SAME_PLACE_SLACK)


def test_a_plain_grey_picture_gives_no_face(finder: FaceFinder, tmp_path: Path) -> None:
    grey = write_picture(draw_grey_ground(), tmp_path / "grey.png")

    assert finder.find_faces(grey) == []


def test_a_picture_with_the_portrait_at_two_sizes_gives_two_faces_the_larger_first(
    finder: FaceFinder, tmp_path: Path
) -> None:
    both = write_picture(draw_two_portraits(), tmp_path / "two-portraits.png")

    larger, smaller = finder.find_faces(both)

    assert larger.area > 2 * smaller.area
    assert larger.middle_across > 0.5 > smaller.middle_across
    assert larger.middle_down > smaller.middle_down


def test_a_file_that_is_no_picture_is_refused_by_name(finder: FaceFinder, tmp_path: Path) -> None:
    notes = tmp_path / "notes.jpg"
    notes.write_text("not a picture")

    with pytest.raises(UnreadablePictureError) as raised:
        finder.find_faces(notes)

    assert str(raised.value) == "notes.jpg could not be read as a picture."


def test_making_a_finder_and_searching_keeps_opencv_warnings_out_of_the_log(
    capfd: pytest.CaptureFixture[str], tmp_path: Path
) -> None:
    cv2.utils.logging.setLogLevel(cv2.utils.logging.LOG_LEVEL_WARNING)

    with pytest.raises(UnreadablePictureError):
        FaceFinder().find_faces(tmp_path / "missing.jpg")

    assert capfd.readouterr().err == ""
