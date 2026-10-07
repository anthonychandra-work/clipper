import os
import subprocess
import threading
import time
from collections.abc import Callable
from pathlib import Path

import pytest

from ..conftest import VideoRecipe
from .locate_media_tools import MediaTools
from .make_preview_copy import PreviewJob, make_preview_copy
from .probe_video import probe_video
from .run_media_tool import MediaToolFailedError, MediaWorkStoppedError

STOP_AFTER_SECONDS = 0.5
STOP_DEADLINE_SECONDS = 2


def ignore_percent(percent: float) -> None:
    del percent


def read_stream_facts(video: Path, tools: MediaTools) -> list[str]:
    asked = ["-v", "error", "-show_entries", "stream=codec_name,width,height", "-of", "csv=p=0"]
    probe = subprocess.run([str(tools.ffprobe), *asked, str(video)], capture_output=True, text=True)
    return probe.stdout.split()


def find_box(video: Path, box_name: bytes) -> int:
    return video.read_bytes().index(box_name)


def copy_for_preview(source: Path, tools: MediaTools) -> Path:
    target = source.with_name("preview.mp4")
    length = probe_video(source, tools).duration_seconds
    make_preview_copy(PreviewJob(source, target, length), tools, threading.Event(), ignore_percent)
    return target


def test_the_preview_copy_is_h264_with_aac_and_no_taller_than_720_pixels(
    build_video: Callable[[VideoRecipe], Path], media_tools: MediaTools
) -> None:
    source = build_video(VideoRecipe(name="tall.mkv", size="1920x1080"))

    preview = copy_for_preview(source, media_tools)

    assert read_stream_facts(preview, media_tools) == ["h264,1280,720", "aac"]


def test_a_source_lower_than_720_pixels_keeps_its_height(
    build_video: Callable[[VideoRecipe], Path], media_tools: MediaTools
) -> None:
    source = build_video(VideoRecipe(name="low.mp4", size="640x360"))

    preview = copy_for_preview(source, media_tools)

    assert read_stream_facts(preview, media_tools) == ["h264,640,360", "aac"]


def test_the_preview_copy_is_as_long_as_its_source(
    build_video: Callable[[VideoRecipe], Path], media_tools: MediaTools
) -> None:
    source = build_video(VideoRecipe(name="short.mp4", seconds=3))

    preview = copy_for_preview(source, media_tools)

    assert probe_video(preview, media_tools).duration_seconds == pytest.approx(3, abs=0.2)


def test_the_index_is_at_the_front_of_the_file(
    build_video: Callable[[VideoRecipe], Path], media_tools: MediaTools
) -> None:
    preview = copy_for_preview(build_video(VideoRecipe(name="clip.mp4")), media_tools)

    assert find_box(preview, b"moov") < find_box(preview, b"mdat")


def test_the_caller_receives_a_rising_percent_that_ends_at_100(
    talk_video: Path, media_tools: MediaTools, tmp_path: Path
) -> None:
    percents: list[float] = []
    length = probe_video(talk_video, media_tools).duration_seconds
    job = PreviewJob(talk_video, tmp_path / "preview.mp4", length)

    make_preview_copy(job, media_tools, threading.Event(), percents.append)

    assert len(percents) >= 3
    assert percents == sorted(set(percents))
    assert percents[-1] == 100
    assert (tmp_path / "preview.mp4").is_file()


def test_a_stop_signal_ends_ffmpeg_within_two_seconds_and_removes_the_partial_file(
    talk_video: Path, media_tools: MediaTools, tmp_path: Path
) -> None:
    stop = threading.Event()
    threading.Timer(STOP_AFTER_SECONDS, stop.set).start()
    started = time.monotonic()

    with pytest.raises(MediaWorkStoppedError):
        make_preview_copy(
            PreviewJob(talk_video, tmp_path / "preview.mp4", 235), media_tools, stop, ignore_percent
        )

    assert time.monotonic() - started < STOP_AFTER_SECONDS + STOP_DEADLINE_SECONDS
    assert list(tmp_path.iterdir()) == []


def test_a_source_that_cannot_be_read_fails_by_name_and_leaves_no_file(
    media_tools: MediaTools, tmp_path: Path
) -> None:
    source = tmp_path / "random.mp4"
    source.write_bytes(os.urandom(64_000))

    with pytest.raises(MediaToolFailedError) as raised:
        make_preview_copy(
            PreviewJob(source, tmp_path / "preview.mp4", 10),
            media_tools,
            threading.Event(),
            ignore_percent,
        )

    assert raised.value.tool == "ffmpeg"
    assert raised.value.details != ""
    assert [left.name for left in tmp_path.iterdir()] == ["random.mp4"]
