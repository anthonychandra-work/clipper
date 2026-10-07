import threading
import time
from collections.abc import Callable
from pathlib import Path

import pytest

from ..conftest import VideoRecipe
from .extract_audio import NoSoundTrackError, extract_audio, measure_sound_seconds
from .locate_media_tools import MediaTools
from .probe_video import NotAVideoError
from .run_media_tool import MediaWorkStoppedError

STOP_AFTER_SECONDS = 0.2
STOP_DEADLINE_SECONDS = 2


def test_the_sound_of_the_talk_becomes_between_234_and_236_seconds_of_samples(
    talk_video: Path, media_tools: MediaTools, tmp_path: Path
) -> None:
    samples = tmp_path / "audio.pcm"

    extract_audio(talk_video, samples, media_tools, threading.Event())

    assert 234 < measure_sound_seconds(samples) < 236
    assert [left.name for left in tmp_path.iterdir()] == ["audio.pcm"]


def test_the_samples_are_16_khz_mono_16_bit(
    build_video: Callable[[VideoRecipe], Path], media_tools: MediaTools, tmp_path: Path
) -> None:
    samples = tmp_path / "audio.pcm"

    extract_audio(
        build_video(VideoRecipe(name="tone.mp4")), samples, media_tools, threading.Event()
    )

    assert samples.stat().st_size == pytest.approx(2 * 16_000 * 2, rel=0.05)


def test_a_source_with_no_sound_track_fails_by_name_and_leaves_no_file(
    build_video: Callable[[VideoRecipe], Path], media_tools: MediaTools, tmp_path: Path
) -> None:
    source = build_video(VideoRecipe(name="mute.mp4", has_sound=False))

    with pytest.raises(NoSoundTrackError):
        extract_audio(source, tmp_path / "audio.pcm", media_tools, threading.Event())

    assert [left.name for left in tmp_path.iterdir()] == ["mute.mp4"]


def test_a_stop_signal_ends_ffmpeg_within_two_seconds_and_leaves_no_file(
    fixtures_dir: Path, media_tools: MediaTools, tmp_path: Path
) -> None:
    stop = threading.Event()
    threading.Timer(STOP_AFTER_SECONDS, stop.set).start()
    started = time.monotonic()

    with pytest.raises(MediaWorkStoppedError):
        extract_audio(fixtures_dir / "long-talk.mp4", tmp_path / "audio.pcm", media_tools, stop)

    assert time.monotonic() - started < STOP_AFTER_SECONDS + STOP_DEADLINE_SECONDS
    assert list(tmp_path.iterdir()) == []


def test_a_source_that_is_not_a_video_fails_by_name(
    media_tools: MediaTools, tmp_path: Path
) -> None:
    source = tmp_path / "notes.mp4"
    source.write_bytes(b"not a video")

    with pytest.raises(NotAVideoError):
        extract_audio(source, tmp_path / "audio.pcm", media_tools, threading.Event())
