from dataclasses import dataclass
from enum import StrEnum


class Decision(StrEnum):
    UNDECIDED = "undecided"
    KEEP = "keep"
    REJECT = "reject"


class RejectReason(StrEnum):
    CUT_OFF = "cut-off"
    NOT_INTERESTING = "not-interesting"
    NEEDS_CONTEXT = "needs-context"
    REPEAT = "repeat"


class CaptionStyle(StrEnum):
    KEYWORD = "keyword"
    WORD_BY_WORD = "word-by-word"
    PLAIN = "plain"


class Framing(StrEnum):
    FOLLOW_SPEAKER = "follow-speaker"
    STACK_TWO = "stack-two"
    WHOLE_FRAME = "whole-frame"


@dataclass(frozen=True)
class ClipPoint:
    sentence: int
    nudge: int = 0


@dataclass(frozen=True)
class ClipReview:
    start: ClipPoint
    end: ClipPoint
    decision: Decision = Decision.UNDECIDED
    reject_reason: RejectReason | None = None
    title: str | None = None


@dataclass(frozen=True)
class Look:
    caption_style: CaptionStyle = CaptionStyle.KEYWORD
    framing: Framing = Framing.FOLLOW_SPEAKER
    show_hook_title: bool = True
    show_safe_zones: bool = False


STARTING_LOOK = Look()
