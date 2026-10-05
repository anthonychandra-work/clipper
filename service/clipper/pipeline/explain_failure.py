import errno
from collections.abc import Iterator

from ..media import NotAVideoError
from .pipeline_stage import StageFailedError

DISK_FULL = "Not enough free disk space to finish. Free some space, then retry."
NOT_A_VIDEO = "This file is not a video Clipper can read. Delete the project and try another file."
DISK_FULL_WORDING = "No space left on device"


def explain_failure(failure: BaseException, step_label: str) -> str:
    causes = list(walk_causes(failure))
    if any(is_disk_full(cause) for cause in causes):
        return DISK_FULL
    stated = next((cause for cause in causes if isinstance(cause, StageFailedError)), None)
    if stated is not None:
        return stated.reason
    if any(isinstance(cause, NotAVideoError) for cause in causes):
        return NOT_A_VIDEO
    return f"“{step_label}” did not finish. Retry to run this step again."


def describe_stop(step_label: str) -> str:
    return f"Stopped at “{step_label}”. The stages before it are kept."


def walk_causes(failure: BaseException) -> Iterator[BaseException]:
    seen: set[int] = set()
    cause: BaseException | None = failure
    while cause is not None and id(cause) not in seen:
        seen.add(id(cause))
        yield cause
        cause = cause.__cause__ or cause.__context__


def is_disk_full(cause: BaseException) -> bool:
    if isinstance(cause, OSError) and cause.errno == errno.ENOSPC:
        return True
    return DISK_FULL_WORDING in str(cause)
