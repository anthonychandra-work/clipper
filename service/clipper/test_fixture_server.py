import time
from pathlib import Path

import httpx2

SLOW_TRANSFER_SECONDS = 6


def test_the_fixture_build_writes_the_talk_video(talk_video: Path) -> None:
    assert talk_video.is_file()
    assert talk_video.stat().st_size > 1_000_000


def test_the_server_sends_the_whole_file(fixture_server: str, talk_video: Path) -> None:
    response = httpx2.get(f"{fixture_server}/talk.mp4")

    assert response.status_code == 200
    assert response.headers["content-type"] == "video/mp4"
    assert response.content == talk_video.read_bytes()


def test_the_server_honours_a_byte_range(fixture_server: str, talk_video: Path) -> None:
    size = talk_video.stat().st_size

    response = httpx2.get(f"{fixture_server}/talk.mp4", headers={"Range": "bytes=100-299"})

    assert response.status_code == 206
    assert response.headers["content-range"] == f"bytes 100-299/{size}"
    assert response.content == talk_video.read_bytes()[100:300]


def test_the_server_honours_an_open_ended_range(fixture_server: str, talk_video: Path) -> None:
    size = talk_video.stat().st_size

    response = httpx2.get(f"{fixture_server}/talk.mp4", headers={"Range": f"bytes={size - 50}-"})

    assert response.status_code == 206
    assert len(response.content) == 50


def test_a_range_past_the_end_is_refused(fixture_server: str, talk_video: Path) -> None:
    size = talk_video.stat().st_size

    response = httpx2.get(f"{fixture_server}/talk.mp4", headers={"Range": f"bytes={size}-"})

    assert response.status_code == 416


def test_the_slow_address_takes_about_six_seconds(fixture_server: str, talk_video: Path) -> None:
    started = time.monotonic()

    response = httpx2.get(f"{fixture_server}/slow/talk.mp4", timeout=30)

    elapsed = time.monotonic() - started
    assert response.content == talk_video.read_bytes()
    assert SLOW_TRANSFER_SECONDS - 1 <= elapsed <= SLOW_TRANSFER_SECONDS + 4


def test_the_missing_address_answers_not_found(fixture_server: str) -> None:
    response = httpx2.get(f"{fixture_server}/missing.mp4")

    assert response.status_code == 404
    assert response.text == "not found"


def test_the_repairable_address_is_missing_until_repaired(
    fixture_server: str, talk_video: Path
) -> None:
    before = httpx2.get(f"{fixture_server}/missing-until-repaired/talk.mp4")
    httpx2.get(f"{fixture_server}/repair")
    after = httpx2.get(f"{fixture_server}/missing-until-repaired/talk.mp4")

    assert before.status_code == 404
    assert after.status_code == 200
    assert len(after.content) == talk_video.stat().st_size
