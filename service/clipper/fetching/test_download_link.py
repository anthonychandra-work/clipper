import threading
import time
from collections.abc import Mapping
from pathlib import Path

import pytest
import yt_dlp
from yt_dlp.utils import ExtractorError

from ..media import MediaTools
from .download_link import (
    DownloadStoppedError,
    LinkDownload,
    LinkDownloadError,
    describe_options,
    download_link,
)

STOP_AFTER_SECONDS = 1.0
STOP_DEADLINE_SECONDS = 2


def ignore_percent(percent: float) -> None:
    del percent


def ignore_progress(progress: Mapping[str, object]) -> None:
    del progress


def offer(format_id: str, height: int | None) -> dict[str, object]:
    return {
        "format_id": format_id,
        "url": f"https://video.example/{format_id}.mp4",
        "ext": "mp4",
        "height": height,
        "vcodec": "avc1",
        "acodec": "mp4a",
        "protocol": "https",
    }


def choose_format(tools: MediaTools, tmp_path: Path, offers: list[dict[str, object]]) -> str:
    options = {**describe_options(tmp_path, tools, ignore_progress), "simulate": True}
    listing = {"_type": "video", "id": "talk", "title": "Talk", "extractor": "generic"}
    with yt_dlp.YoutubeDL(options) as downloader:
        chosen = downloader.process_ie_result(
            {**listing, "webpage_url": "https://video.example/talk", "formats": offers},
            download=False,
        )
    return str(chosen["format_id"])


def test_the_fixture_is_stored_at_its_full_size_with_the_title_yt_dlp_read(
    fixture_server: str, talk_video: Path, media_tools: MediaTools, tmp_path: Path
) -> None:
    download = LinkDownload(f"{fixture_server}/talk.mp4", tmp_path / "project")

    downloaded = download_link(download, media_tools, threading.Event(), ignore_percent)

    assert downloaded.file == tmp_path / "project" / "source.mp4"
    assert downloaded.file.stat().st_size == talk_video.stat().st_size
    assert downloaded.title == "talk"


def test_the_caller_receives_a_rising_percent_that_ends_at_100(
    fixture_server: str, media_tools: MediaTools, tmp_path: Path
) -> None:
    percents: list[float] = []
    download = LinkDownload(f"{fixture_server}/slow/talk.mp4", tmp_path)

    download_link(download, media_tools, threading.Event(), percents.append)

    assert len(percents) >= 3
    assert percents == sorted(set(percents))
    assert percents[-1] == 100


def test_no_format_above_1080_pixels_is_allowed_for_a_link(
    media_tools: MediaTools, tmp_path: Path
) -> None:
    offers = [offer("hd", 720), offer("full-hd", 1080), offer("2k", 1440), offer("4k", 2160)]

    assert choose_format(media_tools, tmp_path, offers) == "full-hd"


def test_a_link_offered_only_above_1080_pixels_is_not_downloaded(
    media_tools: MediaTools, tmp_path: Path
) -> None:
    with pytest.raises(ExtractorError, match="Requested format is not available"):
        choose_format(media_tools, tmp_path, [offer("4k", 2160)])


def test_a_source_whose_height_is_unknown_is_still_accepted(
    media_tools: MediaTools, tmp_path: Path
) -> None:
    assert choose_format(media_tools, tmp_path, [offer("direct", None)]) == "direct"


def test_node_is_the_javascript_runtime_and_ffmpeg_comes_from_the_folder_found(
    media_tools: MediaTools, tmp_path: Path
) -> None:
    options = describe_options(tmp_path, media_tools, ignore_progress)

    assert options["js_runtimes"] == {"node": {}}
    assert options["ffmpeg_location"] == str(media_tools.ffmpeg.parent)
    assert options["cachedir"] is False


def test_a_link_that_answers_not_found_is_reported_as_not_found(
    fixture_server: str, media_tools: MediaTools, tmp_path: Path
) -> None:
    download = LinkDownload(f"{fixture_server}/missing.mp4", tmp_path)

    with pytest.raises(LinkDownloadError) as raised:
        download_link(download, media_tools, threading.Event(), ignore_percent)

    assert str(raised.value) == "The video was not found at this link."


def test_a_link_to_nothing_is_reported_as_a_download_error(
    media_tools: MediaTools, tmp_path: Path
) -> None:
    download = LinkDownload("http://127.0.0.1:9/talk.mp4", tmp_path)

    with pytest.raises(LinkDownloadError, match="could not be downloaded"):
        download_link(download, media_tools, threading.Event(), ignore_percent)


def test_a_stop_signal_ends_the_download_within_two_seconds(
    fixture_server: str, media_tools: MediaTools, tmp_path: Path
) -> None:
    stop = threading.Event()
    download = LinkDownload(f"{fixture_server}/slow/talk.mp4", tmp_path)
    threading.Timer(STOP_AFTER_SECONDS, stop.set).start()
    started = time.monotonic()

    with pytest.raises(DownloadStoppedError):
        download_link(download, media_tools, stop, ignore_percent)

    assert time.monotonic() - started < STOP_AFTER_SECONDS + STOP_DEADLINE_SECONDS
    assert not (tmp_path / "source.mp4").exists()


def test_a_rerun_starts_from_an_empty_folder(
    fixture_server: str, talk_video: Path, media_tools: MediaTools, tmp_path: Path
) -> None:
    (tmp_path / "source.mp4.part").write_bytes(b"left by a stopped download")
    (tmp_path / "source.mkv").write_bytes(b"left by an earlier format")

    download_link(
        LinkDownload(f"{fixture_server}/talk.mp4", tmp_path),
        media_tools,
        threading.Event(),
        ignore_percent,
    )

    assert [stored.name for stored in tmp_path.iterdir()] == ["source.mp4"]
    assert (tmp_path / "source.mp4").read_bytes() == talk_video.read_bytes()
