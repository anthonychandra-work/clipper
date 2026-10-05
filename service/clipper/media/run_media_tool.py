import subprocess
import tempfile
import threading
from collections.abc import Callable, Sequence
from pathlib import Path
from typing import IO

STOP_POLL_SECONDS = 0.1
TERMINATE_GRACE_SECONDS = 1.0
KEPT_ERROR_CHARACTERS = 2000


class MediaToolFailedError(Exception):
    def __init__(self, tool: str, exit_code: int, details: str) -> None:
        super().__init__(f"{tool} ended with code {exit_code}: {details}")
        self.tool = tool
        self.exit_code = exit_code
        self.details = details


class MediaWorkStoppedError(Exception):
    def __init__(self) -> None:
        super().__init__("The media work was stopped.")


def run_media_tool(
    command: Sequence[str], stop: threading.Event, on_line: Callable[[str], None]
) -> None:
    with tempfile.TemporaryFile("w+") as errors:
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=errors, text=True)
        threading.Thread(target=end_when_stopped, args=(process, stop), daemon=True).start()
        with process:
            for line in process.stdout or []:
                on_line(line.strip())
        if stop.is_set():
            raise MediaWorkStoppedError()
        if process.returncode != 0:
            raise MediaToolFailedError(Path(command[0]).name, process.returncode, tail_of(errors))


def end_when_stopped(process: subprocess.Popen[str], stop: threading.Event) -> None:
    while process.poll() is None:
        if stop.wait(STOP_POLL_SECONDS):
            process.terminate()
            kill_unless_ended(process)
            return


def kill_unless_ended(process: subprocess.Popen[str]) -> None:
    try:
        process.wait(timeout=TERMINATE_GRACE_SECONDS)
    except subprocess.TimeoutExpired:
        process.kill()


def tail_of(errors: IO[str]) -> str:
    errors.seek(0)
    return errors.read()[-KEPT_ERROR_CHARACTERS:].strip()
