import json
import re
import subprocess
from collections.abc import Callable, Iterator, Sequence
from dataclasses import dataclass
from pathlib import Path

import httpx2
import pytest

from ..conftest import SCRIPTS_DIR, SERVER_START_TIMEOUT_SECONDS
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
from ..settings import ApiKeyStore, PreferenceStore
from ..storage import BYTES_PER_GB, Database, DataFolder, DiskSpace
from ..transcription import Transcript, write_transcript
from .cut_stage import CutStage
from .prepare_pass import StageDependencies
from .score_stage import ScoreStage
from .selection_store import SelectionStore

COMMITTED_FIXTURES_DIR = SCRIPTS_DIR.parent / "fixtures"
RECORDED_REPLIES_DIR = COMMITTED_FIXTURES_DIR / "claude"
TALK_TRANSCRIPT_FILE = COMMITTED_FIXTURES_DIR / "talk-transcript.json"
TALK_REPLAY_GRAPH_FILE = COMMITTED_FIXTURES_DIR / "talk-replay-graph.json"
TALK_SECONDS = 235.7
TALK_BRIEF = "Advice a shop owner can use."
TEST_KEY = "sk-ant-test-4f2a"
PLENTY = DiskSpace(free_bytes=50 * BYTES_PER_GB, total_bytes=460 * BYTES_PER_GB)

type SelectionStage = type[ScoreStage] | type[CutStage]
type StartSelection = Callable[..., QueueWorker]

BOTH_STEPS: tuple[SelectionStage, ...] = (ScoreStage, CutStage)


@dataclass(frozen=True)
class KeptRequest:
    scenario: str
    path: str
    beta: str | None
    has_key: bool
    body: dict[str, object]
    parts: list[dict[str, object]]

    def read_task(self) -> dict[str, object]:
        task: dict[str, object] = json.loads(str(self.parts[-1]["text"]))
        return task

    def read_output_config(self) -> dict[str, object]:
        output_config = self.body["output_config"]
        assert isinstance(output_config, dict)
        return output_config


@dataclass(frozen=True)
class RecordedClaude:
    address: str

    def at(self, scenario: str) -> str:
        return f"{self.address}/{scenario}"

    def list_requests(self) -> list[KeptRequest]:
        return [
            KeptRequest(
                scenario=kept["scenario"],
                path=kept["path"],
                beta=kept["beta"],
                has_key=kept["hasKey"],
                body=kept["body"],
                parts=kept["body"]["messages"][0]["content"],
            )
            for kept in httpx2.get(f"{self.address}/requests").json()
        ]

    def forget_requests(self) -> None:
        httpx2.delete(f"{self.address}/requests").raise_for_status()


@pytest.fixture(scope="session")
def recorded_claude_address() -> Iterator[str]:
    server = subprocess.Popen(
        ["node", str(SCRIPTS_DIR / "serve-recorded-claude.mjs"), str(RECORDED_REPLIES_DIR)],
        stdout=subprocess.PIPE,
        text=True,
    )
    assert server.stdout is not None
    announced = re.search(r"http://\S+", server.stdout.readline())
    assert announced is not None, "The stand-in for the API did not print its address."
    try:
        yield announced.group(0)
    finally:
        server.terminate()
        server.wait(timeout=SERVER_START_TIMEOUT_SECONDS)


@pytest.fixture
def recorded_claude(recorded_claude_address: str) -> RecordedClaude:
    stand_in = RecordedClaude(recorded_claude_address)
    stand_in.forget_requests()
    return stand_in


@pytest.fixture(scope="session")
def talk_transcript() -> Transcript:
    return Transcript.model_validate_json(TALK_TRANSCRIPT_FILE.read_text(encoding="utf-8"))


@pytest.fixture
def key_store(tmp_path: Path) -> ApiKeyStore:
    return ApiKeyStore(tmp_path / "keys" / "anthropic-api-key")


@pytest.fixture
def transcribed_talk(
    repository: ProjectRepository,
    queue: ProjectQueue,
    data_folder: DataFolder,
    talk_transcript: Transcript,
) -> Project:
    draft = CreateProjectRequest(
        source_kind=SourceKind.LINK,
        link="https://video.example/talk",
        platforms=[Platform.REELS],
        brief=TALK_BRIEF,
    )
    project = create_project(draft, repository, PLENTY)
    project_dir = data_folder.project_dir(project.id)
    project_dir.mkdir()
    write_transcript(project_dir, talk_transcript)
    repository.record_duration(project.id, TALK_SECONDS)
    queue.finish_step(project.id, StepKind.FETCH)
    queue.finish_step(project.id, StepKind.TRANSCRIBE)
    return repository.get(project.id)


@pytest.fixture
def start_selection(
    repository: ProjectRepository,
    queue: ProjectQueue,
    database: Database,
    data_folder: DataFolder,
    key_store: ApiKeyStore,
) -> Iterator[StartSelection]:
    started: list[QueueWorker] = []

    def start(anthropic_source: str, steps: Sequence[SelectionStage] = BOTH_STEPS) -> QueueWorker:
        dependencies = StageDependencies(
            keys=key_store,
            preferences=PreferenceStore(database),
            data_folder=data_folder,
            queue=queue,
            store=SelectionStore(database),
            anthropic_source=anthropic_source,
        )
        stages: list[PipelineStage] = [step(dependencies) for step in steps]
        worker = QueueWorker(repository, queue, stages)
        worker.start()
        started.append(worker)
        return worker

    yield start
    for worker in started:
        worker.stop()
