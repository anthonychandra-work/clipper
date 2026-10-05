import subprocess
from pathlib import Path

import pytest

from ..conftest import SCRIPTS_DIR
from ..media import MediaTools

QUIET_FFMPEG = ("-hide_banner", "-loglevel", "error", "-y")
AS_16_KHZ_MONO_SAMPLES = ("-vn", "-ac", "1", "-ar", "16000", "-f", "s16le")


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
def talk_samples(
    talk_video: Path, media_tools: MediaTools, tmp_path_factory: pytest.TempPathFactory
) -> Path:
    samples = tmp_path_factory.mktemp("sound") / "talk.pcm"
    decoding = [str(media_tools.ffmpeg), *QUIET_FFMPEG, "-i", str(talk_video)]
    subprocess.run([*decoding, *AS_16_KHZ_MONO_SAMPLES, str(samples)], check=True)
    return samples
