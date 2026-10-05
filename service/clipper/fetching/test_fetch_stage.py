import json
import os
import shutil
import sys
import threading
from collections.abc import Callable
from pathlib import Path

import pytest

from ..conftest import VideoRecipe
from ..media import MediaTools, NotAVideoError, probe_video
from ..pipeline import StageFailedError, StageRun
from ..projects import (
    CreateProjectRequest,
    Platform,
    Project,
    ProjectRepository,
    SourceKind,
    create_project,
)
from ..storage import BYTES_PER_GB, DataFolder, DiskSpace
from .download_link import DownloadedVideo, LinkDownload
from .fetch_stage import FetchStage, SourceMissingError
from .read_replay_graph import ReplayPoint

PLENTY = DiskSpace(free_bytes=50 * BYTES_PER_GB, total_bytes=460 * BYTES_PER_GB)
THREE_HOURS_IN_SECONDS = 10_800
GRAPH: list[ReplayPoint] = [
    {"start_time": 0.0, "end_time": 2.36, "value": 1.0},
    {"start_time": 2.36, "end_time": 4.71, "value": 0.12},
]


@pytest.fixture
def stage(
    repository: ProjectRepository, data_folder: DataFolder, media_tools: MediaTools
) -> FetchStage:
    return FetchStage(repository, data_folder, media_tools)


@pytest.fixture
def add_link_project(repository: ProjectRepository) -> Callable[[str], Project]:
    def add(link: str) -> Project:
        draft = CreateProjectRequest(
            source_kind=SourceKind.LINK, link=link, platforms=[Platform.REELS]
        )
        return create_project(draft, repository, PLENTY)

    return add


@pytest.fixture
def add_uploaded_project(
    repository: ProjectRepository, data_folder: DataFolder
) -> Callable[[Path], Project]:
    def add(video: Path) -> Project:
        draft = CreateProjectRequest(
            source_kind=SourceKind.FILE,
            file_name=video.name,
            file_size_bytes=video.stat().st_size,
            platforms=[Platform.REELS],
        )
        project = create_project(draft, repository, PLENTY)
        data_folder.project_dir(project.id).mkdir()
        shutil.copy(video, data_folder.project_dir(project.id) / f"source{video.suffix}")
        return project

    return add


def run_stage(stage: FetchStage, project: Project) -> list[float]:
    percents: list[float] = []
    stage.run(StageRun(project, threading.Event(), percents.append))
    return percents


def test_a_link_is_downloaded_then_measured_and_given_a_preview_copy(
    stage: FetchStage,
    add_link_project: Callable[[str], Project],
    fixture_server: str,
    repository: ProjectRepository,
    data_folder: DataFolder,
    talk_video: Path,
    media_tools: MediaTools,
) -> None:
    project = add_link_project(f"{fixture_server}/talk.mp4")

    run_stage(stage, project)

    fetched = repository.get(project.id)
    stored = sorted(left.name for left in data_folder.project_dir(project.id).iterdir())
    assert stored == ["preview.mp4", "source.mp4"]
    assert fetched.title == "talk"
    assert fetched.duration_seconds == probe_video(talk_video, media_tools).duration_seconds


def test_the_percent_of_a_link_counts_the_download_as_70_and_the_preview_as_the_rest(
    stage: FetchStage, add_link_project: Callable[[str], Project], fixture_server: str
) -> None:
    project = add_link_project(f"{fixture_server}/talk.mp4")

    percents = run_stage(stage, project)

    assert percents == sorted(percents)
    assert 70 in percents
    assert [percent for percent in percents if percent < 70] != []
    assert percents[-1] == 100


def test_an_uploaded_file_is_measured_and_given_a_preview_copy_from_70_percent_on(
    stage: FetchStage,
    add_uploaded_project: Callable[[Path], Project],
    build_video: Callable[[VideoRecipe], Path],
    repository: ProjectRepository,
    data_folder: DataFolder,
) -> None:
    project = add_uploaded_project(build_video(VideoRecipe(name="upload.mov", seconds=3)))

    percents = run_stage(stage, project)

    fetched = repository.get(project.id)
    assert fetched.duration_seconds == pytest.approx(3, abs=0.2)
    assert fetched.title == "upload.mov"
    assert (data_folder.project_dir(project.id) / "preview.mp4").is_file()
    assert min(percents) > 70
    assert percents[-1] == 100


def test_a_three_hour_source_is_fetched_with_a_length_of_10800_seconds(
    stage: FetchStage,
    add_uploaded_project: Callable[[Path], Project],
    build_video: Callable[[VideoRecipe], Path],
    repository: ProjectRepository,
) -> None:
    recipe = VideoRecipe(
        name="three-hours.mp4",
        size="160x90",
        seconds=THREE_HOURS_IN_SECONDS,
        frames_per_second=1,
        has_sound=False,
    )
    project = add_uploaded_project(build_video(recipe))

    run_stage(stage, project)

    assert repository.get(project.id).duration_seconds == pytest.approx(10_800, abs=1)


