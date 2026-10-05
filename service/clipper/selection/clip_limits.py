from dataclasses import dataclass

from ..projects import ClipLength
from ..settings import ClipsPerVideo
from .selection_task import ClipSeconds

LIMITS_BY_LENGTH = {
    ClipLength.SHORT: ClipSeconds(min=15, max=30),
    ClipLength.STANDARD: ClipSeconds(min=25, max=60),
    ClipLength.LONG: ClipSeconds(min=60, max=180),
}
MOST_KEPT_ON_AUTO = 12
LEAST_FOR_A_SHORT_VIDEO = 2
LEAST_FOR_A_LONG_VIDEO = 4
LONG_VIDEO_SECONDS = 600


@dataclass(frozen=True)
class ClipCounts:
    asked_for: int
    kept: int


def find_clip_limits(clip_length: ClipLength) -> ClipSeconds:
    return LIMITS_BY_LENGTH[clip_length]


def count_clips(choice: ClipsPerVideo, duration_seconds: float) -> ClipCounts:
    if choice is not ClipsPerVideo.AUTO:
        return ClipCounts(asked_for=int(choice), kept=int(choice))
    is_long = duration_seconds >= LONG_VIDEO_SECONDS
    least = LEAST_FOR_A_LONG_VIDEO if is_long else LEAST_FOR_A_SHORT_VIDEO
    return ClipCounts(asked_for=least, kept=MOST_KEPT_ON_AUTO)
