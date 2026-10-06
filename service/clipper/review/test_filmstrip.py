import logging
import shutil
import threading
from collections.abc import Callable
from pathlib import Path

import pytest

from ..media import MediaToolFailedError, MediaTools, MediaWorkStoppedError
from ..media.test_grab_frame import (
    FULL_DISK_FFMPEG,
    build_colour_video,
    read_colour,
    read_size,
)
from ..selection import Candidate, ChosenClips
from ..storage import DataFolder
from .conftest import CutTalk
from .filmstrip import FilmstripMaker, list_frame_moments

THIRD_PART, FOURTH_PART = 2, 3
RED, GREEN, BLUE = "red", "green", "blue"


@pytest.fixture(scope="session")
def four_minutes_of_colours(
    media_tools: MediaTools, tmp_path_factory: pytest.TempPathFactory
) -> Path:
    video = tmp_path_factory.mktemp("colours") / "four-minutes.mp4"
    return build_colour_video(media_tools, video, seconds_per_colour=80)


@pytest.fixture
def maker(data_folder: DataFolder, media_tools: MediaTools) -> FilmstripMaker:
    return FilmstripMaker(data_folder, media_tools)


def ignore_percent(percent: float) -> None:
    del percent


def choose(
    cut_talk: CutTalk,
    parts: list[int],
    report_percent: Callable[[float], None] = ignore_percent,
) -> ChosenClips:
    candidates: list[Candidate] = [cut_talk.candidates[part] for part in parts]
    return ChosenClips(
        project_id=cut_talk.project.id,
        candidates=candidates,
        sentences=cut_talk.sentences,
        stop=threading.Event(),
        report_percent=report_percent,
    )


def list_frames(data_folder: DataFolder, cut_talk: CutTalk) -> list[str]:
    return sorted(frame.name for frame in data_folder.frames_dir(cut_talk.project.id).iterdir())


def name_frames(clip_id: str, numbers: range) -> list[str]:
    return [f"{clip_id}-{number:02d}.jpg" for number in numbers]


def test_the_twelve_moments_of_a_stretch_are_the_middles_of_its_twelfths() -> None:
    assert list_frame_moments(0.0, 24.0) == [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23]
    assert list_frame_moments(108.62, 173.88)[0] == pytest.approx(108.62 + 65.26 / 24)
    assert list_frame_moments(108.62, 173.88)[-1] == pytest.approx(173.88 - 65.26 / 24)


def test_two_candidates_each_get_twelve_frames_104_px_high_from_the_preview_copy(
    maker: FilmstripMaker,
    cut_talk: CutTalk,
    data_folder: DataFolder,
    media_tools: MediaTools,
    four_minutes_of_colours: Path,
) -> None:
    shutil.copy(four_minutes_of_colours, data_folder.preview_file(cut_talk.project.id))
    reported: list[float] = []

    maker.make_frames(choose(cut_talk, [THIRD_PART, FOURTH_PART], reported.append))

    frames = sorted(data_folder.frames_dir(cut_talk.project.id).iterdir())
    assert [frame.name for frame in frames] == [
        *name_frames("c03", range(1, 13)),
        *name_frames("c04", range(1, 13)),
    ]
    assert {read_size(frame, media_tools) for frame in frames} == {(184, 104)}
    assert reported == sorted(reported)
    assert (len(reported), reported[-1]) == (24, 100)


def test_each_frame_is_taken_at_its_own_moment_of_a_video_whose_picture_changes(
    maker: FilmstripMaker,
    cut_talk: CutTalk,
    data_folder: DataFolder,
    media_tools: MediaTools,
    four_minutes_of_colours: Path,
) -> None:
    shutil.copy(four_minutes_of_colours, data_folder.preview_file(cut_talk.project.id))

    maker.make_frames(choose(cut_talk, [THIRD_PART, FOURTH_PART]))

    frames = sorted(data_folder.frames_dir(cut_talk.project.id).iterdir())
    colours = [read_colour(frame, media_tools) for frame in frames]
    assert colours[:12] == [RED] * 9 + [GREEN] * 3
    assert colours[12:] == [GREEN] * 9 + [BLUE] * 3


