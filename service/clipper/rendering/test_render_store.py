import pytest

from ..projects import ProjectRepository, ProjectStatus
from ..review.conftest import CutTalk, CutTheTalk
from ..storage import Database
from .render_records import QueuedRender, Render, RenderState
from .render_store import RenderStore


@pytest.fixture
def store(database: Database) -> RenderStore:
    return RenderStore(database)


def finish(store: RenderStore, project_id: str, clip_id: str) -> None:
    store.queue_clips(project_id, [clip_id])
    taken = store.take_oldest_waiting()
    assert taken == QueuedRender(project_id, clip_id)
    store.mark_done(taken)


def list_states(store: RenderStore, project_id: str) -> dict[str, RenderState]:
    return {clip_id: render.state for clip_id, render in store.list_renders(project_id).items()}


def set_status(database: Database, project_id: str, status: ProjectStatus) -> None:
    with database.transaction() as connection:
        connection.execute("UPDATE projects SET status = ? WHERE id = ?", [status, project_id])


def test_queued_clips_are_read_back_waiting_in_the_order_given(
    store: RenderStore, cut_talk: CutTalk
) -> None:
    store.queue_clips(cut_talk.project.id, ["c02", "c01"])

    assert store.list_renders(cut_talk.project.id) == {
        "c02": Render("c02", RenderState.WAITING, 0.0, None, queue_place=1, has_export=False),
        "c01": Render("c01", RenderState.WAITING, 0.0, None, queue_place=2, has_export=False),
    }


def test_a_project_with_nothing_queued_has_no_render(store: RenderStore, cut_talk: CutTalk) -> None:
    assert store.list_renders(cut_talk.project.id) == {}
    assert store.take_oldest_waiting() is None


def test_the_oldest_waiting_render_is_taken_first_across_two_projects(
    store: RenderStore, cut_the_talk: CutTheTalk
) -> None:
    first, second = cut_the_talk().project.id, cut_the_talk().project.id
    store.queue_clips(second, ["c03"])
    store.queue_clips(first, ["c01", "c02"])
    store.queue_clips(second, ["c04"])

    taken = [store.take_oldest_waiting() for _ in range(5)]

    assert taken == [
        QueuedRender(second, "c03"),
        QueuedRender(first, "c01"),
        QueuedRender(first, "c02"),
        QueuedRender(second, "c04"),
        None,
    ]
    assert set(list_states(store, first).values()) == {RenderState.RENDERING}


def test_a_clip_queued_twice_is_in_the_queue_once_and_stays_where_it_is(
    store: RenderStore, cut_talk: CutTalk
) -> None:
    project_id = cut_talk.project.id
    store.queue_clips(project_id, ["c01", "c02"])
    rendering = store.take_oldest_waiting()

    store.queue_clips(project_id, ["c02", "c01", "c03"])

    renders = store.list_renders(project_id)
    assert rendering == QueuedRender(project_id, "c01")
    assert {clip_id: render.queue_place for clip_id, render in renders.items()} == {
        "c01": 1,
        "c02": 2,
        "c03": 3,
    }
    assert list_states(store, project_id) == {
        "c01": RenderState.RENDERING,
        "c02": RenderState.WAITING,
        "c03": RenderState.WAITING,
    }


def test_the_percent_of_a_rendering_clip_only_rises(store: RenderStore, cut_talk: CutTalk) -> None:
    project_id = cut_talk.project.id
    store.queue_clips(project_id, ["c01", "c02"])
    taken = store.take_oldest_waiting()
    assert taken is not None

    store.raise_percent(taken, 40.0)
    store.raise_percent(taken, 25.0)
    store.raise_percent(QueuedRender(project_id, "c02"), 60.0)

    renders = store.list_renders(project_id)
    assert (renders["c01"].percent, renders["c02"].percent) == (40.0, 0.0)


def test_done_notes_the_export_counts_it_and_makes_a_ready_project_exported(
    store: RenderStore, cut_talk: CutTalk, repository: ProjectRepository
) -> None:
    project_id = cut_talk.project.id

    finish(store, project_id, "c01")

    project = repository.get(project_id)
    assert store.list_renders(project_id) == {
        "c01": Render("c01", RenderState.DONE, 100.0, None, queue_place=1, has_export=True)
    }
    assert (project.status, project.exported_count) == (ProjectStatus.EXPORTED, 1)


def test_a_second_done_of_the_same_clip_leaves_the_count_and_another_clip_raises_it(
    store: RenderStore, cut_talk: CutTalk, repository: ProjectRepository
) -> None:
    project_id = cut_talk.project.id
    finish(store, project_id, "c01")

    finish(store, project_id, "c01")
    counted_once = repository.get(project_id).exported_count
    finish(store, project_id, "c02")

    assert (counted_once, repository.get(project_id).exported_count) == (1, 2)
    assert repository.get(project_id).status is ProjectStatus.EXPORTED


def test_a_project_that_is_not_ready_keeps_its_status_when_a_clip_is_done(
    store: RenderStore, cut_talk: CutTalk, repository: ProjectRepository, database: Database
) -> None:
    project_id = cut_talk.project.id
    set_status(database, project_id, ProjectStatus.FAILED)

    finish(store, project_id, "c01")

    project = repository.get(project_id)
    assert (project.status, project.exported_count) == (ProjectStatus.FAILED, 1)


