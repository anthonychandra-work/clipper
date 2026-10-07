from pydantic import BaseModel, ConfigDict, StrictBool
from pydantic.alias_generators import to_camel

from ..selection import ClipFlag, HookType, SubscoresResponse, WindowResponse
from .review_records import CaptionStyle, Decision, Framing, RejectReason


class ReviewModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel, populate_by_name=True, from_attributes=True, extra="forbid"
    )


class LookBody(ReviewModel):
    caption_style: CaptionStyle
    framing: Framing
    show_hook_title: StrictBool
    show_safe_zones: StrictBool


class PreferredBand(ReviewModel):
    min: int
    max: int


class ClipLimitsResponse(ReviewModel):
    min: int
    max: int
    preferred: PreferredBand | None


class SentenceResponse(ReviewModel):
    number: int
    start_seconds: float
    end_seconds: float
    text: str


class CaptionWordResponse(ReviewModel):
    text: str
    is_highlighted: bool


class CaptionResponse(ReviewModel):
    start_seconds: float
    words: list[CaptionWordResponse]


class ClipCaptionsResponse(ReviewModel):
    keyword: list[CaptionResponse]
    word_by_word: list[CaptionResponse]
    plain: list[CaptionResponse]


class ClipResponse(ReviewModel):
    id: str
    rank: int
    start_seconds: float
    end_seconds: float
    scores: SubscoresResponse
    total: int
    reason: str
    title: str
    hook_title: str
    hook_type: HookType
    flag: ClipFlag | None
    flag_note: str | None
    is_replay_peak: bool
    decision: Decision
    reject_reason: RejectReason | None
    start_sentence: int
    end_sentence: int
    start_nudge: int
    end_nudge: int
    cut_start_sentence: int
    cut_end_sentence: int
    sentences: list[SentenceResponse]
    captions: ClipCaptionsResponse
    frames: list[str | None]


class ReviewResponse(ReviewModel):
    look: LookBody
    has_preview: bool
    clip_seconds: ClipLimitsResponse
    windows: list[WindowResponse]
    clips: list[ClipResponse]