def test_a_rerun_starts_from_clean_files(
    stage: FetchStage,
    add_uploaded_project: Callable[[Path], Project],
    build_video: Callable[[VideoRecipe], Path],
    data_folder: DataFolder,
) -> None:
    project = add_uploaded_project(build_video(VideoRecipe(name="upload.mp4")))
    project_dir = data_folder.project_dir(project.id)
    (project_dir / "preview.partial.mp4").write_bytes(b"left by an interrupted run")
    (project_dir / "preview.mp4").write_bytes(b"left by an earlier run")

    run_stage(stage, project)

    assert sorted(left.name for left in project_dir.iterdir()) == ["preview.mp4", "source.mp4"]
    assert (project_dir / "preview.mp4").stat().st_size > 1000


def hand_over_with_graph(
    talk_video: Path, graph: list[ReplayPoint] | None
) -> Callable[..., DownloadedVideo]:
    def download(download: LinkDownload, *rest: object) -> DownloadedVideo:
        del rest
        download.folder.mkdir(parents=True, exist_ok=True)
        stored = Path(shutil.copy(talk_video, download.folder / "source.mp4"))
        return DownloadedVideo(file=stored, title="A talk", replay_graph=graph)

    return download


def test_the_graph_a_download_hands_over_is_kept_in_the_form_it_came_in(
    stage: FetchStage,
    add_link_project: Callable[[str], Project],
    data_folder: DataFolder,
    talk_video: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    project = add_link_project("https://video.example/talk")
    stand_in = hand_over_with_graph(talk_video, GRAPH)
    monkeypatch.setattr(sys.modules[FetchStage.__module__], "download_link", stand_in)

    run_stage(stage, project)

    project_dir = data_folder.project_dir(project.id)
    assert json.loads(data_folder.replay_graph_file(project.id).read_text()) == GRAPH
    assert sorted(left.name for left in project_dir.iterdir()) == [
        "preview.mp4",
        "replay-graph.json",
        "source.mp4",
    ]


def test_no_graph_file_is_written_for_a_link_whose_metadata_has_none(
    stage: FetchStage,
    add_link_project: Callable[[str], Project],
    fixture_server: str,
    data_folder: DataFolder,
) -> None:
    project = add_link_project(f"{fixture_server}/talk.mp4")

    run_stage(stage, project)

    stored = sorted(left.name for left in data_folder.project_dir(project.id).iterdir())
    assert not data_folder.replay_graph_file(project.id).exists()
    assert stored == ["preview.mp4", "source.mp4"]


def test_a_fetch_that_is_run_again_removes_the_graph_an_earlier_attempt_left(
    stage: FetchStage,
    add_link_project: Callable[[str], Project],
    data_folder: DataFolder,
    talk_video: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    project = add_link_project("https://video.example/talk")
    project_dir = data_folder.project_dir(project.id)
    project_dir.mkdir()
    data_folder.replay_graph_file(project.id).write_text(json.dumps(GRAPH))
    (project_dir / "replay-graph.partial.json").write_text("left by an interrupted run")
    stand_in = hand_over_with_graph(talk_video, None)
    monkeypatch.setattr(sys.modules[FetchStage.__module__], "download_link", stand_in)

    run_stage(stage, project)

    assert sorted(left.name for left in project_dir.iterdir()) == ["preview.mp4", "source.mp4"]


def test_a_link_that_cannot_be_downloaded_fails_with_a_plain_reason(
    stage: FetchStage, add_link_project: Callable[[str], Project], fixture_server: str
) -> None:
    project = add_link_project(f"{fixture_server}/missing.mp4")

    with pytest.raises(StageFailedError) as raised:
        run_stage(stage, project)

    assert raised.value.reason == (
        "The video could not be downloaded. Check the link and your connection, then retry."
    )


def test_an_upload_that_is_not_a_video_fails_by_name(
    stage: FetchStage, add_uploaded_project: Callable[[Path], Project], tmp_path: Path
) -> None:
    not_a_video = tmp_path / "random.mp4"
    not_a_video.write_bytes(os.urandom(64_000))
    project = add_uploaded_project(not_a_video)

    with pytest.raises(NotAVideoError):
        run_stage(stage, project)


def test_an_upload_whose_file_is_gone_fails_by_name(
    stage: FetchStage,
    add_uploaded_project: Callable[[Path], Project],
    tmp_path: Path,
    data_folder: DataFolder,
) -> None:
    video = tmp_path / "gone.mp4"
    video.write_bytes(b"soon removed")
    project = add_uploaded_project(video)
    (data_folder.project_dir(project.id) / "source.mp4").unlink()

    with pytest.raises(SourceMissingError):
        run_stage(stage, project)
