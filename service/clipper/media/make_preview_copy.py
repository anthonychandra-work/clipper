import threading
from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path

from .locate_media_tools import MediaTools
from .run_media_tool import run_media_tool

PREVIEW_HEIGHT = 720
PARTIAL_SUFFIX = ".partial.mp4"
MICROSECONDS_PER_SECOND = 1_000_000
ELAPSED_KEY = "out_time_us="
FINISHED_LINE = "progress=end"

QUIET_OPTIONS = ("-hide_banner", "-loglevel", "error", "-nostdin", "-y")
SCALE_TO_PREVIEW = f"scale=-2:'trunc(min({PREVIEW_HEIGHT},ih)/2)*2'"
PICTURE_OPTIONS = ("-map", "0:v:0", "-vf", SCALE_TO_PREVIEW, "-c:v", "libx264")
QUALITY_OPTIONS = ("-preset", "veryfast", "-crf", "23", "-pix_fmt", "yuv420p")
SOUND_OPTIONS = ("-map", "0:a:0?", "-c:a", "aac", "-b:a", "128k", "-ac", "2")
FILE_OPTIONS = ("-movflags", "+faststart", "-progress", "pipe:1", "-nostats")


@dataclass(frozen=True)
class PreviewJob:
    source: Path
    target: Path
    duration_seconds: float


class RisingPercent:
    def __init__(self, duration_seconds: float, report: Callable[[float], None]) -> None:
        self._duration_seconds = duration_seconds
        self._report = report
        self._highest = 0.0

    def read_progress_line(self, line: str) -> None:
        elapsed = line.removeprefix(ELAPSED_KEY)
        if line == FINISHED_LINE:
            self._raise_to(100.0)
        elif line.startswith(ELAPSED_KEY) and elapsed.isdigit() and self._duration_seconds > 0:
            elapsed_seconds = int(elapsed) / MICROSECONDS_PER_SECOND
            self._raise_to(min(100.0, 100.0 * elapsed_seconds / self._duration_seconds))

    def _raise_to(self, percent: float) -> None:
        if percent > self._highest:
            self._highest = percent
            self._report(percent)


def make_preview_copy(
    job: PreviewJob, tools: MediaTools, stop: threading.Event, on_percent: Callable[[float], None]
) -> None:
    partial = job.target.with_name(job.target.stem + PARTIAL_SUFFIX)
    progress = RisingPercent(job.duration_seconds, on_percent)
    encoding = describe_encoding(job.source, partial, tools)
    try:
        run_media_tool(encoding, stop, progress.read_progress_line)
        partial.replace(job.target)
    finally:
        partial.unlink(missing_ok=True)


def describe_encoding(source: Path, partial: Path, tools: MediaTools) -> list[str]:
    encoding = [*PICTURE_OPTIONS, *QUALITY_OPTIONS, *SOUND_OPTIONS, *FILE_OPTIONS]
    return [str(tools.ffmpeg), *QUIET_OPTIONS, "-i", str(source), *encoding, str(partial)]