def test_a_failed_render_keeps_its_reason_until_the_clip_is_queued_again_at_the_end(
    store: RenderStore, cut_talk: CutTalk
) -> None:
    project_id = cut_talk.project.id
    store.queue_clips(project_id, ["c01", "c02"])
    taken = store.take_oldest_waiting()
    assert taken is not None
    store.raise_percent(taken, 40.0)

    store.mark_failed(taken, "This clip could not be rendered. Retry to render it again.")
    failed = store.list_renders(project_id)["c01"]
    store.queue_clips(project_id, ["c01"])

    assert (failed.state, failed.percent, failed.has_export) == (RenderState.FAILED, 0.0, False)
    assert failed.reason == "This clip could not be rendered. Retry to render it again."
    assert store.list_renders(project_id)["c01"] == Render(
        "c01", RenderState.WAITING, 0.0, None, queue_place=3, has_export=False
    )
    assert store.take_oldest_waiting() == QueuedRender(project_id, "c02")


def test_cancelling_removes_a_waiting_render_without_an_export_and_returns_one_with_it_to_done(
    store: RenderStore, cut_talk: CutTalk, repository: ProjectRepository
) -> None:
    project_id = cut_talk.project.id
    finish(store, project_id, "c01")
    finish(store, project_id, "c02")
    store.queue_clips(project_id, ["c03"])
    failing = store.take_oldest_waiting()
    assert failing is not None
    store.mark_failed(failing, "Not enough free disk space to finish. Free some space, then retry.")
    store.queue_clips(project_id, ["c02", "c04"])

    store.cancel_waiting(project_id)

    renders = store.list_renders(project_id)
    assert list_states(store, project_id) == {
        "c01": RenderState.DONE,
        "c02": RenderState.DONE,
        "c03": RenderState.FAILED,
    }
    assert (renders["c02"].percent, renders["c02"].has_export) == (100.0, True)
    assert repository.get(project_id).exported_count == 2


def test_cancelling_one_project_leaves_the_rendering_clip_and_the_other_project_alone(
    store: RenderStore, cut_the_talk: CutTheTalk
) -> None:
    cancelled, other = cut_the_talk().project.id, cut_the_talk().project.id
    store.queue_clips(cancelled, ["c01", "c02"])
    store.queue_clips(other, ["c01"])
    store.take_oldest_waiting()

    store.cancel_waiting(cancelled)

    assert list_states(store, cancelled) == {"c01": RenderState.RENDERING}
    assert list_states(store, other) == {"c01": RenderState.WAITING}


def test_a_clip_taken_out_leaves_the_queue_and_goes_back_to_its_export_when_it_has_one(
    store: RenderStore, cut_talk: CutTalk
) -> None:
    project_id = cut_talk.project.id
    finish(store, project_id, "c01")
    store.queue_clips(project_id, ["c01", "c02", "c03"])
    again = store.take_oldest_waiting()
    assert again == QueuedRender(project_id, "c01")
    store.raise_percent(again, 55.0)

    store.take_out(again)
    store.take_out(QueuedRender(project_id, "c02"))

    assert store.list_renders(project_id) == {
        "c01": Render("c01", RenderState.DONE, 100.0, None, queue_place=2, has_export=True),
        "c03": Render("c03", RenderState.WAITING, 0.0, None, queue_place=4, has_export=False),
    }


def test_a_render_put_back_after_a_restart_is_taken_before_a_later_one(
    store: RenderStore, cut_talk: CutTalk
) -> None:
    project_id = cut_talk.project.id
    store.queue_clips(project_id, ["c01", "c02"])
    interrupted = store.take_oldest_waiting()
    assert interrupted is not None
    store.raise_percent(interrupted, 70.0)

    store.put_back_interrupted()

    assert store.list_renders(project_id)["c01"] == Render(
        "c01", RenderState.WAITING, 0.0, None, queue_place=1, has_export=False
    )
    assert store.take_oldest_waiting() == QueuedRender(project_id, "c01")
    assert store.take_oldest_waiting() == QueuedRender(project_id, "c02")


def test_deleting_the_project_leaves_no_render(
    store: RenderStore, cut_the_talk: CutTheTalk, repository: ProjectRepository
) -> None:
    deleted, kept = cut_the_talk().project.id, cut_the_talk().project.id
    finish(store, deleted, "c01")
    store.queue_clips(deleted, ["c02"])
    store.queue_clips(kept, ["c01"])

    repository.delete(deleted)

    assert store.list_renders(deleted) == {}
    assert store.take_oldest_waiting() == QueuedRender(kept, "c01")


def test_a_project_has_a_queued_clip_while_one_waits_or_renders_and_none_once_it_is_done(
    store: RenderStore, cut_the_talk: CutTheTalk
) -> None:
    busy, idle = cut_the_talk().project.id, cut_the_talk().project.id
    answers = [store.has_queued_clip(busy)]

    store.queue_clips(busy, ["c01"])
    answers.append(store.has_queued_clip(busy))
    taken = store.take_oldest_waiting()
    answers.append(store.has_queued_clip(busy))
    assert taken is not None
    store.mark_done(taken)
    answers.append(store.has_queued_clip(busy))

    assert answers == [False, True, True, False]
    assert store.has_queued_clip(idle) is False


def test_a_project_whose_render_failed_or_was_cancelled_has_no_queued_clip(
    store: RenderStore, cut_talk: CutTalk
) -> None:
    project_id = cut_talk.project.id
    store.queue_clips(project_id, ["c01", "c02"])
    taken = store.take_oldest_waiting()
    assert taken is not None

    store.mark_failed(taken, "This clip could not be rendered.")
    store.cancel_waiting(project_id)

    assert store.has_queued_clip(project_id) is False
