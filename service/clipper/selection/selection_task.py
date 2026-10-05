import threading
from dataclasses import dataclass

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from ..settings import ClaudeModel
from .ask_claude import ClaudeAccess
from .split_windows import Window


class TaskModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    def write(self) -> str:
        return self.model_dump_json(by_alias=True)


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


def describe_task_window(window: Window) -> TaskWindow:
    return TaskWindow(
        id=window.id, first_sentence=window.first_sentence, last_sentence=window.last_sentence
    )
