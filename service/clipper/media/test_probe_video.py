import os
import subprocess
from collections.abc import Callable
from pathlib import Path

import pytest

from ..conftest import VideoRecipe
from .locate_media_tools import MediaTools
from .probe_video import NotAVideoError, probe_video


def ask_ffprobe_for_length(video: Path, tools: MediaTools) -> float:
    asked = ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(video)]
    answer = subprocess.run([str(tools.ffprobe), *asked], capture_output=True, text=True)
    return float(answer.stdout)


def test_the_length_of_the_fixture_is_the_length_ffprobe_reports(
    talk_video: Path, media_tools: MediaTools
) -> None:
    facts = probe_video(talk_video, media_tools)

    assert facts.duration_seconds == ask_ffprobe_for_length(talk_video, media_tools)


def test_the_fixture_is_about_four_minutes_of_720p(
    talk_video: Path, media_tools: MediaTools
) -> None:
    facts = probe_video(talk_video, media_tools)

    assert 225 <= facts.duration_seconds <= 245
    assert facts.height == 720


def test_the_height_of_a_built_video_is_read(
    build_video: Callable[[VideoRecipe], Path], media_tools: MediaTools
) -> None:
    video = build_video(VideoRecipe(name="small.mp4", size="640x360", seconds=1))

    facts = probe_video(video, media_tools)

    assert facts.height == 360
    assert facts.duration_seconds == pytest.approx(1, abs=0.1)


def test_a_file_that_is_not_a_video_raises_a_named_error(
    tmp_path: Path, media_tools: MediaTools
) -> None:
    not_a_video = tmp_path / "random.mp4"
    not_a_video.write_bytes(os.urandom(64_000))

    with pytest.raises(NotAVideoError) as raised:
        probe_video(not_a_video, media_tools)

    assert "random.mp4 is not a video Clipper can read" in str(raised.value)


def test_sound_without_a_picture_is_not_a_video(tmp_path: Path, media_tools: MediaTools) -> None:
    sound = tmp_path / "tone.m4a"
    tone = ["-f", "lavfi", "-i", "sine=frequency=440", "-t", "1", "-c:a", "aac", str(sound)]
    subprocess.run([str(media_tools.ffmpeg), "-loglevel", "error", "-y", *tone], check=True)

    with pytest.raises(NotAVideoError) as raised:
        probe_video(sound, media_tools)

    assert raised.value.reason == "it has no picture"


def test_a_file_that_does_not_exist_is_not_a_video(tmp_path: Path, media_tools: MediaTools) -> None:
    with pytest.raises(NotAVideoError):
        probe_video(tmp_path / "absent.mp4", media_tools)
