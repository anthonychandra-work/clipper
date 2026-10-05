import sys
import threading
from collections.abc import Callable
from pathlib import Path

from pydantic import BaseModel

from ..media import MediaToolFailedError, measure_sound_seconds, run_media_tool

TRANSCRIBER = Path(__file__).with_name("transcribe_audio.py")
# -P keeps the files beside the transcriber from shadowing the libraries it imports.
WITHOUT_ITS_OWN_FOLDER = "-P"
PROGRESS_KEY = "transcribed_seconds="
RESULT_SUFFIX = ".words.json"


class HeardWord(BaseModel):
    text: str
    start: float
    end: float


class HeardSound(BaseModel):
    language: str | None
    words: list[HeardWord]


class TranscriberFailedError(Exception):
    def __init__(self, details: str) -> None:
        super().__init__(f"The transcriber ended with an error: {details}")
        self.details = details


class RisingSoundPercent:
    def __init__(self, sound_seconds: float, report: Callable[[float], None]) -> None:
        self._sound_seconds = sound_seconds
        self._report = report
        self._highest = 0.0

    def read_line(self, line: str) -> None:
        if not line.startswith(PROGRESS_KEY) or self._sound_seconds <= 0:
            return
        finished_seconds = float(line.removeprefix(PROGRESS_KEY))
        percent = min(100.0, 100.0 * finished_seconds / self._sound_seconds)
        if percent > self._highest:
            self._highest = percent
            self._report(percent)


def run_transcriber(
    samples: Path, model_folder: Path, stop: threading.Event, on_percent: Callable[[float], None]
) -> HeardSound:
    result = samples.with_name(samples.name + RESULT_SUFFIX)
    progress = RisingSoundPercent(measure_sound_seconds(samples), on_percent)
    program = [sys.executable, WITHOUT_ITS_OWN_FOLDER, str(TRANSCRIBER)]
    try:
        run_media_tool(
            [*program, str(samples), str(model_folder), str(result)], stop, progress.read_line
        )
        return HeardSound.model_validate_json(result.read_text())
    except MediaToolFailedError as failure:
        raise TranscriberFailedError(failure.details) from failure
    finally:
        result.unlink(missing_ok=True)
