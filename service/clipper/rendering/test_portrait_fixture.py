import subprocess
import threading
from pathlib import Path

import pytest

from ..media import FrameJob, MediaTools, grab_frame, probe_video
from .find_faces import Face, FaceFinder

STREAM_SHAPES = "stream=codec_name,width,height,r_frame_rate"
STREAM_LENGTHS = "stream=codec_type,duration"
PICTURE_HEIGHT = 720
TWO_TENTHS_OF_A_SECOND = 0.2


def ask_about_streams(video: Path, tools: MediaTools, entries: str) -> list[str]:
    probe = subprocess.run(
        [str(tools.ffprobe), "-v", "error", "-show_entries", entries, "-of", "csv=p=0", str(video)],
        capture_output=True,
        text=True,
        check=True,
    )
    return probe.stdout.split()


@pytest.fixture(scope="module")
def faces_by_second(
    portrait_video: Path, media_tools: MediaTools, tmp_path_factory: pytest.TempPathFactory
) -> dict[int, list[Face]]:
    frames_dir = tmp_path_factory.mktemp("portrait-frames")
    finder = FaceFinder()
    faces: dict[int, list[Face]] = {}
    for at_seconds in (1, 6, 11):
        frame = frames_dir / f"at-{at_seconds}.jpg"
        job = FrameJob(portrait_video, frame, at_seconds, PICTURE_HEIGHT)
        grab_frame(job, media_tools, threading.Event())
        faces[at_seconds] = finder.find_faces(frame)
    return faces


def test_the_portrait_fixture_is_twelve_seconds_of_h264_with_an_aac_sound_track(
    portrait_video: Path, media_tools: MediaTools
) -> None:
    length = probe_video(portrait_video, media_tools).duration_seconds

    assert length == pytest.approx(12, abs=TWO_TENTHS_OF_A_SECOND)
    assert ask_about_streams(portrait_video, media_tools, STREAM_SHAPES) == [
        "h264,1280,720,30/1",
        "aac,0/0",
    ]


def test_the_portrait_fixture_ends_its_picture_where_its_sound_ends(
    portrait_video: Path, media_tools: MediaTools
) -> None:
    answers = ask_about_streams(portrait_video, media_tools, STREAM_LENGTHS)
    lengths = {kind: float(length) for kind, length in (line.split(",") for line in answers)}

    assert lengths["video"] == pytest.approx(lengths["audio"], abs=TWO_TENTHS_OF_A_SECOND)


@pytest.mark.parametrize("at_seconds", [1, 6, 11])
def test_a_frame_of_the_portrait_fixture_shows_two_faces_the_larger_on_the_right(
    at_seconds: int, faces_by_second: dict[int, list[Face]]
) -> None:
    larger, smaller = faces_by_second[at_seconds]

    assert larger.area > smaller.area
    assert larger.middle_across > 0.5 > smaller.middle_across


def test_the_larger_face_lies_a_fifteenth_of_the_width_further_right_after_ten_seconds(
    faces_by_second: dict[int, list[Face]],
) -> None:
    drift = faces_by_second[11][0].middle_across - faces_by_second[1][0].middle_across

    assert 0.05 < drift < 0.09
