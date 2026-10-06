import logging
import threading
import time
from collections.abc import Callable
from dataclasses import dataclass, field

from ..pipeline import DISK_FULL, comes_from_a_full_disk
from ..projects import ProjectRepository
from .render_clip import ClipNotKeptError, ClipRender, SourceGoneError
from .render_records import QueuedRender
from .render_store import RenderStore

IDLE_POLL_SECONDS = 0.25
STORE_INTERVAL_SECONDS = 0.25
SHUTDOWN_TIMEOUT_SECONDS = 10
STOP_TIMEOUT_SECONDS = 10
SOURCE_GONE = "The source video is no longer on this Mac, so this clip cannot be rendered."
NOT_RENDERED = "This clip could not be rendered. Retry to render it again."

log = logging.getLogger("clipper.rendering")


@dataclass
class RenderRun:
    queued: QueuedRender
    stop: threading.Event = field(default_factory=threading.Event)
    ended: threading.Event = field(default_factory=threading.Event)
    is_cancelled: bool = False


class StoredPercent:
    def __init__(self, store: RenderStore, queued: QueuedRender) -> None:
        self._store = store
        self._queued = queued
        self._highest = 0.0
        self._stored_at = 0.0

    def report(self, percent: float) -> None:
        if percent <= self._highest:
            return
        self._highest = percent
        if time.monotonic() - self._stored_at >= STORE_INTERVAL_SECONDS:
            self._store.raise_percent(self._queued, percent)
            self._stored_at = time.monotonic()


class RenderWorker:
    def __init__(
        self,
        store: RenderStore,
        repository: ProjectRepository,
        render: Callable[[ClipRender], None],
    ) -> None:
        self._store = store
        self._repository = repository
        self._render = render
        self._shutdown = threading.Event()
        self._current: RenderRun | None = None
        self._lock = threading.Lock()
        self._thread = threading.Thread(target=self._work, name="clipper-renders", daemon=True)

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
            if run is None or run.queued.project_id != project_id:
                return False
            run.is_cancelled = True
            run.stop.set()
        return run.ended.wait(STOP_TIMEOUT_SECONDS)

    def _work(self) -> None:
        while not self._shutdown.is_set():
            run = self._take_next()
            if run is None:
                self._shutdown.wait(IDLE_POLL_SECONDS)
            else:
                self._run_to_its_end(run)

    def _take_next(self) -> RenderRun | None:
        with self._lock:
            queued = self._store.take_oldest_waiting()
            self._current = RenderRun(queued) if queued else None
            return self._current

    def _run_to_its_end(self, run: RenderRun) -> None:
        try:
            self._render_and_record(run)
        finally:
            with self._lock:
                self._current = None
            run.ended.set()

    def _render_and_record(self, run: RenderRun) -> None:
        project = self._repository.find(run.queued.project_id)
        if project is None:
            return
        percent = StoredPercent(self._store, run.queued)
        try:
            self._render(ClipRender(project, run.queued.clip_id, run.stop, percent.report))
        except ClipNotKeptError:
            self._store.take_out(run.queued)
        except Exception as failure:
            self._record_unfinished(run, failure)
        else:
            self._store.mark_done(run.queued)

    def _record_unfinished(self, run: RenderRun, failure: Exception) -> None:
        if self._shutdown.is_set():
            self._store.put_back_interrupted()
        elif run.is_cancelled:
            self._store.take_out(run.queued)
        else:
            queued = run.queued
            log.exception(
                "Clip %s of project %s was not rendered.", queued.clip_id, queued.project_id
            )
            self._store.mark_failed(queued, explain_failed_render(failure))


def explain_failed_render(failure: Exception) -> str:
    if comes_from_a_full_disk(failure):
        return DISK_FULL
    if isinstance(failure, SourceGoneError):
        return SOURCE_GONE
    return NOT_RENDERED
