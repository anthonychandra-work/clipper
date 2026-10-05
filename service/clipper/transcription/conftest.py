import re
import subprocess
import threading
from collections.abc import Iterator
from pathlib import Path

import pytest

from ..conftest import SCRIPTS_DIR, SERVER_START_TIMEOUT_SECONDS
from ..media import MediaTools, extract_audio


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
