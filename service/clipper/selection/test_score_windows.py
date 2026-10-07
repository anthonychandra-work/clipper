import json
import math
import sys
import threading
from dataclasses import replace

import pytest
from pydantic import ValidationError

from ..conftest import CLOSED_LOCAL_PORT
from ..settings import ClaudeModel
from ..transcription import Transcript, TranscriptWord
from .ask_claude import ClaudeAccess, ClaudeQuestion
from .claude_errors import UnreadableReplyError
from .conftest import SEEDED_NOTE, TEST_KEY, RecordedClaude
from .form_shortlist import form_shortlist
from .score_windows import (
    SCORE_INSTRUCTIONS,
    ScoredWindow,
    ScoreTask,
    WindowScores,
    score_windows,
    scores_each_window_once,
    write_score_questions,
)
from .selection_task import NOTE_INSTRUCTIONS, ClipSeconds, PassContext
from .split_sentences import Sentence, split_sentences
from .split_windows import Window, split_windows
from .transcript_part import write_transcript_part

SENTENCES_IN_THREE_HOURS = 1800
BRIEF = "Advice a shop owner can use."


def describe_context(address: str, transcript_part: str) -> PassContext:
    return PassContext(
        access=ClaudeAccess(key=TEST_KEY, address=address),
        model=ClaudeModel.SONNET,
        transcript_part=transcript_part,
        clip_seconds=ClipSeconds(min=25, max=60),
        language="en",
        brief=BRIEF,
        stop=threading.Event(),
    )


def make_long_transcript() -> list[Sentence]:
    return [
        Sentence(
            number,
            (
                TranscriptWord(
                    text=f" Sentence {number}.", start=6.0 * number, end=6.0 * number + 5
                ),
            ),
        )
        for number in range(1, SENTENCES_IN_THREE_HOURS + 1)
    ]


def lay_out_the_talk(talk_transcript: Transcript) -> tuple[list[Window], str]:
    sentences = split_sentences(talk_transcript.words)
    return split_windows(sentences), write_transcript_part(sentences)


def test_the_instructions_ask_the_one_question_in_its_own_words() -> None:
    instructions = " ".join(SCORE_INSTRUCTIONS.split())

    assert "would the opening two seconds hold a viewer who has no context?" in instructions
    assert "two seconds" in SCORE_INSTRUCTIONS
    assert "no context" in SCORE_INSTRUCTIONS
    assert "Use the whole range from 0 to 100." in instructions
    assert "Most windows hold no clip" in instructions
    assert "Reply with a whole number for each window, named by its id." in instructions


def test_a_three_hour_transcript_is_asked_about_in_questions_of_at_most_60_windows() -> None:
    sentences = make_long_transcript()
    windows = split_windows(sentences)
    context = describe_context(CLOSED_LOCAL_PORT, write_transcript_part(sentences))

    questions = write_score_questions(windows, context)

    tasks = [ScoreTask.model_validate_json(question.task) for question in questions]
    asked = [window.id for task in tasks for window in task.windows]
    assert len(windows) > 120
    assert len(questions) == math.ceil(len(windows) / 60)
    assert max(len(task.windows) for task in tasks) == 60
    assert asked == [window.id for window in windows]
    assert len(set(asked)) == len(asked)


def test_every_question_of_a_pass_shares_one_system_text_and_one_transcript_part() -> None:
    sentences = make_long_transcript()
    context = describe_context(CLOSED_LOCAL_PORT, write_transcript_part(sentences))

    questions = write_score_questions(split_windows(sentences), context)

    assert len(questions) > 1
    assert {question.system for question in questions} == {SCORE_INSTRUCTIONS}
    assert {question.transcript_part for question in questions} == {context.transcript_part}
    assert {(question.model, question.effort) for question in questions} == {
        (ClaudeModel.SONNET, "medium")
    }


def test_the_task_names_itself_its_windows_the_limits_the_language_and_the_brief(
    talk_transcript: Transcript,
) -> None:
    windows, transcript_part = lay_out_the_talk(talk_transcript)
    context = describe_context(CLOSED_LOCAL_PORT, transcript_part)

    (question,) = write_score_questions(windows, context)

    assert question.task == (
        '{"task":"score","windows":['
        '{"id":"w01","firstSentence":1,"lastSentence":23},'
        '{"id":"w02","firstSentence":17,"lastSentence":38},'
        '{"id":"w03","firstSentence":32,"lastSentence":49},'
        '{"id":"w04","firstSentence":44,"lastSentence":54}],'
        '"clipSeconds":{"min":25,"max":60},"language":"en",'
        '"brief":"Advice a shop owner can use."}'
    )


