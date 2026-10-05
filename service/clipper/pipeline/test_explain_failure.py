import errno
from pathlib import Path

from ..media import MediaToolFailedError, NotAVideoError
from .explain_failure import describe_stop, explain_failure
from .pipeline_stage import StageFailedError

DISK_FULL = "Not enough free disk space to finish. Free some space, then retry."
DOWNLOAD_FAILED = (
    "The video could not be downloaded. Check the link and your connection, then retry."
)


def chain(failure: Exception, cause: Exception) -> Exception:
    failure.__cause__ = cause
    return failure


def test_a_reason_the_stage_states_is_used_as_it_is() -> None:
    assert explain_failure(StageFailedError(DOWNLOAD_FAILED), "Fetching video") == DOWNLOAD_FAILED


def test_a_file_that_is_not_a_video_is_explained_with_what_to_do() -> None:
    failure = NotAVideoError(Path("random.mp4"), "it has no picture")

    assert explain_failure(failure, "Preparing video") == (
        "This file is not a video Clipper can read. Delete the project and try another file."
    )


def test_a_full_disk_reported_by_python_gives_the_disk_full_reason() -> None:
    failure = OSError(errno.ENOSPC, "No space left on device")

    assert explain_failure(failure, "Preparing video") == DISK_FULL


def test_a_full_disk_reported_by_ffmpeg_gives_the_disk_full_reason() -> None:
    failure = MediaToolFailedError("ffmpeg", 1, "Error writing trailer: No space left on device")

    assert explain_failure(failure, "Preparing video") == DISK_FULL


def test_a_full_disk_behind_a_failed_download_gives_the_disk_full_reason() -> None:
    full_disk = OSError(errno.ENOSPC, "No space left on device")
    failure = chain(
        StageFailedError(DOWNLOAD_FAILED), chain(RuntimeError("write failed"), full_disk)
    )

    assert explain_failure(failure, "Fetching video") == DISK_FULL


def test_another_operating_system_error_is_not_taken_for_a_full_disk() -> None:
    failure = OSError(errno.EACCES, "Permission denied")

    assert explain_failure(failure, "Preparing video") != DISK_FULL


def test_anything_else_names_the_step_and_suggests_a_retry() -> None:
    reason = explain_failure(RuntimeError("unexpected"), "Transcribing on this Mac")

    assert reason == "“Transcribing on this Mac” did not finish. Retry to run this step again."


def test_a_stop_names_the_step_and_says_the_earlier_stages_are_kept() -> None:
    assert describe_stop("Fetching video") == (
        "Stopped at “Fetching video”. The stages before it are kept."
    )
