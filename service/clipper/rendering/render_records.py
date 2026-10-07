from dataclasses import dataclass
from enum import StrEnum


class RenderState(StrEnum):
    WAITING = "waiting"
    RENDERING = "rendering"
    DONE = "done"
    FAILED = "failed"


@dataclass(frozen=True)
class Render:
    clip_id: str
    state: RenderState
    percent: float
    reason: str | None
    queue_place: int
    has_export: bool


@dataclass(frozen=True)
class QueuedRender:
    project_id: str
    clip_id: str
