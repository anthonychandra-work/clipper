import errno
import threading
from collections.abc import Callable, Iterator

import pytest

from ..media import MediaToolFailedError, MediaWorkStoppedError
from ..pipeline.test_run_queue import wait_until
from ..projects import ProjectRepository, ProjectStatus
from ..review.conftest import CutTalk, CutTheTalk
from ..storage import Database
from .render_clip import ClipNotKeptError, ClipRender, SourceGoneError
from .render_records import QueuedRender, RenderState
from .render_store import RenderStore
from .render_worker import RenderWorker

DISK_FULL = "Not enough free disk space to finish. Free some space, then retry."
SOURCE_GONE = "The source video is no longer on this Mac, so this clip cannot be rendered."
NOT_RENDERED = "This clip could not be rendered. Retry to render it again."

type StartWorker = Callable[[Callable[[ClipRender], None]], RenderWorker]


class HeldRender:
    def __init__(self) -> None:
        self.started: list[str] = []
        self.most_at_once = 0
        self.release = threading.Semaphore(0)
        self._running = 0

    def __call__(self, render: ClipRender) -> None:
        self.started.append(render.clip_id)
        self._running += 1
        self.most_at_once = max(self.most_at_once, self._running)
        try:
            while not self.release.acquire(timeout=0.02):
                if render.stop.is_set():
                    raise MediaWorkStoppedError()
        finally:
            self._running -= 1


class CountingStore(RenderStore):
    def __init__(self, database: Database) -> None:
        super().__init__(database)
        self.stored_percents: list[float] = []

    def raise_percent(self, render: QueuedRender, percent: float) -> None:
        self.stored_percents.append(percent)
        super().raise_percent(render, percent)


def finish_at_once(render: ClipRender) -> None:
    del render


@pytest.fixture
def store(database: Database) -> CountingStore:
    return CountingStore(database)


@pytest.fixture
def start_worker(store: RenderStore, repository: ProjectRepository) -> Iterator[StartWorker]:
    started: list[RenderWorker] = []

    def start(render: Callable[[ClipRender], None]) -> RenderWorker:
        worker = RenderWorker(store, repository, render)
        started.append(worker)
        worker.start()
        return worker

    yield start
    for worker in started:
        worker.stop()


def list_states(store: RenderStore, project_id: str) -> dict[str, RenderState]:
    return {clip_id: render.state for clip_id, render in store.list_renders(project_id).items()}


def test_three_queued_clips_are_rendered_one_after_another_in_their_order(
    store: RenderStore, cut_talk: CutTalk, start_worker: StartWorker, repository: ProjectRepository
) -> None:
    project_id, held = cut_talk.project.id, HeldRender()
    store.queue_clips(project_id, ["c02", "c01", "c03"])

    start_worker(held)
    wait_until(lambda: held.started == ["c02"])
    states_during_the_first = list_states(store, project_id)
    for _ in range(3):
        held.release.release()
    wait_until(lambda: set(list_states(store, project_id).values()) == {RenderState.DONE})

    assert states_during_the_first == {
        "c02": RenderState.RENDERING,
        "c01": RenderState.WAITING,
        "c03": RenderState.WAITING,
    }
    assert (held.started, held.most_at_once) == (["c02", "c01", "c03"], 1)
    project = repository.get(project_id)
    assert (project.status, project.exported_count) == (ProjectStatus.EXPORTED, 3)


def test_the_renders_of_two_projects_are_taken_in_the_order_they_were_queued(
    store: RenderStore, cut_the_talk: CutTheTalk, start_worker: StartWorker
) -> None:
    first, second = cut_the_talk().project.id, cut_the_talk().project.id
    rendered: list[tuple[str, str]] = []
    store.queue_clips(second, ["c01"])
    store.queue_clips(first, ["c01"])
    store.queue_clips(second, ["c02"])

    start_worker(lambda render: rendered.append((render.project.id, render.clip_id)))
    wait_until(lambda: len(rendered) == 3)

    assert rendered == [(second, "c01"), (first, "c01"), (second, "c02")]


