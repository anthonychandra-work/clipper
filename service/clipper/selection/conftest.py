import json
import re
import subprocess
from collections.abc import Iterator
from dataclasses import dataclass

import httpx2
import pytest

from ..conftest import SCRIPTS_DIR, SERVER_START_TIMEOUT_SECONDS
from ..transcription import Transcript

COMMITTED_FIXTURES_DIR = SCRIPTS_DIR.parent / "fixtures"
RECORDED_REPLIES_DIR = COMMITTED_FIXTURES_DIR / "claude"
TALK_TRANSCRIPT_FILE = COMMITTED_FIXTURES_DIR / "talk-transcript.json"
TEST_KEY = "sk-ant-test-4f2a"


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
