from collections.abc import Sequence
from dataclasses import dataclass

from ..problems import RefusedError
from ..selection import Sentence
from .review_records import ClipReview
from .trim_reach import TrimReach

HUNDREDTHS = 100
NUDGE_STEP_HUNDREDTHS = 20
MOST_NUDGE_STEPS = 5
SHORTEST_CLIP_HUNDREDTHS = 100
REFUSED_CHANGE = "Clipper could not make this change. Reload the page and try again."


class ChangeRefusedError(RefusedError):
    def __init__(self) -> None:
        super().__init__(REFUSED_CHANGE)


@dataclass(frozen=True)
class ClipTimes:
    start_hundredths: int
    end_hundredths: int

    @property
    def start_seconds(self) -> float:
        return self.start_hundredths / HUNDREDTHS

    @property
    def end_seconds(self) -> float:
        return self.end_hundredths / HUNDREDTHS


@dataclass(frozen=True)
class TrimLimits:
    reach: TrimReach
    sentences: Sequence[Sentence]
    video_seconds: float


def time_clip(review: ClipReview, sentences: Sequence[Sentence]) -> ClipTimes:
    first, last = sentences[review.start.sentence - 1], sentences[review.end.sentence - 1]
    return ClipTimes(
        start_hundredths=round(first.start * HUNDREDTHS) + nudge_hundredths(review.start.nudge),
        end_hundredths=round(last.end * HUNDREDTHS) + nudge_hundredths(review.end.nudge),
    )


def nudge_hundredths(nudge: int) -> int:
    return nudge * NUDGE_STEP_HUNDREDTHS


def refuse_points_past_the_limits(review: ClipReview, limits: TrimLimits) -> None:
    if not (are_points_in_reach(review, limits.reach) and is_clip_inside_video(review, limits)):
        raise ChangeRefusedError()


def are_points_in_reach(review: ClipReview, reach: TrimReach) -> bool:
    points = (review.start, review.end)
    are_nudges_allowed = all(abs(point.nudge) <= MOST_NUDGE_STEPS for point in points)
    are_sentences_reached = all(reach.holds(point.sentence) for point in points)
    is_in_before_out = review.start.sentence <= review.end.sentence
    return are_nudges_allowed and are_sentences_reached and is_in_before_out


def is_clip_inside_video(review: ClipReview, limits: TrimLimits) -> bool:
    times = time_clip(review, limits.sentences)
    starts_inside = times.start_hundredths >= 0
    ends_inside = times.end_seconds <= limits.video_seconds
    is_long_enough = times.end_hundredths - times.start_hundredths >= SHORTEST_CLIP_HUNDREDTHS
    return starts_inside and ends_inside and is_long_enough