def test_a_render_that_reports_40_percent_leaves_40_stored_while_it_runs(
    store: RenderStore, cut_talk: CutTalk, start_worker: StartWorker
) -> None:
    project_id, held = cut_talk.project.id, HeldRender()
    store.queue_clips(project_id, ["c01"])

    def report_then_hold(render: ClipRender) -> None:
        render.report_percent(40.0)
        held(render)

    start_worker(report_then_hold)
    wait_until(lambda: held.started == ["c01"])

    running = store.list_renders(project_id)["c01"]
    assert (running.state, running.percent) == (RenderState.RENDERING, 40.0)
    held.release.release()


def test_the_percent_is_stored_at_most_four_times_a_second(
    store: CountingStore, cut_talk: CutTalk, start_worker: StartWorker
) -> None:
    project_id = cut_talk.project.id
    store.queue_clips(project_id, ["c01"])

    def report_fifty_times(render: ClipRender) -> None:
        for percent in range(1, 51):
            render.report_percent(float(percent))

    start_worker(report_fifty_times)
    wait_until(lambda: list_states(store, project_id) == {"c01": RenderState.DONE})

    assert store.stored_percents == [1.0]
    assert store.list_renders(project_id)["c01"].percent == 100.0


@pytest.mark.parametrize(
    ("failure", "sentence"),
    [
        (OSError(errno.ENOSPC, "No space left on device"), DISK_FULL),
        (MediaToolFailedError("ffmpeg", 1, "Error: No space left on device"), DISK_FULL),
        (SourceGoneError("a1b2c3"), SOURCE_GONE),
        (MediaToolFailedError("ffmpeg", 183, "Invalid data found"), NOT_RENDERED),
        (RuntimeError("unexpected"), NOT_RENDERED),
    ],
)
def test_a_failed_render_leaves_its_sentence_and_the_next_clip_is_still_rendered(
    failure: Exception,
    sentence: str,
    store: RenderStore,
    cut_talk: CutTalk,
    start_worker: StartWorker,
    caplog: pytest.LogCaptureFixture,
) -> None:
    project_id = cut_talk.project.id
    store.queue_clips(project_id, ["c01", "c02"])

    def fail_the_first(render: ClipRender) -> None:
        if render.clip_id == "c01":
            raise failure

    start_worker(fail_the_first)
    wait_until(lambda: list_states(store, project_id).get("c02") is RenderState.DONE)

    failed = store.list_renders(project_id)["c01"]
    assert (failed.state, failed.reason, failed.has_export) == (RenderState.FAILED, sentence, False)
    assert f"Clip c01 of project {project_id} was not rendered." in caplog.text
    assert type(failure).__name__ in caplog.text


def test_a_cancel_during_the_second_clip_ends_it_and_renders_neither_it_nor_the_third(
    store: RenderStore, cut_talk: CutTalk, start_worker: StartWorker
) -> None:
    project_id, held = cut_talk.project.id, HeldRender()
    store.queue_clips(project_id, ["c01", "c02", "c03"])
    worker = start_worker(held)
    held.release.release()
    wait_until(lambda: held.started == ["c01", "c02"])

    store.cancel_waiting(project_id)
    has_ended = worker.stop_project(project_id)

    assert has_ended
    assert list_states(store, project_id) == {"c01": RenderState.DONE}
    assert held.started == ["c01", "c02"]
    assert store.take_oldest_waiting() is None


