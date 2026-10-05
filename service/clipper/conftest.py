import os
import re
import subprocess
from collections.abc import Callable, Iterator
from dataclasses import dataclass
from pathlib import Path

import pytest

from .media import MediaTools, locate_media_tools
from .projects import ProjectRepository
from .settings import StartupSettings
from .storage import Database, DataFolder, open_data_folder, open_database

SCRIPTS_DIR = Path(__file__).resolve().parents[2] / "scripts"
SERVER_START_TIMEOUT_SECONDS = 10


@dataclass(frozen=True)
class VideoRecipe:
    name: str
    size: str = "320x180"
    seconds: float = 2
    frames_per_second: int = 30


@pytest.fixture(scope="session")
def fixtures_dir(tmp_path_factory: pytest.TempPathFactory) -> Path:
    handed_over = os.environ.get("CLIPPER_FIXTURES_DIR")
    if handed_over:
        return Path(handed_over)
    folder = tmp_path_factory.mktemp("fixtures")
    subprocess.run(["node", str(SCRIPTS_DIR / "build-fixtures.mjs"), str(folder)], check=True)
    return folder


@pytest.fixture(scope="session")
def talk_video(fixtures_dir: Path) -> Path:
    return fixtures_dir / "talk.mp4"


@pytest.fixture(scope="session")
def media_tools() -> MediaTools:
    settings = StartupSettings()
    return locate_media_tools(settings.ffmpeg_dir, settings.search_path)


@pytest.fixture
def build_video(media_tools: MediaTools, tmp_path: Path) -> Callable[[VideoRecipe], Path]:
    def build(recipe: VideoRecipe) -> Path:
        video = tmp_path / recipe.name
        picture = f"testsrc=size={recipe.size}:rate={recipe.frames_per_second}"
        inputs = ["-f", "lavfi", "-i", picture, "-f", "lavfi", "-i", "sine=frequency=440"]
        encoding = ["-t", str(recipe.seconds), "-c:v", "libx264", "-preset", "ultrafast"]
        quiet = [str(media_tools.ffmpeg), "-hide_banner", "-loglevel", "error", "-y"]
        subprocess.run([*quiet, *inputs, *encoding, "-c:a", "aac", str(video)], check=True)
        return video

    return build


@pytest.fixture
def fixture_server(fixtures_dir: Path) -> Iterator[str]:
    server = subprocess.Popen(
        ["node", str(SCRIPTS_DIR / "serve-fixtures.mjs"), str(fixtures_dir)],
        stdout=subprocess.PIPE,
        text=True,
    )
    try:
        yield read_served_address(server)
    finally:
        server.terminate()
        server.wait(timeout=SERVER_START_TIMEOUT_SECONDS)


@pytest.fixture
def data_folder(tmp_path: Path) -> DataFolder:
    return open_data_folder(tmp_path / "data")


@pytest.fixture
def database(data_folder: DataFolder) -> Database:
    return open_database(data_folder.database_file)


@pytest.fixture
def repository(database: Database) -> ProjectRepository:
    return ProjectRepository(database)


def read_served_address(server: subprocess.Popen[str]) -> str:
    assert server.stdout is not None
    announced = re.search(r"http://\S+", server.stdout.readline())
    assert announced is not None, "The fixture server did not print its address."
    return announced.group(0)
