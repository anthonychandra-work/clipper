import threading
from collections.abc import Callable
from dataclasses import dataclass
from typing import Protocol

from ..projects import Project, ProjectStatus, StepKind


@dataclass(frozen=True)
class StageRun:
    project: Project
    stop: threading.Event
    report_percent: Callable[[float], None]


class StageFailedError(Exception):
    def __init__(self, reason: str, *, opens_settings: bool = False) -> None:
        super().__init__(reason)
        self.reason = reason
        self.opens_settings = opens_settings


class PipelineStage(Protocol):
    step: StepKind
    resting_status: ProjectStatus

    def run(self, stage_run: StageRun) -> None: ...