def test_a_cancelled_render_of_a_clip_with_an_earlier_export_goes_back_to_done(
    store: RenderStore, cut_talk: CutTalk, start_worker: StartWorker
) -> None:
    project_id, held = cut_talk.project.id, HeldRender()
    store.queue_clips(project_id, ["c01"])
    worker = start_worker(held)
    held.release.release()
    wait_until(lambda: list_states(store, project_id) == {"c01": RenderState.DONE})
    store.queue_clips(project_id, ["c01"])
    wait_until(lambda: held.started == ["c01", "c01"])

    worker.stop_project(project_id)

    again = store.list_renders(project_id)["c01"]
    assert (again.state, again.percent, again.has_export) == (RenderState.DONE, 100.0, True)


def test_a_render_that_had_finished_when_the_cancel_came_stays_done(
    store: RenderStore, cut_talk: CutTalk, start_worker: StartWorker
) -> None:
    project_id = cut_talk.project.id
    has_started, may_finish = threading.Event(), threading.Event()
    store.queue_clips(project_id, ["c01"])

    def finish_whatever_the_stop(render: ClipRender) -> None:
        has_started.set()
        render.stop.wait()
        may_finish.wait()

    worker = start_worker(finish_whatever_the_stop)
    has_started.wait()
    threading.Timer(0.05, may_finish.set).start()

    assert worker.stop_project(project_id)
    assert list_states(store, project_id) == {"c01": RenderState.DONE}


def test_a_stop_of_a_project_that_is_not_being_rendered_answers_at_once(
    store: RenderStore, cut_the_talk: CutTheTalk, start_worker: StartWorker
) -> None:
    rendering, other = cut_the_talk().project.id, cut_the_talk().project.id
    held = HeldRender()
    store.queue_clips(rendering, ["c01"])
    worker = start_worker(held)
    wait_until(lambda: held.started == ["c01"])

    assert worker.stop_project(other) is False
    assert list_states(store, rendering) == {"c01": RenderState.RENDERING}
    held.release.release()


def test_a_clip_that_is_no_longer_kept_when_its_turn_comes_is_taken_out_and_not_rendered(
    store: RenderStore, cut_talk: CutTalk, start_worker: StartWorker
) -> None:
    project_id = cut_talk.project.id
    rendered: list[str] = []
    store.queue_clips(project_id, ["c01", "c02"])

    def refuse_the_first(render: ClipRender) -> None:
        if render.clip_id == "c01":
            raise ClipNotKeptError(render.clip_id)
        rendered.append(render.clip_id)

    start_worker(refuse_the_first)
    wait_until(lambda: list_states(store, project_id).get("c02") is RenderState.DONE)

    assert list_states(store, project_id) == {"c02": RenderState.DONE}
    assert rendered == ["c02"]


def test_a_shutdown_during_a_render_leaves_it_waiting_and_a_new_worker_renders_it(
    store: RenderStore, cut_talk: CutTalk, start_worker: StartWorker
) -> None:
    project_id, held = cut_talk.project.id, HeldRender()
    store.queue_clips(project_id, ["c01", "c02"])
    worker = start_worker(held)
    wait_until(lambda: held.started == ["c01"])

    worker.stop()
    states_after_the_shutdown = list_states(store, project_id)
    start_worker(finish_at_once)
    wait_until(lambda: set(list_states(store, project_id).values()) == {RenderState.DONE})

    assert states_after_the_shutdown == {"c01": RenderState.WAITING, "c02": RenderState.WAITING}
    assert held.started == ["c01"]


def test_a_render_of_a_project_deleted_in_the_meantime_is_passed_over(
    store: RenderStore,
    cut_the_talk: CutTheTalk,
    start_worker: StartWorker,
    repository: ProjectRepository,
) -> None:
    deleted, kept = cut_the_talk().project.id, cut_the_talk().project.id
    rendered: list[str] = []
    store.queue_clips(deleted, ["c01"])
    store.queue_clips(kept, ["c01"])
    repository.delete(deleted)

    start_worker(lambda render: rendered.append(render.project.id))
    wait_until(lambda: list_states(store, kept) == {"c01": RenderState.DONE})

    assert rendered == [kept]
