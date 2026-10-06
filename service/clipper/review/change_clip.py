from dataclasses import dataclass, replace

from pydantic import StrictInt, StrictStr

from ..problems import NotFoundError
from ..projects import Project
from ..selection import Candidate
from .clip_points import TrimLimits, refuse_points_past_the_limits
from .describe_review import CutProject, ReviewSources, describe_clip, read_cut_project, read_review
from .review_records import ClipPoint, ClipReview, Decision, RejectReason
from .review_schemas import ClipResponse, ReviewModel
from .trim_reach import find_trim_reach

POINT_FIELDS = {"start_sentence", "start_nudge", "end_sentence", "end_nudge"}


class ClipNotFoundError(NotFoundError):
    def __init__(self) -> None:
        super().__init__("This clip does not exist.")


class ClipChange(ReviewModel):
    decision: Decision | None = None
    reject_reason: RejectReason | None = None
    title: StrictStr | None = None
    start_sentence: StrictInt | None = None
    start_nudge: StrictInt | None = None
    end_sentence: StrictInt | None = None
    end_nudge: StrictInt | None = None


@dataclass(frozen=True)
class ClipAddress:
    project: Project
    clip_id: str


def change_clip(address: ClipAddress, change: ClipChange, sources: ReviewSources) -> ClipResponse:
    project = address.project
    candidate = find_candidate(address, sources)
    cut = read_cut_project(project, sources.data_folder)
    stored = sources.reviews.list_reviews(project.id).get(candidate.id)
    wanted = apply_change(read_review(stored, candidate, cut), change)
    if POINT_FIELDS & change.model_fields_set:
        refuse_points_past_the_limits(wanted, describe_limits(candidate, cut))
    sources.reviews.save_review(project.id, candidate.id, wanted)
    return describe_clip(candidate, wanted, cut)


def find_candidate(address: ClipAddress, sources: ReviewSources) -> Candidate:
    candidates = sources.selection.list_candidates(address.project.id)
    found = next((clip for clip in candidates if clip.id == address.clip_id), None)
    if found is None:
        raise ClipNotFoundError()
    return found


def describe_limits(candidate: Candidate, cut: CutProject) -> TrimLimits:
    reach = find_trim_reach(candidate, cut.sentences)
    return TrimLimits(reach, cut.sentences, cut.video_seconds)


def apply_change(review: ClipReview, change: ClipChange) -> ClipReview:
    sent = change.model_fields_set
    decision = change.decision or review.decision
    reason = change.reject_reason if "reject_reason" in sent else review.reject_reason
    return replace(
        review,
        decision=decision,
        reject_reason=reason if decision is Decision.REJECT else None,
        title=clean_title(change.title) if "title" in sent else review.title,
        start=move_point(review.start, change.start_sentence, change.start_nudge),
        end=move_point(review.end, change.end_sentence, change.end_nudge),
    )


def clean_title(typed: str | None) -> str | None:
    return (typed or "").strip() or None


def move_point(point: ClipPoint, sentence: int | None, nudge: int | None) -> ClipPoint:
    if sentence is None or sentence == point.sentence:
        return ClipPoint(point.sentence, point.nudge if nudge is None else nudge)
    return ClipPoint(sentence, nudge or 0)
