import os
import sys
import threading
import time

import pytest

from .run_media_tool import MediaToolFailedError, MediaWorkStoppedError, run_media_tool

PRINT_OWN_GROUP = "import os; print(os.getpgrp())"
PRINT_TWO_LINES = "print('first'); print('second')"
FAIL_WITH_A_REASON = "import sys; sys.exit('the reason it failed')"
WAIT_A_MINUTE = "import time; time.sleep(60)"
STOP_AFTER_SECONDS = 0.3
STOP_DEADLINE_SECONDS = 2


def run_python(program: str, stop: threading.Event) -> list[str]:
    lines: list[str] = []
    run_media_tool([sys.executable, "-c", program], stop, lines.append)
    return lines


def test_the_lines_a_program_prints_are_handed_over_one_by_one() -> None:
    assert run_python(PRINT_TWO_LINES, threading.Event()) == ["first", "second"]


def test_a_program_runs_in_a_process_group_of_its_own() -> None:
    printed = run_python(PRINT_OWN_GROUP, threading.Event())

    assert int(printed[0]) != os.getpgrp()


def test_a_program_that_ends_with_an_error_raises_it_with_what_it_printed() -> None:
    with pytest.raises(MediaToolFailedError) as raised:
        run_python(FAIL_WITH_A_REASON, threading.Event())

    assert raised.value.exit_code == 1
    assert raised.value.details == "the reason it failed"


def test_a_stop_signal_ends_the_program_within_two_seconds() -> None:
    stop = threading.Event()
    threading.Timer(STOP_AFTER_SECONDS, stop.set).start()
    started = time.monotonic()

    with pytest.raises(MediaWorkStoppedError):
        run_python(WAIT_A_MINUTE, stop)

    assert time.monotonic() - started < STOP_AFTER_SECONDS + STOP_DEADLINE_SECONDS
