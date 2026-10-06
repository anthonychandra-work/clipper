import errno
from pathlib import Path

from .. import pipeline
from ..media import MediaToolFailedError, NotAVideoError
from .explain_failure import comes_from_a_full_disk, describe_stop, explain_failure
from .pipeline_stage import StageFailedError

DISK_FULL = "Not enough free disk space to finish. Free some space, then retry."
DOWNLOAD_FAILED = (
    "The video could not be downloaded. Check the link and your connection, then retry."
)
NO_KEY = "No Anthropic API key is saved. Add one in Settings, then retry."
UNMARKED = False
MARKED_FOR_SETTINGS = True


def chain(failure: Exception, cause: Exception) -> Exception:
    failure.__cause__ = cause
    return failure


def test_a_reason_the_stage_states_is_used_as_it_is_and_carries_no_mark() -> None:
    explained = explain_failure(StageFailedError(DOWNLOAD_FAILED), "Fetching video")

    assert explained == (DOWNLOAD_FAILED, UNMARKED)


def test_a_stated_failure_that_points_to_settings_keeps_its_mark() -> None:
    failure = StageFailedError(NO_KEY, opens_settings=True)

    assert explain_failure(failure, "Scoring windows") == (NO_KEY, MARKED_FOR_SETTINGS)


def test_a_file_that_is_not_a_video_is_explained_with_what_to_do() -> None:
    failure = NotAVideoError(Path("random.mp4"), "it has no picture")

    assert explain_failure(failure, "Preparing video") == (
        "This file is not a video Clipper can read. Delete the project and try another file.",
        UNMARKED,
    )


def test_a_full_disk_reported_by_python_gives_the_disk_full_reason() -> None:
    failure = OSError(errno.ENOSPC, "No space left on device")

    assert explain_failure(failure, "Preparing video") == (DISK_FULL, UNMARKED)


def test_a_full_disk_reported_by_ffmpeg_gives_the_disk_full_reason() -> None:
    failure = MediaToolFailedError("ffmpeg", 1, "Error writing trailer: No space left on device")

    assert explain_failure(failure, "Preparing video") == (DISK_FULL, UNMARKED)


def test_a_full_disk_behind_a_failed_download_gives_the_disk_full_reason() -> None:
    full_disk = OSError(errno.ENOSPC, "No space left on device")
    failure = chain(
        StageFailedError(DOWNLOAD_FAILED), chain(RuntimeError("write failed"), full_disk)
    )

    assert explain_failure(failure, "Fetching video") == (DISK_FULL, UNMARKED)


def test_a_full_disk_behind_a_failure_that_points_to_settings_carries_no_mark() -> None:
    full_disk = OSError(errno.ENOSPC, "No space left on device")
    failure = chain(StageFailedError(NO_KEY, opens_settings=True), full_disk)

    assert explain_failure(failure, "Scoring windows") == (DISK_FULL, UNMARKED)


def test_another_operating_system_error_is_not_taken_for_a_full_disk() -> None:
    failure = OSError(errno.EACCES, "Permission denied")

    assert explain_failure(failure, "Preparing video").reason != DISK_FULL


def test_anything_else_names_the_step_suggests_a_retry_and_carries_no_mark() -> None:
    explained = explain_failure(RuntimeError("unexpected"), "Transcribing on this Mac")

    assert explained == (
        "“Transcribing on this Mac” did not finish. Retry to run this step again.",
        UNMARKED,
    )


def test_a_failure_comes_from_a_full_disk_when_any_of_its_causes_is_one() -> None:
    full_disk = OSError(errno.ENOSPC, "No space left on device")
    by_ffmpeg = MediaToolFailedError("ffmpeg", 1, "Error writing trailer: No space left on device")

    assert comes_from_a_full_disk(full_disk)
    assert comes_from_a_full_disk(by_ffmpeg)
    assert comes_from_a_full_disk(chain(RuntimeError("write failed"), full_disk))
    assert not comes_from_a_full_disk(OSError(errno.EACCES, "Permission denied"))
    assert not comes_from_a_full_disk(RuntimeError("unexpected"))


def test_the_sentence_for_a_full_disk_is_the_one_other_packages_are_given() -> None:
    assert pipeline.DISK_FULL == DISK_FULL
    assert pipeline.comes_from_a_full_disk is comes_from_a_full_disk


def test_a_stop_names_the_step_and_says_the_earlier_stages_are_kept() -> None:
    assert describe_stop("Fetching video") == (
        "Stopped at “Fetching video”. The stages before it are kept."
    )
