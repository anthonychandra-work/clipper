import subprocess
import threading
from pathlib import Path

import pytest

from .grab_frame import FrameJob, NoFrameError, grab_frame
from .locate_media_tools import MediaTools
from .run_media_tool import MediaToolFailedError, MediaWorkStoppedError

COLOURS = ("red", "green", "blue")
RGB_OF = {(254, 0, 0): "red", (0, 128, 0): "green", (0, 0, 254): "blue"}
COLOUR_SLACK = 12
QUIET = ("-hide_banner", "-loglevel", "error", "-y")
FRAME_HEIGHT = 104
FULL_DISK_FFMPEG = """\
#!/bin/sh
echo "Error writing the picture: No space left on device" >&2
exit 1
"""


def build_colour_video(tools: MediaTools, video: Path, seconds_per_colour: float) -> Path:
    pictures = [
        ["-f", "lavfi", "-i", f"color={colour}:size=320x180:rate=30:duration={seconds_per_colour}"]
        for colour in COLOURS
    ]
    one_after_another = "[0:v][1:v][2:v]concat=n=3:v=1:a=0"
    encoding = ["-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p"]
    inputs = [option for picture in pictures for option in picture]
    built = [str(tools.ffmpeg), *QUIET, *inputs, "-filter_complex", one_after_another, *encoding]
    subprocess.run([*built, str(video)], check=True)
    return video


def read_colour(picture: Path, tools: MediaTools) -> str:
    as_one_pixel = ["-vf", "scale=1:1", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
    read = subprocess.run(
        [str(tools.ffmpeg), *QUIET, "-i", str(picture), *as_one_pixel],
        check=True,
        capture_output=True,
    )
    pixel = tuple(read.stdout[:3])
    for rgb, name in RGB_OF.items():
        if all(abs(part - wanted) <= COLOUR_SLACK for part, wanted in zip(pixel, rgb, strict=True)):
            return name
    return f"another colour {pixel}"


def read_size(picture: Path, tools: MediaTools) -> tuple[int, int]:
    asked = ["-v", "error", "-show_entries", "stream=width,height", "-of", "csv=p=0"]
    probe = subprocess.run(
        [str(tools.ffprobe), *asked, str(picture)], check=True, capture_output=True, text=True
    )
    width, height = probe.stdout.strip().split(",")
    return int(width), int(height)


@pytest.fixture
def colour_video(media_tools: MediaTools, tmp_path: Path) -> Path:
    return build_colour_video(media_tools, tmp_path / "colours.mp4", seconds_per_colour=1)


@pytest.mark.parametrize(("at_seconds", "colour"), [(0.5, "red"), (1.5, "green"), (2.5, "blue")])
def test_a_frame_taken_in_each_part_of_a_video_has_the_colour_of_that_part(
    at_seconds: float, colour: str, colour_video: Path, media_tools: MediaTools, tmp_path: Path
) -> None:
    frame = tmp_path / "frame.jpg"

    grab_frame(
        FrameJob(colour_video, frame, at_seconds, FRAME_HEIGHT), media_tools, threading.Event()
    )

    assert read_colour(frame, media_tools) == colour


def test_the_frame_is_a_jpeg_of_the_height_asked_for_and_leaves_no_partial_file(
    colour_video: Path, media_tools: MediaTools, tmp_path: Path
) -> None:
    frames_dir = tmp_path / "frames"
    frames_dir.mkdir()
    frame = frames_dir / "c01-01.jpg"

    grab_frame(FrameJob(colour_video, frame, 0.5, FRAME_HEIGHT), media_tools, threading.Event())

    assert frame.read_bytes()[:3] == b"\xff\xd8\xff"
    assert read_size(frame, media_tools) == (184, FRAME_HEIGHT)
    assert [left.name for left in frames_dir.iterdir()] == ["c01-01.jpg"]


def test_the_last_frame_of_the_picture_can_still_be_taken(
    colour_video: Path, media_tools: MediaTools, tmp_path: Path
) -> None:
    frame = tmp_path / "frame.jpg"

    grab_frame(FrameJob(colour_video, frame, 2.95, FRAME_HEIGHT), media_tools, threading.Event())

    assert read_colour(frame, media_tools) == "blue"


@pytest.mark.parametrize("at_seconds", [3.2, 10.0])
def test_a_moment_after_the_picture_ends_writes_nothing_and_says_so(
    at_seconds: float, colour_video: Path, media_tools: MediaTools, tmp_path: Path
) -> None:
    frames_dir = tmp_path / "frames"
    frames_dir.mkdir()
    job = FrameJob(colour_video, frames_dir / "c01-12.jpg", at_seconds, FRAME_HEIGHT)

    with pytest.raises(NoFrameError) as raised:
        grab_frame(job, media_tools, threading.Event())

    assert str(raised.value) == f"colours.mp4 gave no picture at {at_seconds:.2f} seconds."
    assert list(frames_dir.iterdir()) == []


def test_a_video_that_is_not_there_gives_no_frame(media_tools: MediaTools, tmp_path: Path) -> None:
    job = FrameJob(tmp_path / "missing.mp4", tmp_path / "frame.jpg", 0.5, FRAME_HEIGHT)

    with pytest.raises(NoFrameError):
        grab_frame(job, media_tools, threading.Event())

    assert list(tmp_path.iterdir()) == []


def test_a_stop_set_before_the_frame_ends_the_work_as_stopped_and_keeps_no_frame(
    colour_video: Path, media_tools: MediaTools, tmp_path: Path
) -> None:
    frames_dir = tmp_path / "frames"
    frames_dir.mkdir()
    stop = threading.Event()
    stop.set()

    with pytest.raises(MediaWorkStoppedError):
        grab_frame(
            FrameJob(colour_video, frames_dir / "c01-01.jpg", 0.5, FRAME_HEIGHT), media_tools, stop
        )

    assert list(frames_dir.iterdir()) == []


def test_a_full_disk_is_not_taken_for_a_missing_picture(
    colour_video: Path, media_tools: MediaTools, tmp_path: Path
) -> None:
    full_disk_ffmpeg = tmp_path / "ffmpeg"
    full_disk_ffmpeg.write_text(FULL_DISK_FFMPEG)
    full_disk_ffmpeg.chmod(0o755)
    tools = MediaTools(ffmpeg=full_disk_ffmpeg, ffprobe=media_tools.ffprobe)
    job = FrameJob(colour_video, tmp_path / "frame.jpg", 0.5, FRAME_HEIGHT)

    with pytest.raises(MediaToolFailedError) as raised:
        grab_frame(job, tools, threading.Event())

    assert "No space left on device" in raised.value.details
    assert not (tmp_path / "frame.jpg").exists()
