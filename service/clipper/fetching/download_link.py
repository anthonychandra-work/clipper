import logging
import threading
from collections.abc import Callable, Mapping
from dataclasses import dataclass
from http import HTTPStatus
from pathlib import Path

import yt_dlp
from yt_dlp.utils import DownloadCancelled, DownloadError

from ..media import MediaTools
from ..storage import SOURCE_STEM
from .read_replay_graph import ReplayPoint, read_replay_graph

NO_VIDEO_ABOVE_1080 = "bv*[height<=?1080]+ba/b[height<=?1080]"
NODE_AS_JAVASCRIPT_RUNTIME: dict[str, dict[str, str]] = {"node": {}}
FIRST_OF_A_PLAYLIST = "1"

silent_log = logging.getLogger("clipper.fetching.yt_dlp")
silent_log.addHandler(logging.NullHandler())
silent_log.propagate = False


@dataclass(frozen=True)
class LinkDownload:
    link: str
    folder: Path


@dataclass(frozen=True)
class DownloadedVideo:
    file: Path
    title: str
    replay_graph: list[ReplayPoint] | None


class LinkDownloadError(Exception):
    pass


class DownloadStoppedError(Exception):
    def __init__(self) -> None:
        super().__init__("The download was stopped.")


class RisingDownloadPercent:
    def __init__(self, stop: threading.Event, report: Callable[[float], None]) -> None:
        self._stop = stop
        self._report = report
        self._highest = 0.0

    def read_progress(self, progress: Mapping[str, object]) -> None:
        if self._stop.is_set():
            raise DownloadCancelled()
        held = progress.get("downloaded_bytes")
        total = progress.get("total_bytes") or progress.get("total_bytes_estimate")
        if isinstance(held, int | float) and isinstance(total, int | float) and total > 0:
            self._raise_to(min(100.0, 100.0 * held / total))

    def _raise_to(self, percent: float) -> None:
        if percent > self._highest:
            self._highest = percent
            self._report(percent)


def download_link(
    download: LinkDownload,
    tools: MediaTools,
    stop: threading.Event,
    on_percent: Callable[[float], None],
) -> DownloadedVideo:
    clear_earlier_attempt(download.folder)
    progress = RisingDownloadPercent(stop, on_percent)
    options = describe_options(download.folder, tools, progress.read_progress)
    try:
        with yt_dlp.YoutubeDL(options) as downloader:
            found = downloader.extract_info(download.link, download=True)
    except DownloadCancelled:
        raise DownloadStoppedError() from None
    except DownloadError as failure:
        raise explain_failure(failure) from failure
    video = found["entries"][0] if "entries" in found else found
    stored = Path(str(video["requested_downloads"][0]["filepath"]))
    return DownloadedVideo(
        file=stored, title=str(video.get("title") or ""), replay_graph=read_replay_graph(video)
    )


def clear_earlier_attempt(folder: Path) -> None:
    folder.mkdir(parents=True, exist_ok=True)
    for leftover in folder.glob(f"{SOURCE_STEM}.*"):
        leftover.unlink()


def describe_options(
    folder: Path, tools: MediaTools, on_progress: Callable[[Mapping[str, object]], None]
) -> dict[str, object]:
    return {
        "format": NO_VIDEO_ABOVE_1080,
        "outtmpl": str(folder / f"{SOURCE_STEM}.%(ext)s"),
        "noplaylist": True,
        "playlist_items": FIRST_OF_A_PLAYLIST,
        "progress_hooks": [on_progress],
        "ffmpeg_location": str(tools.ffmpeg.parent),
        "js_runtimes": NODE_AS_JAVASCRIPT_RUNTIME,
        "cachedir": False,
        "logger": silent_log,
        "quiet": True,
        "no_warnings": True,
        "noprogress": True,
    }


def explain_failure(failure: DownloadError) -> LinkDownloadError:
    cause = failure.exc_info[1] if failure.exc_info else None
    if getattr(cause, "status", None) == HTTPStatus.NOT_FOUND:
        return LinkDownloadError("The video was not found at this link.")
    return LinkDownloadError(f"The video could not be downloaded: {failure.msg}")
