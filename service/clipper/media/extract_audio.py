import threading
from pathlib import Path

from .locate_media_tools import MediaTools
from .probe_video import read_probe_report
from .run_media_tool import run_media_tool

SAMPLE_RATE = 16_000
BYTES_PER_SAMPLE = 2
PARTIAL_SUFFIX = ".partial"

QUIET_OPTIONS = ("-hide_banner", "-loglevel", "error", "-nostdin", "-y")
FIRST_SOUND_TRACK = ("-map", "0:a:0", "-vn")
AS_MONO_16_BIT_SAMPLES = ("-ac", "1", "-ar", str(SAMPLE_RATE), "-c:a", "pcm_s16le", "-f", "s16le")


class NoSoundTrackError(Exception):
    def __init__(self, source: Path) -> None:
        super().__init__(f"{source.name} has no sound track.")


def extract_audio(source: Path, target: Path, tools: MediaTools, stop: threading.Event) -> None:
    if not has_sound_track(source, tools):
        raise NoSoundTrackError(source)
    partial = target.with_name(target.name + PARTIAL_SUFFIX)
    decoding = [*FIRST_SOUND_TRACK, *AS_MONO_16_BIT_SAMPLES, str(partial)]
    try:
        run_media_tool(
            [str(tools.ffmpeg), *QUIET_OPTIONS, "-i", str(source), *decoding], stop, ignore_line
        )
        partial.replace(target)
    finally:
        partial.unlink(missing_ok=True)


def has_sound_track(source: Path, tools: MediaTools) -> bool:
    streams = read_probe_report(source, tools).streams
    return any(stream.codec_type == "audio" for stream in streams)


def ignore_line(line: str) -> None:
    del line


def measure_sound_seconds(samples: Path) -> float:
    return samples.stat().st_size / (SAMPLE_RATE * BYTES_PER_SAMPLE)
