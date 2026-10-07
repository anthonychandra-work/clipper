from collections import Counter
from collections.abc import Iterable
from dataclasses import dataclass

LAST_DECISIONS = 50


@dataclass(frozen=True)
class ClipKey:
    project_id: str
    clip_id: str


@dataclass(frozen=True)
class PastDecision:
    clip: ClipKey
    is_rejection: bool
    reject_reason: str | None = None


@dataclass(frozen=True)
class Outcome:
    clip: ClipKey
    views: int
    hook_type: str
    seconds: float


@dataclass(frozen=True)
class RejectionCounts:
    cut_off: int = 0
    not_interesting: int = 0
    needs_context: int = 0
    repeat: int = 0


def count_rejections(decisions: Iterable[PastDecision]) -> RejectionCounts:
    rejections = Counter(decision.reject_reason for decision in decisions if decision.is_rejection)
    return RejectionCounts(
        cut_off=rejections["cut-off"],
        not_interesting=rejections["not-interesting"],
        needs_context=rejections["needs-context"],
        repeat=rejections["repeat"],
    )
