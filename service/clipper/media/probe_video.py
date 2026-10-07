import subprocess
from dataclasses import dataclass
from pathlib import Path

from pydantic import BaseModel, Field, ValidationError

from .locate_media_tools import MediaTools

PROBE_TIMEOUT_SECONDS = 120


@dataclass(frozen=True)
class VideoFacts:
    duration_seconds: float
    height: int


class NotAVideoError(Exception):
    def __init__(self, video: Path, reason: str) -> None:
        super().__init__(f"{video.name} is not a video Clipper can read: {reason}")
        self.reason = reason


class ProbedStream(BaseModel):
    codec_type: str = ""
    height: int | None = None


class ProbedFormat(BaseModel):
    duration: float | None = None


class ProbeReport(BaseModel):
    streams: list[ProbedStream] = Field(default_factory=list)
    format: ProbedFormat = Field(default_factory=ProbedFormat)


def probe_video(video: Path, tools: MediaTools) -> VideoFacts:
    report = read_probe_report(video, tools)
    heights = [stream.height for stream in report.streams if stream.codec_type == "video"]
    if not heights or heights[0] is None:
        raise NotAVideoError(video, "it has no picture")
    if report.format.duration is None:
        raise NotAVideoError(video, "its length cannot be read")
    return VideoFacts(duration_seconds=report.format.duration, height=heights[0])


def read_probe_report(video: Path, tools: MediaTools) -> ProbeReport:
    command = [str(tools.ffprobe), "-v", "error", "-print_format", "json"]
    probe = subprocess.run(
        [*command, "-show_format", "-show_streams", str(video)],
        capture_output=True,
        text=True,
        timeout=PROBE_TIMEOUT_SECONDS,
    )
    if probe.returncode != 0:
        raise NotAVideoError(video, probe.stderr.strip() or "ffprobe could not open it")
    try:
        return ProbeReport.model_validate_json(probe.stdout)
    except ValidationError as unreadable:
        raise NotAVideoError(video, "its details cannot be read") from unreadable
