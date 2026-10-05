from collections.abc import Iterator
from contextlib import contextmanager
from typing import NamedTuple

from ..pipeline import StageFailedError
from .claude_errors import (
    BusyServiceError,
    ClaudeAskError,
    DeclinedReplyError,
    NoAnswerError,
    RefusedKeyError,
    UnreadableReplyError,
)

MISSING_KEY = "No Anthropic API key is saved. Add one in Settings, then retry."
UNREADABLE_REPLY = (
    "Claude’s reply could not be read, three times in a row. Retry to run this step again."
)
DECLINED_REPLY = (
    "Claude declined to read this transcript. "
    "Retry, or choose another model for this step in Settings."
)
REFUSED_KEY = "Anthropic did not accept the saved API key. Check the key in Settings, then retry."
NO_ANSWER = "Clipper could not reach Anthropic. Check your connection, then retry."
BUSY_SERVICE = "Anthropic is too busy to answer right now. Wait a minute, then retry."
NO_CANDIDATE = "No clip of the chosen length was found in this video. Retry to look again."


class StatedReason(NamedTuple):
    sentence: str
    opens_settings: bool = False


REASONS_BY_ERROR: dict[type[ClaudeAskError], StatedReason] = {
    UnreadableReplyError: StatedReason(UNREADABLE_REPLY),
    DeclinedReplyError: StatedReason(DECLINED_REPLY, opens_settings=True),
    RefusedKeyError: StatedReason(REFUSED_KEY, opens_settings=True),
    NoAnswerError: StatedReason(NO_ANSWER),
    BusyServiceError: StatedReason(BUSY_SERVICE),
}


@contextmanager
def stating_claude_failures() -> Iterator[None]:
    try:
        yield
    except ClaudeAskError as failure:
        stated = REASONS_BY_ERROR.get(type(failure))
        if stated is None:
            raise
        raise StageFailedError(stated.sentence, opens_settings=stated.opens_settings) from failure
