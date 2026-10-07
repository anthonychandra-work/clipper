import threading
import time
from collections.abc import Iterator
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import pytest

from ..settings import WhisperModel
from .download_model import (
    ModelDownload,
    ModelDownloadError,
    ModelDownloadStoppedError,
    download_model,
)
from .whisper_models import find_published_model

SMALL = find_published_model(WhisperModel.SMALL)
LARGE = find_published_model(WhisperModel.LARGE_V3_TURBO)
CONFIG_BYTES = 262
WEIGHTS_BYTES = 74_418_182
CLOSED_PORT = "http://127.0.0.1:9"
STOP_AFTER_SECONDS = 8
STOP_DEADLINE_SECONDS = 2


class FileThatEndsShort(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        is_size_question = self.headers["Range"] == "bytes=0-0"
        self.send_response(206)
        self.send_header("Content-Range", "bytes 0-0/100" if is_size_question else "bytes 0-99/100")
        self.send_header("Content-Length", "1" if is_size_question else "100")
        self.end_headers()
        self.wfile.write(b"x" if is_size_question else b"x" * 40)

    def log_message(self, format: str, *args: object) -> None:
        del format, args


@pytest.fixture
def short_server() -> Iterator[str]:
    server = ThreadingHTTPServer(("127.0.0.1", 0), FileThatEndsShort)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        yield f"http://127.0.0.1:{server.server_port}"
    finally:
        server.shutdown()
        server.server_close()


@pytest.fixture
def folder(tmp_path: Path) -> Path:
    return tmp_path / "models" / "small"


def ignore(percent: float) -> None:
    del percent


def list_sizes(folder: Path) -> dict[str, int]:
    return {file.name: file.stat().st_size for file in folder.iterdir()}


def test_a_whole_download_lands_under_the_final_name_with_the_sizes_the_server_declared(
    model_server: str, folder: Path
) -> None:
    percents: list[float] = []

    download_model(ModelDownload(SMALL, model_server, folder), threading.Event(), percents.append)

    assert list_sizes(folder) == {"config.json": CONFIG_BYTES, "weights.npz": WEIGHTS_BYTES}
    assert [left.name for left in folder.parent.iterdir()] == ["small"]
    assert percents == sorted(set(percents))
    assert percents[-1] == 100


def test_a_download_stopped_at_the_slow_address_is_carried_on_from_the_bytes_it_holds(
    model_server: str, folder: Path, test_model_dir: Path
) -> None:
    before_the_stop: list[float] = []
    after_it: list[float] = []
    stop = threading.Event()
    threading.Timer(STOP_AFTER_SECONDS, stop.set).start()
    started = time.monotonic()

    with pytest.raises(ModelDownloadStoppedError):
        download_model(
            ModelDownload(SMALL, f"{model_server}/slow", folder), stop, before_the_stop.append
        )
    seconds_to_stop = time.monotonic() - started - STOP_AFTER_SECONDS
    held = list_sizes(folder.with_name("small.partial"))
    download_model(ModelDownload(SMALL, model_server, folder), threading.Event(), after_it.append)

    assert seconds_to_stop < STOP_DEADLINE_SECONDS
    assert len(before_the_stop) >= 3
    assert before_the_stop == sorted(set(before_the_stop))
    assert held["config.json"] == CONFIG_BYTES
    assert 0 < held["weights.npz"] < WEIGHTS_BYTES
    assert [percent for percent in after_it if 0.01 < percent < before_the_stop[-1] - 0.01] == []
    assert after_it[-1] == 100
    assert (folder / "weights.npz").read_bytes() == (test_model_dir / "weights.npz").read_bytes()
    assert [left.name for left in folder.parent.iterdir()] == ["small"]


def test_a_file_the_source_does_not_hold_raises_a_download_error_and_leaves_no_model(
    model_server: str, tmp_path: Path
) -> None:
    folder = tmp_path / "models" / "large-v3-turbo"

    with pytest.raises(ModelDownloadError) as raised:
        download_model(ModelDownload(LARGE, model_server, folder), threading.Event(), ignore)

    assert "Not Found" in str(raised.value)
    assert not folder.exists()


def test_a_closed_port_raises_a_download_error(folder: Path) -> None:
    with pytest.raises(ModelDownloadError) as raised:
        download_model(ModelDownload(SMALL, CLOSED_PORT, folder), threading.Event(), ignore)

    assert "Connection refused" in str(raised.value)
    assert not folder.exists()


def test_a_file_that_ends_short_raises_a_download_error(short_server: str, folder: Path) -> None:
    with pytest.raises(ModelDownloadError) as raised:
        download_model(ModelDownload(SMALL, short_server, folder), threading.Event(), ignore)

    assert "ended short of the 100 bytes it declared" in str(raised.value)
    assert not folder.exists()
