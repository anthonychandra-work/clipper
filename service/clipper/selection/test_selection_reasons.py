import pytest

from ..pipeline import StageFailedError
from .claude_errors import (
    AskStoppedError,
    BusyServiceError,
    ClaudeAskError,
    ClaudeRequestError,
    DeclinedReplyError,
    NoAnswerError,
    RefusedKeyError,
    UnreadableReplyError,
)
from .selection_reasons import MISSING_KEY, NO_CANDIDATE, stating_claude_failures

UNMARKED = False
MARKED_FOR_SETTINGS = True


@pytest.mark.parametrize(
    ("failure", "sentence", "opens_settings"),
    [
        (
            UnreadableReplyError(3),
            "Claude’s reply could not be read, three times in a row. Retry to run this step again.",
            UNMARKED,
        ),
        (
            DeclinedReplyError(),
            "Claude declined to read this transcript. "
            "Retry, or choose another model for this step in Settings.",
            MARKED_FOR_SETTINGS,
        ),
        (
            RefusedKeyError(),
            "Anthropic did not accept the saved API key. Check the key in Settings, then retry.",
            MARKED_FOR_SETTINGS,
        ),
        (
            NoAnswerError(),
            "Clipper could not reach Anthropic. Check your connection, then retry.",
            UNMARKED,
        ),
        (
            BusyServiceError(),
            "Anthropic is too busy to answer right now. Wait a minute, then retry.",
            UNMARKED,
        ),
    ],
)
def test_a_named_error_of_asking_becomes_its_sentence_with_its_mark(
    failure: ClaudeAskError, sentence: str, opens_settings: bool
) -> None:
    with pytest.raises(StageFailedError) as raised, stating_claude_failures():
        raise failure

    assert (raised.value.reason, raised.value.opens_settings) == (sentence, opens_settings)
    assert raised.value.__cause__ is failure


@pytest.mark.parametrize("failure", [AskStoppedError(), ClaudeRequestError()])
def test_a_stop_and_any_other_refusal_of_the_api_pass_as_they_are(failure: ClaudeAskError) -> None:
    with pytest.raises(ClaudeAskError) as raised, stating_claude_failures():
        raise failure

    assert raised.value is failure


def test_a_failure_that_is_not_about_asking_passes_as_it_is() -> None:
    failure = OSError("the transcript could not be read")

    with pytest.raises(OSError) as raised, stating_claude_failures():
        raise failure

    assert raised.value is failure


def test_nothing_is_raised_when_nothing_fails() -> None:
    answered: list[str] = []

    with stating_claude_failures():
        answered.append("a reply")

    assert answered == ["a reply"]


def test_the_missing_key_and_the_empty_cut_have_their_sentences() -> None:
    assert MISSING_KEY == "No Anthropic API key is saved. Add one in Settings, then retry."
    assert NO_CANDIDATE == (
        "No clip of the chosen length was found in this video. Retry to look again."
    )