def test_a_preview_copy_that_ends_inside_a_stretch_leaves_the_late_frames_out_and_keeps_the_others(
    maker: FilmstripMaker,
    cut_talk: CutTalk,
    data_folder: DataFolder,
    media_tools: MediaTools,
    caplog: pytest.LogCaptureFixture,
) -> None:
    preview = data_folder.preview_file(cut_talk.project.id)
    build_colour_video(media_tools, preview, seconds_per_colour=50)
    reported: list[float] = []

    with caplog.at_level(logging.WARNING, logger="clipper.review"):
        maker.make_frames(choose(cut_talk, [FOURTH_PART], reported.append))

    left_out = [record.getMessage() for record in caplog.records]
    assert list_frames(data_folder, cut_talk) == name_frames("c04", range(1, 9))
    assert len(left_out) == 4
    assert left_out[0].startswith("The filmstrip frame c04-09.jpg was left out: preview.mp4 gave")
    assert reported[-1] == 100


def test_without_a_preview_copy_every_frame_is_left_out_and_the_step_goes_on(
    maker: FilmstripMaker, cut_talk: CutTalk, data_folder: DataFolder
) -> None:
    maker.make_frames(choose(cut_talk, [THIRD_PART]))

    assert list_frames(data_folder, cut_talk) == []


def test_the_frames_of_an_earlier_cut_are_gone(
    maker: FilmstripMaker,
    cut_talk: CutTalk,
    data_folder: DataFolder,
    four_minutes_of_colours: Path,
) -> None:
    shutil.copy(four_minutes_of_colours, data_folder.preview_file(cut_talk.project.id))
    maker.make_frames(choose(cut_talk, [THIRD_PART, FOURTH_PART]))

    maker.make_frames(choose(cut_talk, [FOURTH_PART]))

    assert list_frames(data_folder, cut_talk) == name_frames("c04", range(1, 13))


def test_a_stop_set_during_the_work_ends_it_as_stopped(
    maker: FilmstripMaker,
    cut_talk: CutTalk,
    data_folder: DataFolder,
    four_minutes_of_colours: Path,
) -> None:
    shutil.copy(four_minutes_of_colours, data_folder.preview_file(cut_talk.project.id))
    chosen = choose(cut_talk, [THIRD_PART, FOURTH_PART])
    stopping = ChosenClips(
        project_id=chosen.project_id,
        candidates=chosen.candidates,
        sentences=chosen.sentences,
        stop=chosen.stop,
        report_percent=lambda percent: chosen.stop.set() if percent > 10 else None,
    )

    with pytest.raises(MediaWorkStoppedError):
        maker.make_frames(stopping)

    assert list_frames(data_folder, cut_talk) == name_frames("c03", range(1, 4))


def test_a_full_disk_ends_the_work_with_the_failure_the_queue_names(
    cut_talk: CutTalk,
    data_folder: DataFolder,
    media_tools: MediaTools,
    four_minutes_of_colours: Path,
    tmp_path: Path,
) -> None:
    shutil.copy(four_minutes_of_colours, data_folder.preview_file(cut_talk.project.id))
    full_disk_ffmpeg = tmp_path / "ffmpeg"
    full_disk_ffmpeg.write_text(FULL_DISK_FFMPEG)
    full_disk_ffmpeg.chmod(0o755)
    maker = FilmstripMaker(data_folder, MediaTools(full_disk_ffmpeg, media_tools.ffprobe))

    with pytest.raises(MediaToolFailedError) as raised:
        maker.make_frames(choose(cut_talk, [THIRD_PART]))

    assert "No space left on device" in str(raised.value)
    assert list_frames(data_folder, cut_talk) == []
