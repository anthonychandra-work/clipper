from dataclasses import dataclass

from ..projects import Project
from ..selection import Candidate
from .caption_groups import Caption, group_captions
from .clip_points import HUNDREDTHS, ClipTimes, time_clip
from .describe_review import CutProject, ReviewSources, read_cut_project, read_review
from .review_records import ClipReview, Decision, Look


@dataclass(frozen=True)
class StandingClip:
    candidate: Candidate
    decision: Decision
    title: str
    times: ClipTimes
    captions: list[Caption]

    @property
    def seconds(self) -> float:
        return (self.times.end_hundredths - self.times.start_hundredths) / HUNDREDTHS


@dataclass(frozen=True)
class StandingReview:
    look: Look
    clips: list[StandingClip]


def read_standing_review(project: Project, sources: ReviewSources) -> StandingReview:
    look = sources.reviews.read_look(project.id)
    candidates = sources.selection.list_candidates(project.id)
    if not candidates:
        return StandingReview(look, [])
    cut = read_cut_project(project, sources.data_folder)
    reviews = sources.reviews.list_reviews(project.id)
    clips = [
        stand_clip(candidate, read_review(reviews.get(candidate.id), candidate, cut), cut, look)
        for candidate in candidates
    ]
    return StandingReview(look, clips)


def stand_clip(
    candidate: Candidate, review: ClipReview, cut: CutProject, look: Look
) -> StandingClip:
    times = time_clip(review, cut.sentences)
    spoken = cut.sentences[review.start.sentence - 1 : review.end.sentence]
    return StandingClip(
        candidate=candidate,
        decision=review.decision,
        title=review.title or candidate.title,
        times=times,
        captions=group_captions(spoken, look.caption_style, times.start_seconds),
    )
