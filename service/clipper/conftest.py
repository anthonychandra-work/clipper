import os
import re
import subprocess
from collections.abc import Iterator
from pathlib import Path

import pytest

from .projects import ProjectRepository
from .storage import Database, DataFolder, open_data_folder, open_database

SCRIPTS_DIR = Path(__file__).resolve().parents[2] / "scripts"
SERVER_START_TIMEOUT_SECONDS = 10


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
