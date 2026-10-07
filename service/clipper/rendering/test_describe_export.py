import pytest

from ..projects import ProjectRepository
from ..review import ClipPoint, ClipReview, Decision, Framing, Look, ReviewSources
from ..review.conftest import TEXTS, CutTalk
from ..storage import Database
from .describe_export import ExportSources, describe_export
from .render_records import QueuedRender
from .render_store import RenderStore

EXPORT_FIELDS = {"look", "hasSource", "platforms", "clips"}
CLIP_FIELDS = {"id", "rank", "title", "seconds", "file", "render", "download", "texts"}
NOT_RENDERED = {"state": "none", "percent": 0.0, "reason": None}
DISK_FULL = "Not enough free disk space to finish. Free some space, then retry."
ALL_PLATFORMS = '["shorts", "tiktok", "reels"]'

type Json = dict[str, object]


@pytest.fixture
def export_sources(sources: ReviewSources, database: Database) -> ExportSources:
    return ExportSources(sources, RenderStore(database))


class TalkExport:
    def __init__(self, cut: CutTalk, sources: ExportSources, repository: ProjectRepository) -> None:
        self.project_id = cut.project.id
        self.sources = sources
        self._repository = repository

    def keep(self, clip_id: str, first_sentence: int, last_sentence: int) -> None:
        kept = ClipReview(ClipPoint(first_sentence), ClipPoint(last_sentence), Decision.KEEP)
        self.sources.review.reviews.save_review(self.project_id, clip_id, kept)

    def describe(self) -> Json:
        project = self._repository.get(self.project_id)
        return describe_export(project, self.sources).model_dump(mode="json", by_alias=True)

    def describe_clips(self) -> list[Json]:
        clips = self.describe()["clips"]
        assert isinstance(clips, list)
        return clips

    def take_next(self) -> QueuedRender:
        taken = self.sources.renders.take_oldest_waiting()
        assert taken is not None
        return taken

    def write_export(self, rank: int, clip_id: str) -> None:
        export = self.sources.review.data_folder.export_file(self.project_id, rank, clip_id)
        export.parent.mkdir(exist_ok=True)
        export.write_bytes(b"a finished clip")


@pytest.fixture
def talk(
    cut_talk: CutTalk, export_sources: ExportSources, repository: ProjectRepository
) -> TalkExport:
    return TalkExport(cut_talk, export_sources, repository)


def test_the_export_gives_every_part_under_its_name(talk: TalkExport) -> None:
    talk.keep("c01", 4, 12)

    export = talk.describe()

    assert set(export) == EXPORT_FIELDS
    assert export["look"] == {
        "captionStyle": "keyword",
        "framing": "follow-speaker",
        "showHookTitle": True,
    }
    assert (export["hasSource"], export["platforms"]) == (False, ["reels"])
    assert talk.describe_clips() == [
        {
            "id": "c01",
            "rank": 1,
            "title": "The worst day my bakery ever had",
            "seconds": 32.76,
            "file": "exports/01-c01.mp4",
            "render": NOT_RENDERED,
            "download": None,
            "texts": [
                {
                    "platform": "reels",
                    "title": TEXTS.reels.title,
                    "description": TEXTS.reels.description,
                }
            ],
        }
    ]


def test_only_the_kept_clips_are_given_in_the_order_of_their_ranks(talk: TalkExport) -> None:
    talk.keep("c05", 41, 47)
    talk.keep("c02", 23, 30)
    rejected = ClipReview(ClipPoint(13), ClipPoint(22), Decision.REJECT)
    talk.sources.review.reviews.save_review(talk.project_id, "c03", rejected)

    clips = talk.describe_clips()

    assert [set(clip) for clip in clips] == [CLIP_FIELDS, CLIP_FIELDS]
    assert [(clip["id"], clip["rank"], clip["file"]) for clip in clips] == [
        ("c02", 2, "exports/02-c02.mp4"),
        ("c05", 5, "exports/05-c05.mp4"),
    ]


def test_the_texts_are_those_of_the_platforms_chosen_in_the_order_tiktok_reels_shorts(
    talk: TalkExport, database: Database
) -> None:
    talk.keep("c01", 4, 12)
    with database.transaction() as connection:
        connection.execute("UPDATE projects SET platforms = ?", [ALL_PLATFORMS])

    export = talk.describe()

    assert export["platforms"] == ["tiktok", "reels", "shorts"]
    assert talk.describe_clips()[0]["texts"] == [
        {"platform": "tiktok", "title": "The oven broke", "description": TEXTS.tiktok.description},
        {"platform": "reels", "title": "Nobody left angry", "description": TEXTS.reels.description},
        {
            "platform": "shorts",
            "title": "The worst day my bakery had",
            "description": "Tell them the truth.",
        },
    ]


