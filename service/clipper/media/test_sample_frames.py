import subprocess
import threading
from collections.abc import Callable
from pathlib import Path

import pytest

from ..conftest import VideoRecipe
from .locate_media_tools import MediaTools
from .run_media_tool import MediaToolFailedError, MediaWorkStoppedError
from .sample_frames import SampleJob, sample_frames
from .test_grab_frame import QUIET, build_colour_video, read_colour, read_size

JPEG_START = b"\xff\xd8\xff"


def sample(job: SampleJob, tools: MediaTools) -> list[Path]:
    return sample_frames(job, tools, threading.Event())


def turn_on_its_side(video: Path, tools: MediaTools) -> Path:
    turned = video.with_name("sideways.mp4")
    stored = ["-display_rotation", "90", "-i", str(video), "-c", "copy", str(turned)]
    subprocess.run([str(tools.ffmpeg), *QUIET, *stored], check=True)
    return turned


@pytest.fixture
def colour_video(media_tools: MediaTools, tmp_path: Path) -> Path:
    return build_colour_video(media_tools, tmp_path / "colours.mp4", seconds_per_colour=1)


@pytest.fixture
def folder(tmp_path: Path) -> Path:
    pictures = tmp_path / "100% of the pictures: here"
    pictures.mkdir()
    return pictures


def test_a_stretch_gives_the_asked_number_of_pictures_for_each_second_in_order(
    colour_video: Path, media_tools: MediaTools, folder: Path
) -> None:
    job = SampleJob(colour_video, 0.0, 3.0, per_second=3, longest_side=640, folder=folder)

    pictures = sample(job, media_tools)

    assert [picture.name for picture in pictures] == [
        f"{number:05d}.jpg" for number in range(1, 10)
    ]
    assert [read_colour(picture, media_tools) for picture in pictures] == [
        *["red"] * 3,
        *["green"] * 3,
        *["blue"] * 3,
    ]
    assert {picture.read_bytes()[:3] for picture in pictures} == {JPEG_START}


def test_a_stretch_that_starts_later_gives_the_pictures_from_there(
    colour_video: Path, media_tools: MediaTools, folder: Path
) -> None:
    job = SampleJob(colour_video, 1.0, 1.0, per_second=5, longest_side=640, folder=folder)

    pictures = sample(job, media_tools)

    assert [read_colour(picture, media_tools) for picture in pictures] == ["green"] * 5


@pytest.mark.parametrize(
    ("size", "longest_side", "written"),
    [("1280x720", 640, (640, 360)), ("320x180", 640, (320, 180)), ("360x640", 320, (180, 320))],
)
def test_a_picture_is_no_longer_than_asked_on_its_longer_side_and_keeps_its_shape(
    size: str,
    longest_side: int,
    written: tuple[int, int],
    build_video: Callable[[VideoRecipe], Path],
    media_tools: MediaTools,
    folder: Path,
) -> None:
    video = build_video(VideoRecipe("source.mp4", size=size, seconds=1))
    job = SampleJob(video, 0.0, 1.0, per_second=2, longest_side=longest_side, folder=folder)

    pictures = sample(job, media_tools)

    assert [read_size(picture, media_tools) for picture in pictures] == [written] * 2


def test_a_stretch_that_runs_past_the_end_gives_the_pictures_the_video_has(
    colour_video: Path, media_tools: MediaTools, folder: Path
) -> None:
    job = SampleJob(colour_video, 2.0, 6.0, per_second=5, longest_side=640, folder=folder)

    pictures = sample(job, media_tools)

    assert [read_colour(picture, media_tools) for picture in pictures] == ["blue"] * 5


def test_a_video_stored_on_its_side_gives_pictures_as_it_plays(
    build_video: Callable[[VideoRecipe], Path], media_tools: MediaTools, folder: Path
) -> None:
    sideways = turn_on_its_side(build_video(VideoRecipe("stored.mp4", seconds=1)), media_tools)
    job = SampleJob(sideways, 0.0, 1.0, per_second=2, longest_side=640, folder=folder)

    pictures = sample(job, media_tools)

    assert [read_size(picture, media_tools) for picture in pictures] == [(180, 320)] * 2


def test_a_stop_ends_the_work_as_stopped(
    colour_video: Path, media_tools: MediaTools, folder: Path
) -> None:
    stop = threading.Event()
    stop.set()
    job = SampleJob(colour_video, 0.0, 3.0, per_second=5, longest_side=640, folder=folder)

    with pytest.raises(MediaWorkStoppedError):
        sample_frames(job, media_tools, stop)


def test_a_video_that_is_not_there_fails_with_the_words_of_ffmpeg(
    media_tools: MediaTools, tmp_path: Path, folder: Path
) -> None:
    job = SampleJob(
        tmp_path / "missing.mp4", 0.0, 1.0, per_second=5, longest_side=640, folder=folder
    )

    with pytest.raises(MediaToolFailedError) as raised:
        sample_frames(job, media_tools, threading.Event())

    assert "missing.mp4" in raised.value.details
    assert list(folder.iterdir()) == []