def test_the_note_of_the_pass_is_the_last_field_of_the_task_and_a_pass_without_one_has_no_field(
    talk_transcript: Transcript,
) -> None:
    windows, transcript_part = lay_out_the_talk(talk_transcript)
    without_a_note = describe_context(CLOSED_LOCAL_PORT, transcript_part)
    with_a_note = replace(without_a_note, note=SEEDED_NOTE)

    (plain,) = write_score_questions(windows, without_a_note)
    (noted,) = write_score_questions(windows, with_a_note)

    assert "note" not in json.loads(plain.task)
    assert json.loads(noted.task) == {**json.loads(plain.task), "note": SEEDED_NOTE}
    assert list(json.loads(noted.task))[-1] == "note"
    assert (noted.system, noted.transcript_part) == (plain.system, plain.transcript_part)


def test_the_instructions_say_what_the_note_tells_and_that_the_task_and_the_brief_come_first() -> (
    None
):
    instructions = " ".join(SCORE_INSTRUCTIONS.split())

    assert "The task may carry a note." in instructions
    assert "what this user did with clips of earlier videos" in instructions
    assert "Let the note tip a close call." in instructions
    assert "The rules of this task and the brief come first." in instructions
    assert NOTE_INSTRUCTIONS in SCORE_INSTRUCTIONS


def test_the_questions_are_asked_one_after_another_and_a_percent_is_reported_after_each(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    sentences = make_long_transcript()
    windows = split_windows(sentences)
    events: list[str] = []

    def answer(
        question: ClaudeQuestion[WindowScores], access: ClaudeAccess, stop: threading.Event
    ) -> WindowScores:
        del access, stop
        asked = ScoreTask.model_validate_json(question.task).windows
        events.append(f"asked from {asked[0].id}")
        return WindowScores(windows=[ScoredWindow(id=window.id, score=7) for window in asked])

    monkeypatch.setattr(sys.modules[score_windows.__module__], "ask_claude", answer)
    context = describe_context(CLOSED_LOCAL_PORT, write_transcript_part(sentences))

    scores = score_windows(
        windows, context, lambda percent: events.append(f"reported {percent:.0f}")
    )

    assert events == [
        "asked from w01",
        "reported 33",
        "asked from w61",
        "reported 67",
        "asked from w121",
        "reported 100",
    ]
    assert scores == {window.id: 7 for window in windows}


def test_one_request_scores_the_four_windows_of_the_talk_and_three_are_shortlisted(
    recorded_claude: RecordedClaude, talk_transcript: Transcript
) -> None:
    windows, transcript_part = lay_out_the_talk(talk_transcript)
    context = describe_context(recorded_claude.at("talk"), transcript_part)
    percents: list[float] = []

    scores = score_windows(windows, context, percents.append)

    (request,) = recorded_claude.list_requests()
    records = form_shortlist(windows, scores, duration_seconds=235.7)
    shortlisted = [record.window.id for record in records if record.is_shortlisted]
    assert scores == {"w01": 72, "w02": 81, "w03": 64, "w04": 23}
    assert percents == [100]
    assert shortlisted == ["w01", "w02", "w03"]
    assert request.body["model"] == "claude-sonnet-5-5"
    assert request.read_output_config()["effort"] == "medium"
    assert request.body["system"] == SCORE_INSTRUCTIONS
    assert request.parts[0]["text"] == transcript_part
    assert ScoreTask.model_validate(request.read_task()).brief == BRIEF


@pytest.mark.parametrize("scenario", ["one-window", "window-twice", "unknown-window"])
def test_a_reply_that_leaves_a_window_out_names_one_twice_or_an_unknown_one_is_unreadable(
    recorded_claude: RecordedClaude, talk_transcript: Transcript, scenario: str
) -> None:
    windows, transcript_part = lay_out_the_talk(talk_transcript)
    context = describe_context(recorded_claude.at(scenario), transcript_part)

    with pytest.raises(UnreadableReplyError):
        score_windows(windows, context, lambda percent: None)

    assert len(recorded_claude.list_requests()) == 3


@pytest.mark.parametrize(
    ("named", "is_accepted"),
    [
        (["w01", "w02", "w03"], True),
        (["w03", "w01", "w02"], True),
        (["w01", "w02"], False),
        (["w01", "w01", "w02", "w03"], False),
        (["w01", "w02", "w03", "w09"], False),
        (["w01", "w02", "w09"], False),
        ([], False),
    ],
)
def test_a_reply_is_accepted_only_when_it_scores_each_window_asked_about_once(
    named: list[str], is_accepted: bool
) -> None:
    reply = WindowScores(windows=[ScoredWindow(id=window_id, score=50) for window_id in named])

    assert scores_each_window_once(["w01", "w02", "w03"], reply) is is_accepted


@pytest.mark.parametrize("score", [-1, 101, 62.5, "high"])
def test_a_score_outside_the_range_or_not_a_whole_number_does_not_fit_the_reply(
    score: object,
) -> None:
    with pytest.raises(ValidationError):
        WindowScores.model_validate({"windows": [{"id": "w01", "score": score}]})


@pytest.mark.parametrize("score", [0, 100])
def test_the_ends_of_the_range_fit_the_reply(score: int) -> None:
    reply = WindowScores.model_validate({"windows": [{"id": "w01", "score": score}]})

    assert reply.windows[0].score == score