def test_a_clip_is_given_with_the_title_and_the_length_it_stands_with(talk: TalkExport) -> None:
    moved = ClipReview(ClipPoint(5, nudge=-2), ClipPoint(8), Decision.KEEP, title="Mine / theirs")
    talk.sources.review.reviews.save_review(talk.project_id, "c01", moved)

    (clip,) = talk.describe_clips()

    assert (clip["title"], clip["seconds"]) == ("Mine / theirs", pytest.approx(30.84 - 16.3 + 0.4))


def test_the_look_is_the_project_s_without_the_safe_zones(talk: TalkExport) -> None:
    look = Look(framing=Framing.WHOLE_FRAME, show_hook_title=False, show_safe_zones=True)
    talk.sources.review.reviews.save_look(talk.project_id, look)

    assert talk.describe()["look"] == {
        "captionStyle": "keyword",
        "framing": "whole-frame",
        "showHookTitle": False,
    }


def test_a_project_with_its_source_on_the_mac_says_so(talk: TalkExport) -> None:
    project_dir = talk.sources.review.data_folder.project_dir(talk.project_id)
    (project_dir / "source.mp4").write_bytes(b"video")

    assert talk.describe()["hasSource"] is True


def test_a_waiting_and_a_rendering_clip_are_given_with_their_state_and_percent(
    talk: TalkExport,
) -> None:
    talk.keep("c01", 4, 12)
    talk.keep("c02", 23, 30)
    talk.sources.renders.queue_clips(talk.project_id, ["c01", "c02"])
    talk.sources.renders.raise_percent(talk.take_next(), 41.26)

    rendering, waiting = talk.describe_clips()

    assert rendering["render"] == {"state": "rendering", "percent": 41.3, "reason": None}
    assert waiting["render"] == {"state": "waiting", "percent": 0.0, "reason": None}
    assert (rendering["download"], waiting["download"]) == (None, None)


def test_a_failed_clip_is_given_with_its_reason(talk: TalkExport) -> None:
    talk.keep("c01", 4, 12)
    talk.sources.renders.queue_clips(talk.project_id, ["c01"])
    talk.sources.renders.mark_failed(talk.take_next(), DISK_FULL)

    (failed,) = talk.describe_clips()

    assert failed["render"] == {"state": "failed", "percent": 0.0, "reason": DISK_FULL}
    assert failed["download"] is None


def test_a_done_clip_is_given_with_the_address_of_its_finished_file(talk: TalkExport) -> None:
    talk.keep("c02", 23, 30)
    talk.sources.renders.queue_clips(talk.project_id, ["c02"])
    talk.sources.renders.mark_done(talk.take_next())
    talk.write_export(2, "c02")

    (done,) = talk.describe_clips()

    assert done["render"] == {"state": "done", "percent": 100.0, "reason": None}
    assert done["download"] == f"/api/projects/{talk.project_id}/clips/c02/export"


def test_a_done_clip_whose_file_is_missing_is_given_as_no_render(talk: TalkExport) -> None:
    talk.keep("c02", 23, 30)
    talk.sources.renders.queue_clips(talk.project_id, ["c02"])
    talk.sources.renders.mark_done(talk.take_next())

    (lost,) = talk.describe_clips()

    assert (lost["render"], lost["download"]) == (NOT_RENDERED, None)


def test_a_clip_rendered_again_keeps_the_address_of_its_earlier_file_while_it_waits(
    talk: TalkExport,
) -> None:
    talk.keep("c02", 23, 30)
    talk.sources.renders.queue_clips(talk.project_id, ["c02"])
    talk.sources.renders.mark_done(talk.take_next())
    talk.write_export(2, "c02")
    talk.sources.renders.queue_clips(talk.project_id, ["c02"])

    (again,) = talk.describe_clips()

    assert again["render"] == {"state": "waiting", "percent": 0.0, "reason": None}
    assert again["download"] == f"/api/projects/{talk.project_id}/clips/c02/export"


def test_a_file_on_the_mac_without_a_render_is_no_finished_export(talk: TalkExport) -> None:
    talk.keep("c01", 4, 12)
    talk.write_export(1, "c01")

    (clip,) = talk.describe_clips()

    assert (clip["render"], clip["download"]) == (NOT_RENDERED, None)


def test_a_project_with_no_kept_clip_answers_with_no_clips(talk: TalkExport) -> None:
    export = talk.describe()

    assert (export["clips"], export["platforms"]) == ([], ["reels"])


def test_a_project_with_no_transcript_answers_with_no_clips_and_its_look(talk: TalkExport) -> None:
    data_folder = talk.sources.review.data_folder
    (data_folder.project_dir(talk.project_id) / "transcript.json").unlink()
    talk.sources.review.reviews.save_look(talk.project_id, Look(framing=Framing.STACK_TWO))

    export = talk.describe()

    assert export["clips"] == []
    assert export["look"] == {
        "captionStyle": "keyword",
        "framing": "stack-two",
        "showHookTitle": True,
    }
