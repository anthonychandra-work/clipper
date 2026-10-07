"""Turns a file of 16 kHz mono 16-bit samples into timed words, as a program of its own.

The service starts this file by its path and imports nothing from it, so MLX and the model
are loaded here and their memory returns to the Mac when the program ends.
"""

import argparse
import contextlib
import io
import os
import re
import sys
from pathlib import Path
from typing import TextIO

import numpy as np
import numpy.typing as npt
from pydantic import BaseModel, Field

SAMPLE_RATE = 16_000
FULL_SCALE = 32_768
QUIETEST_HEARD_PEAK = FULL_SCALE / 1000
DEFAULT_PART_SECONDS = 600.0
CUT_SEARCH_SAMPLES = 30 * SAMPLE_RATE
QUIET_BLOCK_SAMPLES = SAMPLE_RATE // 2
PROGRESS_KEY = "transcribed_seconds="
DECODED_STRETCH = re.compile(r"^\[[\d:.]+ --> ([\d:.]+)\]")
SECONDS_PER_CLOCK_FIELD = 60

Samples = npt.NDArray[np.int16]


class TimedWord(BaseModel):
    text: str = Field(validation_alias="word")
    start: float
    end: float

    def later_by(self, seconds: float) -> "TimedWord":
        return self.model_copy(update={"start": self.start + seconds, "end": self.end + seconds})


class HeardStretch(BaseModel):
    words: list[TimedWord] = Field(default_factory=list)


class HeardPart(BaseModel):
    language: str
    segments: list[HeardStretch] = Field(default_factory=list)


class Transcription(BaseModel):
    language: str | None
    words: list[TimedWord]


class FinishedSeconds(io.StringIO):
    """Stands in for stdout while mlx-whisper decodes, and prints how far the sound is done."""

    def __init__(self, out: TextIO) -> None:
        super().__init__()
        self._out = out
        self._part_start = 0.0
        self._part_end = 0.0
        self._highest = 0.0
        self._unfinished_line = ""

    def enter_part(self, start_seconds: float, end_seconds: float) -> None:
        self._part_start = start_seconds
        self._part_end = end_seconds

    def write(self, text: str) -> int:
        *lines, self._unfinished_line = (self._unfinished_line + text).split("\n")
        for line in lines:
            decoded = DECODED_STRETCH.match(line)
            if decoded:
                self._raise_to(self._part_start + self._read_clock(decoded.group(1)))
        return len(text)

    def leave_part(self) -> None:
        self._raise_to(self._part_end)

    def _raise_to(self, seconds: float) -> None:
        reached = min(seconds, self._part_end)
        if reached > self._highest:
            self._highest = reached
            self._out.write(f"{PROGRESS_KEY}{reached:.2f}\n")
            self._out.flush()

    @staticmethod
    def _read_clock(clock: str) -> float:
        seconds = 0.0
        for field in clock.split(":"):
            seconds = seconds * SECONDS_PER_CLOCK_FIELD + float(field)
        return seconds


class PartListener:
    def __init__(self, model_folder: Path, progress: FinishedSeconds) -> None:
        self._model_folder = model_folder
        self._progress = progress
        self.language: str | None = None

    def hear(self, part: Samples, start_seconds: float) -> list[TimedWord]:
        self._progress.enter_part(start_seconds, start_seconds + len(part) / SAMPLE_RATE)
        loudest = int(np.abs(part.astype(np.int32)).max())
        words = self._ask_model(part) if loudest >= QUIETEST_HEARD_PEAK else []
        self._progress.leave_part()
        return [word.later_by(start_seconds) for word in words]

    def _ask_model(self, part: Samples) -> list[TimedWord]:
        if not (self._model_folder / "config.json").is_file():
            raise SystemExit(f"No transcription model is in {self._model_folder}.")
        import mlx_whisper

        with contextlib.redirect_stdout(self._progress):
            answer = mlx_whisper.transcribe(
                part.astype(np.float32) / FULL_SCALE,
                path_or_hf_repo=str(self._model_folder),
                language=self.language,
                word_timestamps=True,
                verbose=True,
            )
        heard = HeardPart.model_validate(answer)
        self.language = heard.language
        return [word for stretch in heard.segments for word in stretch.words]


def main() -> None:
    arguments = read_arguments()
    # Left online, the Hugging Face client that mlx-whisper loads writes under the home folder.
    os.environ["HF_HUB_OFFLINE"] = "1"
    samples = np.fromfile(arguments.samples, dtype=np.int16)
    listener = PartListener(arguments.model_folder, FinishedSeconds(sys.stdout))
    words = hear_in_parts(samples, listener, round(arguments.part_seconds * SAMPLE_RATE))
    transcription = Transcription(language=listener.language, words=words)
    arguments.result.write_text(transcription.model_dump_json())


def read_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Turn 16 kHz mono 16-bit samples into words.")
    parser.add_argument("samples", type=Path, help="the file of samples")
    parser.add_argument("model_folder", type=Path, help="the folder that holds the model")
    parser.add_argument("result", type=Path, help="the file the words are written to")
    parser.add_argument("--part-seconds", type=float, default=DEFAULT_PART_SECONDS)
    arguments = parser.parse_args()
    if arguments.part_seconds <= 0:
        parser.error("--part-seconds must be above zero")
    return arguments


def hear_in_parts(samples: Samples, listener: PartListener, part_samples: int) -> list[TimedWord]:
    words: list[TimedWord] = []
    start = 0
    while start < len(samples):
        end = find_part_end(samples, start, part_samples)
        words.extend(listener.hear(samples[start:end], start / SAMPLE_RATE))
        start = end
    return words


def find_part_end(samples: Samples, start: int, part_samples: int) -> int:
    mark = start + part_samples
    if mark >= len(samples):
        return len(samples)
    blocks = (mark - max(start, mark - CUT_SEARCH_SAMPLES)) // QUIET_BLOCK_SAMPLES
    if blocks == 0:
        return mark
    searched = samples[mark - blocks * QUIET_BLOCK_SAMPLES : mark].astype(np.int64)
    loudness = np.abs(searched).reshape(blocks, QUIET_BLOCK_SAMPLES).sum(axis=1)
    quietest_block = mark - (blocks - int(np.argmin(loudness))) * QUIET_BLOCK_SAMPLES
    return quietest_block + QUIET_BLOCK_SAMPLES // 2


if __name__ == "__main__":
    main()
