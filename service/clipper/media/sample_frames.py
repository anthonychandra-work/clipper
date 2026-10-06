import math
import threading
from dataclasses import dataclass
from pathlib import Path

from .locate_media_tools import MediaTools
from .run_media_tool import run_media_tool

PICTURE_NAMES = "%05d.jpg"
PICTURE_PATTERN = "*.jpg"

QUIET_OPTIONS = ("-hide_banner", "-loglevel", "error", "-nostdin", "-y")
JPEG_OPTIONS = ("-q:v", "4")


@dataclass(frozen=True)
class SampleJob:
    video: Path
    start_seconds: float
    seconds: float
    per_second: int
    longest_side: int
    folder: Path


def sample_frames(job: SampleJob, tools: MediaTools, stop: threading.Event) -> list[Path]:
    # Started in the folder, ffmpeg numbers the pictures by a name that holds no path to misread.
    run_media_tool(describe_sampling(job, tools), stop, ignore_line, start_dir=job.folder)
    return sorted(job.folder.glob(PICTURE_PATTERN))


def describe_sampling(job: SampleJob, tools: MediaTools) -> list[str]:
    length = ["-t", f"{job.seconds:.3f}"]
    stretch = ["-ss", f"{job.start_seconds:.3f}", *length, "-i", str(job.video.absolute())]
    side = job.longest_side
    fitted = f"scale=w='min(iw,{side})':h='min(ih,{side})':force_original_aspect_ratio=decrease"
    most = ["-frames:v", str(math.ceil(job.seconds * job.per_second))]
    pictures = ["-vf", f"fps={job.per_second},{fitted}", *most, *JPEG_OPTIONS, PICTURE_NAMES]
    return [str(tools.ffmpeg.absolute()), *QUIET_OPTIONS, *stretch, *pictures]


def ignore_line(line: str) -> None:
    del line
