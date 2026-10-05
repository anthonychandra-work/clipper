import logging
import threading
import time
from collections.abc import Sequence

from ..projects import Project, ProjectQueue, ProjectRepository, ProjectStatus, StepKind
from .pipeline_stage import PipelineStage, StageRun

IDLE_POLL_SECONDS = 0.25
STORE_INTERVAL_SECONDS = 0.25
SHUTDOWN_TIMEOUT_SECONDS = 10
FINISHED_PERCENT = 100.0

log = logging.getLogger("clipper.pipeline")


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
        self, repository: ProjectRepository, queue: ProjectQueue, stages: Sequence[PipelineStage]
    ) -> None:
        self._repository = repository
        self._queue = queue
        self._stages = {stage.step: stage for stage in stages}
        self._shutdown = threading.Event()
        self._running_stop: threading.Event | None = None
        self._running_lock = threading.Lock()
        self._thread = threading.Thread(target=self._work, name="clipper-queue", daemon=True)

    def start(self) -> None:
        self._thread.start()

    def stop(self) -> None:
        self._shutdown.set()
        with self._running_lock:
            if self._running_stop is not None:
                self._running_stop.set()
        self._thread.join(SHUTDOWN_TIMEOUT_SECONDS)

    def _work(self) -> None:
        while not self._shutdown.is_set():
            project_id = self._queue.take_oldest_queued()
            if project_id is None:
                self._shutdown.wait(IDLE_POLL_SECONDS)
            else:
                self._process(project_id)

    def _process(self, project_id: str) -> None:
        resting_status: ProjectStatus | None = None
        while (stage := self._find_next_stage(project_id)) is not None:
            if not self._run_stage(project_id, stage):
                return
            resting_status = stage.resting_status
        if resting_status is not None:
            self._queue.rest(project_id, resting_status)

    def _find_next_stage(self, project_id: str) -> PipelineStage | None:
        project = self._repository.find(project_id)
        step = project.first_unfinished_step() if project else None
        return self._stages.get(step.kind) if step else None

    def _run_stage(self, project_id: str, stage: PipelineStage) -> bool:
        project = self._repository.get(project_id)
        self._queue.start_step(project_id, stage.step)
        percent = StoredPercent(self._queue, project_id, stage.step)
        try:
            stage.run(StageRun(project, self._begin_run(), percent.report))
        except Exception:
            self._record_halt(project, stage)
            return False
        finally:
            self._end_run()
        self._queue.finish_step(project_id, stage.step)
        return True

    def _begin_run(self) -> threading.Event:
        with self._running_lock:
            self._running_stop = threading.Event()
            if self._shutdown.is_set():
                self._running_stop.set()
            return self._running_stop

    def _end_run(self) -> None:
        with self._running_lock:
            self._running_stop = None

    def _record_halt(self, project: Project, stage: PipelineStage) -> None:
        if self._shutdown.is_set():
            return
        log.exception("The %s step of project %s failed.", stage.step, project.id)
        step_label = project.label_of_kind(stage.step)
        self._queue.halt(project.id, ProjectStatus.FAILED, describe_failure(step_label))


def describe_failure(step_label: str) -> str:
    return f"“{step_label}” did not finish. Retry to run this step again."
