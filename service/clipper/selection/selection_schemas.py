from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from .selection_records import ClipFlag, HookType
from .selection_task import ClipSeconds


class StoredRecordResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


class WindowResponse(StoredRecordResponse):
    id: str
    start_seconds: float
    end_seconds: float
    score: int
    is_shortlisted: bool


class ReplayPeakResponse(StoredRecordResponse):
    start_seconds: float
    end_seconds: float


class SubscoresResponse(StoredRecordResponse):
    hook: int
    arc: int
    value: int
    share: int


class PlatformTextResponse(StoredRecordResponse):
    title: str
    description: str


class PlatformTextsResponse(StoredRecordResponse):
    tiktok: PlatformTextResponse
    reels: PlatformTextResponse
    shorts: PlatformTextResponse


class CandidateResponse(StoredRecordResponse):
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
    platforms: PlatformTextsResponse
    flag: ClipFlag | None
    flag_note: str | None
    is_replay_peak: bool


class SelectionResponse(StoredRecordResponse):
    clip_seconds: ClipSeconds
    windows: list[WindowResponse]
    replay_peaks: list[ReplayPeakResponse]
    candidates: list[CandidateResponse]
