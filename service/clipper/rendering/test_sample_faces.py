import threading
from collections.abc import Callable
from pathlib import Path

import pytest

from ..conftest import VideoRecipe
from ..media import MediaToolFailedError, MediaTools, MediaWorkStoppedError
from ..media.test_sample_frames import turn_on_its_side
from .frame_picture import PictureShape
from .sample_faces import FaceSearchJob, NoPictureError, SampledFaces, sample_faces

FFMPEG_THAT_WRITES_NOTHING = """\
#!/bin/sh
exit 0
"""


def search(job: FaceSearchJob, tools: MediaTools) -> SampledFaces:
    return sample_faces(job, tools, threading.Event(), ignore_percent)


def ignore_percent(percent: float) -> None:
    del percent


def test_six_seconds_of_the_portrait_video_give_thirty_moments_with_two_faces_each(
    portrait_video: Path, media_tools: MediaTools, tmp_path: Path
) -> None:
    sampled = search(FaceSearchJob(portrait_video, 0.0, 6.0, tmp_path), media_tools)

    assert [len(faces) for faces in sampled.moments] == [2] * 30
    assert all(faces[0].area > faces[1].area for faces in sampled.moments)
    assert all(faces[0].middle_across > 0.5 > faces[1].middle_across for faces in sampled.moments)
    assert sampled.moments[-1][0].middle_across > sampled.moments[0][0].middle_across + 0.02
    assert sampled.shape == PictureShape(640, 360)


def test_the_talk_gives_moments_without_a_face(
    talk_video: Path, media_tools: MediaTools, tmp_path: Path
) -> None:
    sampled = search(FaceSearchJob(talk_video, 11.94, 2.0, tmp_path), media_tools)

    assert sampled.moments == [[]] * 10
    assert sampled.shape == PictureShape(640, 360)


def test_a_stretch_that_runs_past_the_end_of_the_video_gives_the_moments_the_video_has(
    portrait_video: Path, media_tools: MediaTools, tmp_path: Path
) -> None:
    sampled = search(FaceSearchJob(portrait_video, 10.0, 6.0, tmp_path), media_tools)

    assert [len(faces) for faces in sampled.moments] == [2] * 10


def test_a_stretch_that_starts_after_the_end_of_the_video_fails_with_the_words_of_ffmpeg(
    portrait_video: Path, media_tools: MediaTools, tmp_path: Path
) -> None:
    with pytest.raises(MediaToolFailedError) as raised:
        search(FaceSearchJob(portrait_video, 40.0, 6.0, tmp_path), media_tools)

    assert "Nothing was written" in raised.value.details
    assert list(tmp_path.iterdir()) == []


def test_an_ffmpeg_that_writes_no_picture_and_reports_no_error_fails_by_name(
    portrait_video: Path, media_tools: MediaTools, tmp_path: Path
) -> None:
    silent_ffmpeg = tmp_path / "ffmpeg"
    silent_ffmpeg.write_text(FFMPEG_THAT_WRITES_NOTHING)
    silent_ffmpeg.chmod(0o755)
    tools = MediaTools(ffmpeg=silent_ffmpeg, ffprobe=media_tools.ffprobe)
    work_dir = tmp_path / "work"
    work_dir.mkdir()

    with pytest.raises(NoPictureError) as raised:
        search(FaceSearchJob(portrait_video, 2.0, 6.0, work_dir), tools)

    assert str(raised.value) == (
        "portrait.mp4 has no picture between 2.00 seconds and the 6.00 after them."
    )
    assert list(work_dir.iterdir()) == []


def test_a_video_stored_on_its_side_gives_an_upright_shape(
    build_video: Callable[[VideoRecipe], Path], media_tools: MediaTools, tmp_path: Path
) -> None:
    sideways = turn_on_its_side(build_video(VideoRecipe("stored.mp4", seconds=1)), media_tools)
    work_dir = tmp_path / "work"
    work_dir.mkdir()

    sampled = search(FaceSearchJob(sideways, 0.0, 1.0, work_dir), media_tools)

    assert sampled.shape == PictureShape(180, 320)
    assert len(sampled.moments) == 5


def test_the_search_reports_how_far_it_is_and_leaves_no_picture_behind(
    portrait_video: Path, media_tools: MediaTools, tmp_path: Path
) -> None:
    percents: list[float] = []
    job = FaceSearchJob(portrait_video, 0.0, 2.0, tmp_path)

    sample_faces(job, media_tools, threading.Event(), percents.append)

    assert percents == [10.0 * searched for searched in range(1, 11)]
    assert list(tmp_path.iterdir()) == []


def test_a_stop_set_during_the_work_ends_it_and_leaves_the_folder_empty(
    portrait_video: Path, media_tools: MediaTools, tmp_path: Path
) -> None:
    stop = threading.Event()
    percents: list[float] = []

    def stop_at_the_first_report(percent: float) -> None:
        percents.append(percent)
        stop.set()

    with pytest.raises(MediaWorkStoppedError):
        sample_faces(
            FaceSearchJob(portrait_video, 0.0, 6.0, tmp_path),
            media_tools,
            stop,
            stop_at_the_first_report,
        )

    assert len(percents) == 1
    assert list(tmp_path.iterdir()) == []


def test_a_stop_set_before_the_work_leaves_the_folder_empty(
    portrait_video: Path, media_tools: MediaTools, tmp_path: Path
) -> None:
    stop = threading.Event()
    stop.set()

    job = FaceSearchJob(portrait_video, 0.0, 6.0, tmp_path)

    with pytest.raises(MediaWorkStoppedError):
        sample_faces(job, media_tools, stop, ignore_percent)

    assert list(tmp_path.iterdir()) == []
