import threading
from dataclasses import dataclass
from pathlib import Path

from .locate_media_tools import MediaTools
from .run_media_tool import MediaToolFailedError, run_media_tool

PARTIAL_SUFFIX = ".partial.jpg"
DISK_FULL_WORDING = "No space left on device"

QUIET_OPTIONS = ("-hide_banner", "-loglevel", "error", "-nostdin", "-y")
ONE_JPEG_OPTIONS = ("-frames:v", "1", "-update", "1", "-q:v", "4")


@dataclass(frozen=True)
class FrameJob:
    video: Path
    target: Path
    at_seconds: float
    height: int


class NoFrameError(Exception):
    def __init__(self, job: FrameJob) -> None:
        super().__init__(f"{job.video.name} gave no picture at {job.at_seconds:.2f} seconds.")
        self.job = job


def grab_frame(job: FrameJob, tools: MediaTools, stop: threading.Event) -> None:
    partial = job.target.with_name(job.target.stem + PARTIAL_SUFFIX)
    try:
        run_media_tool(describe_grab(job, partial, tools), stop, ignore_line)
        if not partial.is_file():
            raise NoFrameError(job)
        partial.replace(job.target)
    except MediaToolFailedError as failure:
        # A full disk is not a missing picture: it goes on to the queue, which names it.
        if DISK_FULL_WORDING in failure.details:
            raise
        raise NoFrameError(job) from failure
    finally:
        partial.unlink(missing_ok=True)


def describe_grab(job: FrameJob, partial: Path, tools: MediaTools) -> list[str]:
    moment = ["-ss", f"{job.at_seconds:.3f}", "-i", str(job.video)]
    picture = ["-vf", f"scale=-2:{job.height}", *ONE_JPEG_OPTIONS, str(partial)]
    return [str(tools.ffmpeg), *QUIET_OPTIONS, *moment, *picture]


def ignore_line(line: str) -> None:
    del line
