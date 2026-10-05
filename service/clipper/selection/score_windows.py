from collections.abc import Callable, Sequence
from functools import partial
from typing import Literal

from pydantic import BaseModel, Field

from .ask_claude import ClaudeQuestion, Effort, ask_claude
from .selection_task import ClipSeconds, PassContext, TaskModel, TaskWindow, describe_task_window
from .split_windows import Window

MAX_WINDOWS_PER_QUESTION = 60
SCORING_EFFORT: Effort = "medium"
ALL_ASKED_PERCENT = 100.0

SCORE_INSTRUCTIONS = """\
You help pick short vertical clips from a long spoken video. You receive its transcript as
numbered sentences. Each line holds the number of a sentence, the second it starts at in square
brackets, and its text. After the transcript comes one task as a JSON object.

The task lists windows of the transcript. Each window has an id and the numbers of its first and
last sentence. Score every window from 0 to 100 on one question:
would the opening two seconds hold a viewer who has no context?
Think of someone scrolling who has seen nothing else of this video. Take the strongest line a clip
from this window could open on, and judge whether that person stays to hear the next sentence.

Use the whole range from 0 to 100. Most windows hold no clip, and their scores should say so.
Intros, outros, sponsor reads, housekeeping and talk that leans on what was said before score low.
Keep the high scores for windows where a line can open cold and the thought that follows it is
complete.

The task also gives the shortest and longest length of a clip in seconds, the language of the
transcript and a brief. A brief that is not empty says what the user is looking for, and windows
that hold it deserve a higher score.

Reply with a whole number for each window, named by its id. Score every window of the task once,
and no window the task does not list.
"""


class ScoreTask(TaskModel):
    task: Literal["score"] = "score"
    windows: list[TaskWindow]
    clip_seconds: ClipSeconds
    language: str
    brief: str


class ScoredWindow(BaseModel):
    id: str
    score: int = Field(ge=0, le=100)


class WindowScores(BaseModel):
    windows: list[ScoredWindow]


def score_windows(
    windows: Sequence[Window], context: PassContext, report_percent: Callable[[float], None]
) -> dict[str, int]:
    questions = write_score_questions(windows, context)
    scores: dict[str, int] = {}
    for asked_count, question in enumerate(questions, start=1):
        reply = ask_claude(question, context.access, context.stop)
        scores.update({scored.id: scored.score for scored in reply.windows})
        report_percent(ALL_ASKED_PERCENT * asked_count / len(questions))
    return scores


def write_score_questions(
    windows: Sequence[Window], context: PassContext
) -> list[ClaudeQuestion[WindowScores]]:
    starts = range(0, len(windows), MAX_WINDOWS_PER_QUESTION)
    return [
        write_score_question(windows[start : start + MAX_WINDOWS_PER_QUESTION], context)
        for start in starts
    ]


def write_score_question(
    windows: Sequence[Window], context: PassContext
) -> ClaudeQuestion[WindowScores]:
    task = ScoreTask(
        windows=[describe_task_window(window) for window in windows],
        clip_seconds=context.clip_seconds,
        language=context.language,
        brief=context.brief,
    )
    return ClaudeQuestion(
        model=context.model,
        effort=SCORING_EFFORT,
        system=SCORE_INSTRUCTIONS,
        transcript_part=context.transcript_part,
        task=task.write(),
        reply_model=WindowScores,
        accepts=partial(scores_each_window_once, [window.id for window in windows]),
    )


def scores_each_window_once(asked_ids: Sequence[str], reply: WindowScores) -> bool:
    return sorted(scored.id for scored in reply.windows) == sorted(asked_ids)
