import logging
import threading
import time
from collections.abc import Callable, Mapping, Sequence
from dataclasses import dataclass, field
from typing import NamedTuple

from ..projects import Project, ProjectQueue, ProjectRepository, ProjectStatus, StepKind
from .explain_failure import describe_stop, explain_failure
from .pipeline_stage import PipelineStage, StageRun

StepCheck = Callable[[Project], None]

IDLE_POLL_SECONDS = 0.25
STORE_INTERVAL_SECONDS = 0.25
SHUTDOWN_TIMEOUT_SECONDS = 10
STOP_TIMEOUT_SECONDS = 5
FINISHED_PERCENT = 100.0

log = logging.getLogger("clipper.pipeline")


@dataclass
class ProjectRun:
    project_id: str
    stop: threading.Event = field(default_factory=threading.Event)
    ended: threading.Event = field(default_factory=threading.Event)
    is_stopped_by_user: bool = False


class Halt(NamedTuple):
    status: ProjectStatus
    reason: str


class StoredPercent:
    def __init__(self, queue: ProjectQueue, project_id: str, step: StepKind) -> None:
        self._queue = queue
        self._project_id = project_id
        self._step = step
        self._highest = 0.0
        self._stored_at = 0.0

    def report(self, percent: float) -> None:
        if percent <= self._highest:
            return
        self._highest = percent
        is_due = time.monotonic() - self._stored_at >= STORE_INTERVAL_SECONDS
        if is_due or percent >= FINISHED_PERCENT:
            self._queue.raise_step_percent(self._project_id, self._step, percent)
            self._stored_at = time.monotonic()


class QueueWorker:
    def __init__(
        self,
        repository: ProjectRepository,
        queue: ProjectQueue,
        stages: Sequence[PipelineStage],
        checks: Mapping[StepKind, StepCheck] | None = None,
    ) -> None:
        self._repository = repository
        self._queue = queue
        self._stages = {stage.step: stage for stage in stages}
        self._checks = dict(checks or {})
        self._shutdown = threading.Event()
        self._current: ProjectRun | None = None
        self._lock = threading.Lock()
        self._thread = threading.Thread(target=self._work, name="clipper-queue", daemon=True)

    def start(self) -> None:
        self._thread.start()

    def stop(self) -> None:
        self._shutdown.set()
        with self._lock:
            if self._current is not None:
                self._current.stop.set()
        self._thread.join(SHUTDOWN_TIMEOUT_SECONDS)

    def stop_project(self, project_id: str) -> bool:
        with self._lock:
            run = self._current
            if run is None or run.project_id != project_id:
                return False
            run.is_stopped_by_user = True
            run.stop.set()
        return run.ended.wait(STOP_TIMEOUT_SECONDS)

    def _work(self) -> None:
        while not self._shutdown.is_set():
            run = self._take_next()
            if run is None:
                self._shutdown.wait(IDLE_POLL_SECONDS)
            else:
                self._process(run)

    def _take_next(self) -> ProjectRun | None:
        with self._lock:
            project_id = self._queue.take_oldest_queued()
            self._current = ProjectRun(project_id) if project_id else None
            return self._current

    def _process(self, run: ProjectRun) -> None:
        try:
            self._run_stages(run)
        finally:
            with self._lock:
                self._current = None
            run.ended.set()

    def _run_stages(self, run: ProjectRun) -> None:
        resting_status: ProjectStatus | None = None
        while (planned := self._find_next_step(run.project_id)) is not None:
            stage = self._run_step(run, planned)
            if stage is None:
                return
            resting_status = stage.resting_status
        if resting_status is not None:
            self._queue.rest(run.project_id, resting_status)

    def _find_next_step(self, project_id: str) -> StepKind | None:
        project = self._repository.find(project_id)
        step = project.first_unfinished_step() if project else None
        return step.kind if step and step.kind in self._stages else None

    def _run_step(self, run: ProjectRun, planned: StepKind) -> PipelineStage | None:
        step = planned
        try:
            step = self._check_then_take(run.project_id, planned)
            stage = self._stages[step]
            self._queue.start_step(run.project_id, step)
            percent = StoredPercent(self._queue, run.project_id, step)
            stage.run(StageRun(self._repository.get(run.project_id), run.stop, percent.report))
        except Exception as failure:
            self._record_halt(run, failure, step)
            return None
        self._queue.finish_step(run.project_id, step)
        return stage

    def _check_then_take(self, project_id: str, planned: StepKind) -> StepKind:
        check = self._checks.get(planned)
        if check is not None:
            check(self._repository.get(project_id))
        taken = self._repository.get(project_id).first_unfinished_step()
        return taken.kind if taken else planned

    def _record_halt(self, run: ProjectRun, failure: Exception, step: StepKind) -> None:
        project = self._repository.find(run.project_id)
        if self._shutdown.is_set() or project is None:
            return
        halt = describe_halt(run, failure, project.label_of_kind(step))
        if halt.status is ProjectStatus.FAILED:
            log.exception("A step of project %s failed.", run.project_id)
        self._queue.halt(run.project_id, halt.status, halt.reason)


def describe_halt(run: ProjectRun, failure: Exception, step_label: str) -> Halt:
    if run.is_stopped_by_user:
        return Halt(ProjectStatus.STOPPED, describe_stop(step_label))
    return Halt(ProjectStatus.FAILED, explain_failure(failure, step_label))
