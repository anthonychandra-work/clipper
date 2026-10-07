import threading
from dataclasses import dataclass

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from ..settings import ClaudeModel
from .ask_claude import ClaudeAccess
from .split_windows import Window

NOTE_INSTRUCTIONS = """\
The task may carry a note. It tells what this user did with clips of earlier videos: how many
they rejected and for which reasons, and which hooks and lengths did best and worst once posted.
Let the note tip a close call. The rules of this task and the brief come first."""


class TaskModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    def write(self) -> str:
        return self.model_dump_json(by_alias=True, exclude_none=True)


class ClipSeconds(TaskModel):
    min: int
    max: int


class TaskWindow(TaskModel):
    id: str
    first_sentence: int
    last_sentence: int


@dataclass(frozen=True)
class PassContext:
    access: ClaudeAccess
    model: ClaudeModel
    transcript_part: str
    clip_seconds: ClipSeconds
    language: str
    brief: str
    stop: threading.Event
    note: str | None = None


def describe_task_window(window: Window) -> TaskWindow:
    return TaskWindow(
        id=window.id, first_sentence=window.first_sentence, last_sentence=window.last_sentence
    )
