from pathlib import Path

import cv2

BUILD_LINES = [line.strip() for line in cv2.getBuildInformation().splitlines()]
DISABLED_PARTS = "Disabled:"
BUNDLED_LIBRARIES = Path(cv2.__file__).parent / ".dylibs"


def read_listed(heading: str) -> list[str]:
    listed = next(line for line in BUILD_LINES if line.startswith(heading))
    return listed.removeprefix(heading).split()


def test_the_installed_opencv_names_no_ffmpeg_in_its_build_information() -> None:
    assert [line for line in BUILD_LINES if "FFMPEG" in line.upper()] == []


def test_video_reading_is_among_the_parts_the_build_left_out() -> None:
    assert "videoio" in read_listed(DISABLED_PARTS)


def test_the_installed_opencv_has_no_font_built_in() -> None:
    assert [line for line in BUILD_LINES if "Unicode font" in line] == []


def test_the_installed_opencv_carries_no_folder_of_bundled_libraries() -> None:
    assert not BUNDLED_LIBRARIES.exists()
