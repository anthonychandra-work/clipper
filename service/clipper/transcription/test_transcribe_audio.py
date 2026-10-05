import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import pytest
from pydantic import BaseModel

from .transcribe_audio import SAMPLE_RATE, find_part_end

TRANSCRIBER = Path(__file__).with_name("transcribe_audio.py")
TALK_SCRIPT = Path(__file__).resolve().parents[3] / "fixtures" / "talk-script.txt"
BYTES_PER_SECOND = 2 * SAMPLE_RATE
PROGRESS_KEY = "transcribed_seconds="
MOST_WORDS_WRONG_IN_100 = 15
SILENT_SECONDS = 20
SIXTY_SECONDS = 60 * SAMPLE_RATE


class WrittenWord(BaseModel):
    text: str
    start: float
    end: float


class WrittenResult(BaseModel):
    language: str | None
    words: list[WrittenWord]


@dataclass(frozen=True)
class Hearing:
    result: WrittenResult
    printed_seconds: list[float]


def hear(samples: Path, model_dir: Path, *options: str) -> Hearing:
    result_file = samples.with_suffix(".json")
    program = [sys.executable, str(TRANSCRIBER), str(samples), str(model_dir), str(result_file)]
    ran = subprocess.run([*program, *options], check=True, stdout=subprocess.PIPE, text=True)
    printed = [float(line.removeprefix(PROGRESS_KEY)) for line in ran.stdout.splitlines()]
    return Hearing(WrittenResult.model_validate_json(result_file.read_text()), printed)


def split_words(text: str) -> list[str]:
    return re.findall(r"[a-z0-9']+", text.lower().replace("’", "'"))


def count_wrong_words(heard: list[str], spoken: list[str]) -> int:
    row = list(range(len(heard) + 1))
    for count, spoken_word in enumerate(spoken, 1):
        below = [count]
        for at, heard_word in enumerate(heard, 1):
            swapped = row[at - 1] + (spoken_word != heard_word)
            below.append(min(row[at] + 1, below[at - 1] + 1, swapped))
        row = below
    return row[-1]


def count_wrong_in_100(result: WrittenResult) -> float:
    spoken = split_words(TALK_SCRIPT.read_text())
    heard = split_words("".join(word.text for word in result.words))
    return 100 * count_wrong_words(heard, spoken) / len(spoken)


def list_times(result: WrittenResult) -> list[float]:
    return [time for word in result.words for time in (word.start, word.end)]


def measure_seconds(samples: Path) -> float:
    return samples.stat().st_size / BYTES_PER_SECOND


@pytest.fixture(scope="module")
def whole_talk(talk_samples: Path, test_model_dir: Path) -> Hearing:
    return hear(talk_samples, test_model_dir)


@pytest.fixture(scope="module")
def talk_in_parts(talk_samples: Path, test_model_dir: Path) -> Hearing:
    return hear(talk_samples, test_model_dir, "--part-seconds", "60")


@pytest.fixture
def silent_samples(tmp_path: Path) -> Path:
    samples = tmp_path / "silence.pcm"
    samples.write_bytes(bytes(SILENT_SECONDS * BYTES_PER_SECOND))
    return samples


def test_the_sound_of_the_talk_becomes_words_within_15_in_100_of_the_script(
    whole_talk: Hearing,
) -> None:
    assert whole_talk.result.language == "en"
    assert count_wrong_in_100(whole_talk.result) <= MOST_WORDS_WRONG_IN_100


def test_every_word_has_a_start_and_an_end_in_order_and_inside_the_sound(
    whole_talk: Hearing, talk_samples: Path
) -> None:
    times = list_times(whole_talk.result)

    assert len(whole_talk.result.words) > 500
    assert times == sorted(times)
    assert times[0] >= 0
    assert times[-1] <= measure_seconds(talk_samples)


def test_the_talk_in_parts_of_sixty_seconds_is_within_15_in_100_with_times_in_order(
    talk_in_parts: Hearing, talk_samples: Path
) -> None:
    times = list_times(talk_in_parts.result)

    assert count_wrong_in_100(talk_in_parts.result) <= MOST_WORDS_WRONG_IN_100
    assert times == sorted(times)
    assert times[0] >= 0
    assert times[-1] <= measure_seconds(talk_samples)


@pytest.mark.parametrize("hearing", ["whole_talk", "talk_in_parts"])
def test_the_printed_seconds_rise_and_end_at_the_length_of_the_sound(
    hearing: str, talk_samples: Path, request: pytest.FixtureRequest
) -> None:
    printed: list[float] = request.getfixturevalue(hearing).printed_seconds

    assert len(printed) >= 3
    assert printed == sorted(set(printed))
    assert printed[-1] == pytest.approx(measure_seconds(talk_samples), abs=0.01)


def test_twenty_seconds_of_silence_give_no_word(silent_samples: Path, test_model_dir: Path) -> None:
    silence = hear(silent_samples, test_model_dir)

    assert silence.result == WrittenResult(language=None, words=[])
    assert silence.printed_seconds == [SILENT_SECONDS]


def test_silence_gives_no_word_without_a_model(silent_samples: Path, tmp_path: Path) -> None:
    silence = hear(silent_samples, tmp_path / "no-model")

    assert silence.result == WrittenResult(language=None, words=[])


def test_sound_without_a_model_ends_with_an_error_that_names_the_folder(
    talk_samples: Path, tmp_path: Path
) -> None:
    program = [sys.executable, str(TRANSCRIBER), str(talk_samples), str(tmp_path / "no-model")]

    ran = subprocess.run([*program, str(tmp_path / "words.json")], capture_output=True, text=True)

    assert ran.returncode != 0
    assert f"No transcription model is in {tmp_path / 'no-model'}." in ran.stderr
    assert not (tmp_path / "words.json").exists()


def test_a_part_is_cut_in_the_quietest_half_second_of_the_thirty_seconds_before_its_mark() -> None:
    samples = np.full(100 * SAMPLE_RATE, 1000, dtype=np.int16)
    samples[20 * SAMPLE_RATE : 21 * SAMPLE_RATE] = 0
    samples[47 * SAMPLE_RATE : 47 * SAMPLE_RATE + SAMPLE_RATE // 2] = 0

    cut = find_part_end(samples, 0, SIXTY_SECONDS)

    assert 47 * SAMPLE_RATE < cut < 47 * SAMPLE_RATE + SAMPLE_RATE // 2


def test_a_part_is_never_longer_than_its_mark_and_the_last_one_ends_with_the_sound() -> None:
    samples = np.full(80 * SAMPLE_RATE, 1000, dtype=np.int16)

    first_end = find_part_end(samples, 0, SIXTY_SECONDS)
    last_end = find_part_end(samples, first_end, SIXTY_SECONDS)

    assert 30 * SAMPLE_RATE <= first_end <= SIXTY_SECONDS
    assert last_end == len(samples)
