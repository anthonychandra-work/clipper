from collections.abc import Sequence
from dataclasses import dataclass

from ..projects import ClipLength, Project
from ..selection import (
    Candidate,
    SelectionStore,
    Sentence,
    describe_window,
    find_clip_limits,
    split_sentences,
)
from ..storage import DataFolder
from ..transcription import read_transcript
from .caption_groups import group_captions
from .clip_points import time_clip
from .filmstrip import FRAMES_PER_CLIP
from .review_records import CaptionStyle, ClipPoint, ClipReview
from .review_schemas import (
    ClipCaptionsResponse,
    ClipLimitsResponse,
    ClipResponse,
    LookBody,
    PreferredBand,
    ReviewResponse,
    SentenceResponse,
)
from .review_store import ReviewStore
from .trim_reach import TrimReach, find_trim_reach, list_reach

PREFERRED_BANDS = {ClipLength.STANDARD: PreferredBand(min=25, max=50)}


@dataclass(frozen=True)
class ReviewSources:
    data_folder: DataFolder
    selection: SelectionStore
    reviews: ReviewStore


@dataclass(frozen=True)
class CutProject:
    project: Project
    sentences: Sequence[Sentence]
    data_folder: DataFolder

    @property
    def video_seconds(self) -> float:
        return self.project.duration_seconds or self.sentences[-1].end


def describe_review(project: Project, sources: ReviewSources) -> ReviewResponse:
    limits = find_clip_limits(project.clip_length)
    preferred = PREFERRED_BANDS.get(project.clip_length)
    return ReviewResponse(
        look=LookBody.model_validate(sources.reviews.read_look(project.id)),
        has_preview=sources.data_folder.preview_file(project.id).is_file(),
        clip_seconds=ClipLimitsResponse(min=limits.min, max=limits.max, preferred=preferred),
        windows=[describe_window(record) for record in sources.selection.list_windows(project.id)],
        clips=describe_clips(project, sources),
    )


def describe_clips(project: Project, sources: ReviewSources) -> list[ClipResponse]:
    candidates = sources.selection.list_candidates(project.id)
    if not candidates:
        return []
    cut = read_cut_project(project, sources.data_folder)
    reviews = sources.reviews.list_reviews(project.id)
    return [
        describe_clip(candidate, read_review(reviews.get(candidate.id), candidate, cut), cut)
        for candidate in candidates
    ]


def read_cut_project(project: Project, data_folder: DataFolder) -> CutProject:
    transcript = read_transcript(data_folder.project_dir(project.id))
    return CutProject(project, split_sentences(transcript.words), data_folder)


def read_review(stored: ClipReview | None, candidate: Candidate, cut: CutProject) -> ClipReview:
    if stored is not None:
        return stored
    reach = find_trim_reach(candidate, cut.sentences)
    return ClipReview(start=ClipPoint(reach.cut_start), end=ClipPoint(reach.cut_end))


def describe_clip(candidate: Candidate, review: ClipReview, cut: CutProject) -> ClipResponse:
    reach = find_trim_reach(candidate, cut.sentences)
    times = time_clip(review, cut.sentences)
    return ClipResponse(
        id=candidate.id,
        rank=candidate.rank,
        start_seconds=times.start_seconds,
        end_seconds=times.end_seconds,
        scores=candidate.scores,
        total=candidate.total,
        reason=candidate.reason,
        title=review.title or candidate.title,
        hook_title=candidate.hook_title,
        hook_type=candidate.hook_type,
        flag=candidate.flag,
        flag_note=candidate.flag_note,
        is_replay_peak=candidate.is_replay_peak,
        decision=review.decision,
        reject_reason=review.reject_reason,
        start_sentence=review.start.sentence,
        end_sentence=review.end.sentence,
        start_nudge=review.start.nudge,
        end_nudge=review.end.nudge,
        cut_start_sentence=reach.cut_start,
        cut_end_sentence=reach.cut_end,
        sentences=describe_reach(reach, cut.sentences),
        captions=describe_captions(review, cut.sentences, times.start_seconds),
        frames=list_frame_addresses(candidate.id, cut),
    )


def describe_reach(reach: TrimReach, sentences: Sequence[Sentence]) -> list[SentenceResponse]:
    return [
        SentenceResponse(
            number=sentence.number,
            start_seconds=sentence.start,
            end_seconds=sentence.end,
            text=sentence.text,
        )
        for sentence in list_reach(reach, sentences)
    ]


def describe_captions(
    review: ClipReview, sentences: Sequence[Sentence], clip_start_seconds: float
) -> ClipCaptionsResponse:
    spoken = sentences[review.start.sentence - 1 : review.end.sentence]
    return ClipCaptionsResponse.model_validate(
        {
            "keyword": group_captions(spoken, CaptionStyle.KEYWORD, clip_start_seconds),
            "word_by_word": group_captions(spoken, CaptionStyle.WORD_BY_WORD, clip_start_seconds),
            "plain": group_captions(spoken, CaptionStyle.PLAIN, clip_start_seconds),
        }
    )


def list_frame_addresses(clip_id: str, cut: CutProject) -> list[str | None]:
    project_id = cut.project.id
    return [
        f"/api/projects/{project_id}/clips/{clip_id}/frames/{number}"
        if cut.data_folder.frame_file(project_id, clip_id, number).is_file()
        else None
        for number in range(1, FRAMES_PER_CLIP + 1)
    ]
