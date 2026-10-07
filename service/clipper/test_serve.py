import json
import os
import socket
import subprocess
import sys
import time
from collections.abc import Iterator
from pathlib import Path

import pytest

SERVICE_DIR = Path(__file__).resolve().parents[1]
LOOPBACK = "127.0.0.1"
START_TIMEOUT_SECONDS = 30
STOP_TIMEOUT_SECONDS = 10
START_POLL_SECONDS = 0.05
CONNECTION_END_SECONDS = 2
SHORTEST_WAIT_SECONDS = 0.001
CHUNK_BYTES = 4096
REQUEST_TO_STAY_OPEN = (
    b"GET /api/health HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: keep-alive\r\n\r\n"
)


@pytest.fixture
def started_service_port(tmp_path: Path) -> Iterator[int]:
    port = find_free_port()
    environment = {
        **os.environ,
        "CLIPPER_SERVICE_PORT": str(port),
        "CLIPPER_DATA_DIR": str(tmp_path / "data"),
    }
    service = subprocess.Popen([sys.executable, "-m", "clipper"], cwd=SERVICE_DIR, env=environment)
    try:
        wait_until_listening(service, port)
        yield port
    finally:
        service.terminate()
        service.wait(timeout=STOP_TIMEOUT_SECONDS)


def test_a_connection_asked_to_stay_open_ends_with_the_answer_of_the_started_service(
    started_service_port: int,
) -> None:
    with socket.create_connection((LOOPBACK, started_service_port)) as connection:
        connection.sendall(REQUEST_TO_STAY_OPEN)
        answer = read_to_the_end(connection)

    head, _, body = answer.partition(b"\r\n\r\n")
    assert head.startswith(b"HTTP/1.1 200 OK\r\n")
    assert read_headers(head)["connection"] == "close"
    assert json.loads(body) == {"status": "ok"}


def find_free_port() -> int:
    with socket.socket() as listener:
        listener.bind((LOOPBACK, 0))
        port: int = listener.getsockname()[1]
        return port


def wait_until_listening(service: subprocess.Popen[bytes], port: int) -> None:
    deadline = time.monotonic() + START_TIMEOUT_SECONDS
    while not is_listening(port):
        assert service.poll() is None, "The service ended before it listened."
        assert time.monotonic() < deadline, "The service did not listen in time."
        time.sleep(START_POLL_SECONDS)


def is_listening(port: int) -> bool:
    try:
        socket.create_connection((LOOPBACK, port)).close()
    except ConnectionRefusedError:
        return False
    return True


def read_to_the_end(connection: socket.socket) -> bytes:
    deadline = time.monotonic() + CONNECTION_END_SECONDS
    received = bytearray()
    while chunk := receive_before(connection, deadline):
        received += chunk
    return bytes(received)


def receive_before(connection: socket.socket, deadline: float) -> bytes:
    connection.settimeout(max(deadline - time.monotonic(), SHORTEST_WAIT_SECONDS))
    return connection.recv(CHUNK_BYTES)


def read_headers(head: bytes) -> dict[str, str]:
    lines = head.decode("latin1").split("\r\n")[1:]
    named = (line.partition(":") for line in lines)
    return {name.lower(): value.strip() for name, _, value in named}
