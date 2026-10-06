from pathlib import Path

import pytest


@pytest.fixture(scope="session")
def portrait_video(fixtures_dir: Path) -> Path:
    return fixtures_dir / "portrait.mp4"
