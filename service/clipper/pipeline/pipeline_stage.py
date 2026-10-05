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


class PipelineStage(Protocol):
    step: StepKind
    resting_status: ProjectStatus

    def run(self, stage_run: StageRun) -> None: ...
