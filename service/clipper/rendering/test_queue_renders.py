import pytest

from ..review import ChangeRefusedError, ClipPoint, ClipReview, Decision, ReviewSources
from ..review.conftest import CutTalk
from ..storage import Database
from .describe_export import ExportSources
from .queue_renders import SourceDeletedError, cancel_renders, queue_kept_clips, queue_one_clip
from .render_records import RenderState
from .render_store import RenderStore

SOURCE_DELETED = "The source video was deleted to free space. New clips cannot be rendered."
REFUSED = "Clipper could not make this change. Reload the page and try again."
KEPT_SENTENCES = {"c01": (4, 12), "c02": (23, 30), "c04": (31, 40)}


@pytest.fixture
def export_sources(sources: ReviewSources, database: Database) -> ExportSources:
    return ExportSources(sources, RenderStore(database))


def keep(cut: CutTalk, sources: ExportSources, *clip_ids: str) -> None:
    for clip_id in clip_ids:
        first, last = KEPT_SENTENCES[clip_id]
        kept = ClipReview(ClipPoint(first), ClipPoint(last), Decision.KEEP)
        sources.review.reviews.save_review(cut.project.id, clip_id, kept)


def list_queue(cut: CutTalk, sources: ExportSources) -> list[tuple[str, RenderState]]:
    renders = sources.renders.list_renders(cut.project.id).values()
    in_order = sorted(renders, key=lambda render: render.queue_place)
    return [(render.clip_id, render.state) for render in in_order]


def test_the_kept_clips_are_queued_in_the_order_of_their_ranks(
    talk_with_source: CutTalk, export_sources: ExportSources
) -> None:
    keep(talk_with_source, export_sources, "c04", "c01", "c02")

    queue_kept_clips(talk_with_source.project, export_sources)

    assert list_queue(talk_with_source, export_sources) == [
        ("c01", RenderState.WAITING),
        ("c02", RenderState.WAITING),
        ("c04", RenderState.WAITING),
    ]


def test_queueing_again_leaves_a_rendering_clip_where_it_is_and_adds_a_newly_kept_one(
    talk_with_source: CutTalk, export_sources: ExportSources
) -> None:
    keep(talk_with_source, export_sources, "c02")
    queue_kept_clips(talk_with_source.project, export_sources)
    export_sources.renders.take_oldest_waiting()
    keep(talk_with_source, export_sources, "c01")

    queue_kept_clips(talk_with_source.project, export_sources)

    assert list_queue(talk_with_source, export_sources) == [
        ("c02", RenderState.RENDERING),
        ("c01", RenderState.WAITING),
    ]


def test_one_kept_clip_is_queued_alone(
    talk_with_source: CutTalk, export_sources: ExportSources
) -> None:
    keep(talk_with_source, export_sources, "c01", "c02")

    queue_one_clip(talk_with_source.project, "c02", export_sources)

    assert list_queue(talk_with_source, export_sources) == [("c02", RenderState.WAITING)]


def test_a_project_with_no_kept_clip_queues_nothing(
    talk_with_source: CutTalk, export_sources: ExportSources
) -> None:
    queue_kept_clips(talk_with_source.project, export_sources)

    assert list_queue(talk_with_source, export_sources) == []


def test_queueing_with_the_source_gone_is_refused_and_stores_nothing(
    cut_talk: CutTalk, export_sources: ExportSources
) -> None:
    keep(cut_talk, export_sources, "c01")

    with pytest.raises(SourceDeletedError) as refused_all:
        queue_kept_clips(cut_talk.project, export_sources)
    with pytest.raises(SourceDeletedError) as refused_one:
        queue_one_clip(cut_talk.project, "c01", export_sources)

    assert (refused_all.value.status_code, refused_all.value.message) == (409, SOURCE_DELETED)
    assert (refused_one.value.status_code, refused_one.value.message) == (409, SOURCE_DELETED)
    assert list_queue(cut_talk, export_sources) == []


@pytest.mark.parametrize("clip_id", ["c03", "c99"])
def test_queueing_a_clip_that_is_not_kept_or_not_a_clip_is_refused(
    clip_id: str, talk_with_source: CutTalk, export_sources: ExportSources
) -> None:
    keep(talk_with_source, export_sources, "c01")

    with pytest.raises(ChangeRefusedError) as refused:
        queue_one_clip(talk_with_source.project, clip_id, export_sources)

    assert (refused.value.status_code, refused.value.message) == (422, REFUSED)
    assert list_queue(talk_with_source, export_sources) == []


def test_a_cancel_takes_the_waiting_clips_out_before_it_asks_for_the_running_render_to_stop(
    talk_with_source: CutTalk, export_sources: ExportSources
) -> None:
    keep(talk_with_source, export_sources, "c01", "c02", "c04")
    queue_kept_clips(talk_with_source.project, export_sources)
    export_sources.renders.take_oldest_waiting()
    queue_when_asked: list[object] = []

    def record_stop(project_id: str) -> None:
        queue_when_asked.extend([project_id, list_queue(talk_with_source, export_sources)])

    cancel_renders(talk_with_source.project, export_sources, record_stop)

    assert queue_when_asked == [talk_with_source.project.id, [("c01", RenderState.RENDERING)]]
