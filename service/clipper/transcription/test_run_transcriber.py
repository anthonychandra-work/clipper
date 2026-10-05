import subprocess
import threading
import time
from pathlib import Path

import pytest

from ..media import MediaWorkStoppedError, measure_sound_seconds
from .run_transcriber import TranscriberFailedError, run_transcriber

STOP_AFTER_SECONDS = 4
STOP_DEADLINE_SECONDS = 2


def ignore_percent(percent: float) -> None:
    del percent


def count_processes_reading(samples: Path) -> int:
    found = subprocess.run(["pgrep", "-f", str(samples)], capture_output=True, text=True)
    return len(found.stdout.split())


def test_the_talk_comes_back_as_its_language_and_its_words(
    talk_samples: Path, test_model_dir: Path
) -> None:
    heard = run_transcriber(talk_samples, test_model_dir, threading.Event(), ignore_percent)

    assert heard.language == "en"
    assert len(heard.words) > 500
    assert heard.words[0].text.strip() == "Thank"
    assert heard.words[-1].end <= measure_sound_seconds(talk_samples)


def test_the_percent_of_the_sound_never_falls_and_ends_at_100(
    talk_samples: Path, test_model_dir: Path
) -> None:
    percents: list[float] = []

    run_transcriber(talk_samples, test_model_dir, threading.Event(), percents.append)

    assert len(percents) >= 3
    assert percents == sorted(set(percents))
    assert percents[-1] == pytest.approx(100, abs=0.01)
    assert sorted(left.name for left in talk_samples.parent.iterdir()) == ["audio.pcm"]


def test_a_stop_signal_ends_the_transcriber_within_two_seconds_and_leaves_no_process(
    long_talk_samples: Path, test_model_dir: Path
) -> None:
    percents: list[float] = []
    stop = threading.Event()
    threading.Timer(STOP_AFTER_SECONDS, stop.set).start()
    started = time.monotonic()

    with pytest.raises(MediaWorkStoppedError):
        run_transcriber(long_talk_samples, test_model_dir, stop, percents.append)

    assert time.monotonic() - started < STOP_AFTER_SECONDS + STOP_DEADLINE_SECONDS
    assert percents != [] and percents[-1] < 100
    assert count_processes_reading(long_talk_samples) == 0
    assert sorted(left.name for left in long_talk_samples.parent.iterdir()) == ["audio.pcm"]


def test_a_model_folder_that_does_not_exist_raises_an_error_with_what_the_program_printed(
    talk_samples: Path, tmp_path: Path
) -> None:
    missing = tmp_path / "no-model"

    with pytest.raises(TranscriberFailedError) as raised:
        run_transcriber(talk_samples, missing, threading.Event(), ignore_percent)

    assert f"No transcription model is in {missing}." in raised.value.details
    assert sorted(left.name for left in talk_samples.parent.iterdir()) == ["audio.pcm"]
