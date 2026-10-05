import re
import shutil
import subprocess
import threading
from collections.abc import Callable, Iterator
from pathlib import Path

import pytest

from ..conftest import SCRIPTS_DIR, SERVER_START_TIMEOUT_SECONDS
from ..media import MediaTools, extract_audio, probe_video
from ..pipeline import PipelineStage, QueueWorker
from ..projects import (
    CreateProjectRequest,
    Platform,
    Project,
    ProjectQueue,
    ProjectRepository,
    SourceKind,
    StepKind,
    create_project,
)
from ..settings import PreferenceStore, WhisperModel
from ..storage import BYTES_PER_GB, Database, DataFolder, DiskSpace
from .model_stage import DownloadPlanner, ModelStage
from .transcribe_stage import TranscribeStage

PLENTY = DiskSpace(free_bytes=50 * BYTES_PER_GB, total_bytes=460 * BYTES_PER_GB)
PREVIEW_STAND_IN = b"a preview copy"


@pytest.fixture(scope="session")
def test_model_dir() -> Path:
    fetched = subprocess.run(
        ["node", str(SCRIPTS_DIR / "fetch-test-model.mjs")],
        check=True,
        stdout=subprocess.PIPE,
        text=True,
    )
    return Path(fetched.stdout.strip())


@pytest.fixture(scope="session")
def model_server(test_model_dir: Path) -> Iterator[str]:
    server = subprocess.Popen(
        ["node", str(SCRIPTS_DIR / "serve-fixtures.mjs"), str(test_model_dir)],
        stdout=subprocess.PIPE,
        text=True,
    )
    assert server.stdout is not None
    announced = re.search(r"http://\S+", server.stdout.readline())
    assert announced is not None, "The model server did not print its address."
    try:
        yield announced.group(0)
    finally:
        server.terminate()
        server.wait(timeout=SERVER_START_TIMEOUT_SECONDS)


@pytest.fixture
def default_model(data_folder: DataFolder, test_model_dir: Path) -> Path:
    folder = data_folder.model_dir(WhisperModel.LARGE_V3_TURBO)
    folder.symlink_to(test_model_dir)
    return folder


@pytest.fixture(scope="session")
def silent_video(fixtures_dir: Path) -> Path:
    return fixtures_dir / "silence.mp4"


@pytest.fixture(scope="session")
def long_talk_video(fixtures_dir: Path) -> Path:
    return fixtures_dir / "long-talk.mp4"


@pytest.fixture(scope="session")
def talk_samples(
    talk_video: Path, media_tools: MediaTools, tmp_path_factory: pytest.TempPathFactory
) -> Path:
    samples = tmp_path_factory.mktemp("talk-sound") / "audio.pcm"
    extract_audio(talk_video, samples, media_tools, threading.Event())
    return samples


@pytest.fixture(scope="session")
def long_talk_samples(
    long_talk_video: Path, media_tools: MediaTools, tmp_path_factory: pytest.TempPathFactory
) -> Path:
    samples = tmp_path_factory.mktemp("long-talk-sound") / "audio.pcm"
    extract_audio(long_talk_video, samples, media_tools, threading.Event())
    return samples


@pytest.fixture
def add_fetched_project(
    repository: ProjectRepository,
    queue: ProjectQueue,
    data_folder: DataFolder,
    media_tools: MediaTools,
) -> Callable[[Path], Project]:
    def add(video: Path) -> Project:
        draft = CreateProjectRequest(
            source_kind=SourceKind.FILE,
            file_name=video.name,
            file_size_bytes=video.stat().st_size,
            platforms=[Platform.REELS],
        )
        project = create_project(draft, repository, PLENTY)
        project_dir = data_folder.project_dir(project.id)
        project_dir.mkdir()
        shutil.copy(video, project_dir / f"source{video.suffix}")
        (project_dir / "preview.mp4").write_bytes(PREVIEW_STAND_IN)
        repository.record_duration(project.id, probe_video(video, media_tools).duration_seconds)
        queue.finish_step(project.id, StepKind.FETCH)
        queue.requeue(project.id)
        return repository.get(project.id)

    return add


@pytest.fixture
def start_worker(
    repository: ProjectRepository,
    queue: ProjectQueue,
    database: Database,
    data_folder: DataFolder,
    media_tools: MediaTools,
) -> Iterator[Callable[[str], QueueWorker]]:
    started: list[QueueWorker] = []

    def start(model_source: str) -> QueueWorker:
        preferences = PreferenceStore(database)
        planner = DownloadPlanner(preferences, data_folder, queue)
        stages: list[PipelineStage] = [
            ModelStage(preferences, data_folder, model_source),
            TranscribeStage(preferences, data_folder, media_tools),
        ]
        worker = QueueWorker(repository, queue, stages, planner.list_checks())
        worker.start()
        started.append(worker)
        return worker

    yield start
    for worker in started:
        worker.stop()
