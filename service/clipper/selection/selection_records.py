from dataclasses import dataclass
from enum import StrEnum

from .split_windows import Window


class HookType(StrEnum):
    NUMBER = "number"
    STORY = "story"
    LIST = "list"
    HOT_TAKE = "hot-take"
    CONFESSION = "confession"
    CONTRARIAN = "contrarian"
    NONE = "none"


class ClipFlag(StrEnum):
    NEEDS_CONTEXT = "needs-context"
    NOT_RECOMMENDED = "not-recommended"


@dataclass(frozen=True)
class WindowRecord:
    window: Window
    score: int
    is_shortlisted: bool


@dataclass(frozen=True)
class ReplayPeak:
    start_seconds: float
    end_seconds: float


@dataclass(frozen=True)
class Subscores:
    hook: int
    arc: int
    value: int
    share: int

    @property
    def total(self) -> int:
        return self.hook + self.arc + self.value + self.share


@dataclass(frozen=True)
class PlatformText:
    title: str
    description: str


@dataclass(frozen=True)
class PlatformTexts:
    tiktok: PlatformText
    reels: PlatformText
    shorts: PlatformText


@dataclass(frozen=True)
class Candidate:
    id: str
    rank: int
    start_seconds: float
    end_seconds: float
    scores: Subscores
    reason: str
    title: str
    hook_title: str
    hook_type: HookType
    platforms: PlatformTexts
    flag: ClipFlag | None
    flag_note: str | None
    is_replay_peak: bool

    @property
    def total(self) -> int:
        return self.scores.total
