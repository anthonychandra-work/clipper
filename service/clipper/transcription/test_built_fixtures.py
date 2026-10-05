import subprocess
from pathlib import Path

import pytest

from ..media import MediaTools, probe_video

STREAM_SHAPES = "stream=codec_name,width,height,r_frame_rate"
STREAM_LENGTHS = "stream=codec_type,duration"
NINETEEN_MINUTES = 19 * 60
TWENTY_MINUTES = 20 * 60
TWO_TENTHS_OF_A_SECOND = 0.2


def ask_about_streams(video: Path, tools: MediaTools, entries: str) -> list[str]:
    probe = subprocess.run(
        [str(tools.ffprobe), "-v", "error", "-show_entries", entries, "-of", "csv=p=0", str(video)],
        capture_output=True,
        text=True,
        check=True,
    )
    return probe.stdout.split()


def read_streams(video: Path, tools: MediaTools) -> list[str]:
    return ask_about_streams(video, tools, STREAM_SHAPES)


def read_stream_lengths(video: Path, tools: MediaTools) -> dict[str, float]:
    answers = (line.split(",") for line in ask_about_streams(video, tools, STREAM_LENGTHS))
    return {kind: float(length) for kind, length in answers}


def test_the_silent_fixture_is_twenty_seconds_of_h264_with_an_aac_sound_track(
    silent_video: Path, media_tools: MediaTools
) -> None:
    length = probe_video(silent_video, media_tools).duration_seconds

    assert length == pytest.approx(20, abs=0.2)
    assert read_streams(silent_video, media_tools) == ["h264,1280,720,30/1", "aac,0/0"]


def test_the_long_fixture_is_between_19_and_20_minutes_of_h264_with_an_aac_sound_track(
    long_talk_video: Path, media_tools: MediaTools
) -> None:
    length = probe_video(long_talk_video, media_tools).duration_seconds

    assert NINETEEN_MINUTES < length < TWENTY_MINUTES
    assert read_streams(long_talk_video, media_tools) == ["h264,320,180,10/1", "aac,0/0"]


def test_the_long_fixture_is_the_talk_five_times_over(
    long_talk_video: Path, talk_video: Path, media_tools: MediaTools
) -> None:
    long_length = probe_video(long_talk_video, media_tools).duration_seconds
    talk_length = probe_video(talk_video, media_tools).duration_seconds

    assert long_length == pytest.approx(5 * talk_length, abs=0.5)


def test_the_talk_fixture_ends_its_picture_where_its_sound_ends(
    talk_video: Path, media_tools: MediaTools
) -> None:
    lengths = read_stream_lengths(talk_video, media_tools)

    assert lengths["video"] == pytest.approx(lengths["audio"], abs=TWO_TENTHS_OF_A_SECOND)


def test_the_long_fixture_ends_its_picture_where_its_sound_ends(
    long_talk_video: Path, media_tools: MediaTools
) -> None:
    lengths = read_stream_lengths(long_talk_video, media_tools)

    assert lengths["video"] == pytest.approx(lengths["audio"], abs=TWO_TENTHS_OF_A_SECOND)
