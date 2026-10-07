from dataclasses import replace

import pytest

from ..learning import ClipKey, HistoryStore, Outcome
from ..rendering.conftest import ExportedTalk, keep_part
from ..review import ChangeRefusedError, ClipAddress, ClipPoint, Decision, RejectReason
from ..storage import Database
from .describe_results import ResultsSources, describe_results
from .log_views import log_views

type Json = dict[str, object]


class TalkResults:
    def __init__(self, talk: ExportedTalk, sources: ResultsSources) -> None:
        self._talk = talk
        self._sources = sources

    def describe(self) -> list[Json]:
        results = describe_results(self._talk.read_project(), self._sources)
        clips: list[Json] = results.model_dump(mode="json", by_alias=True)["clips"]
        return clips

    def log(self, clip_id: str, views: int | None) -> None:
        log_views(ClipAddress(self._talk.read_project(), clip_id), views, self._sources)

    def read_views(self) -> dict[object, object]:
        return {clip["id"]: clip["views"] for clip in self.describe()}


@pytest.fixture
def results(three_exported: ExportedTalk, results_sources: ResultsSources) -> TalkResults:
    return TalkResults(three_exported, results_sources)


@pytest.fixture
def history(database: Database) -> HistoryStore:
    return HistoryStore(database)


def test_the_results_give_each_exported_clip_with_every_field_under_its_name(
    results: TalkResults,
) -> None:
    assert results.describe() == [
        {"id": "c01", "rank": 1, "title": "The worst day my bakery ever had", "views": None},
        {"id": "c02", "rank": 2, "title": "Hire for the habits you cannot teach", "views": None},
        {"id": "c03", "rank": 3, "title": "Almost everyone gets price wrong", "views": None},
    ]


def test_only_the_clips_with_a_finished_file_are_listed_by_rank_a_rejected_one_among_them(
    results: TalkResults, three_exported: ExportedTalk
) -> None:
    rejected = replace(
        keep_part("c02"), decision=Decision.REJECT, reject_reason=RejectReason.REPEAT
    )
    three_exported.store("c05", keep_part("c05"))
    three_exported.sources.renders.queue_clips(three_exported.project_id, ["c05"])

    three_exported.store("c02", rejected)

    assert [(clip["id"], clip["rank"]) for clip in results.describe()] == [
        ("c01", 1),
        ("c02", 2),
        ("c03", 3),
    ]


def test_a_title_edited_on_the_review_tab_is_the_title_given(
    results: TalkResults, three_exported: ExportedTalk
) -> None:
    three_exported.store("c01", replace(keep_part("c01"), title="The morning the oven broke"))

    assert results.describe()[0]["title"] == "The morning the oven broke"


def test_stored_views_are_given_back_and_the_project_counts_them(
    results: TalkResults, three_exported: ExportedTalk
) -> None:
    results.log("c01", 1200)
    results.log("c03", 48000)

    assert results.read_views() == {"c01": 1200, "c02": None, "c03": 48000}
    assert three_exported.read_project().logged_count == 2


def test_the_outcome_of_stored_views_holds_the_hook_type_and_the_length_of_the_clip(
    results: TalkResults, three_exported: ExportedTalk, history: HistoryStore
) -> None:
    results.log("c03", 48000)

    assert history.list_outcomes() == [
        Outcome(ClipKey(three_exported.project_id, "c03"), 48000, "hot-take", 41.32)
    ]


def test_the_outcome_holds_the_length_of_a_clip_whose_point_was_moved(
    results: TalkResults, three_exported: ExportedTalk, history: HistoryStore
) -> None:
    three_exported.store("c01", replace(keep_part("c01"), end=ClipPoint(8)))

    results.log("c01", 1200)

    (outcome,) = history.list_outcomes()
    assert (outcome.hook_type, outcome.views) == ("story", 1200)
    assert outcome.seconds == pytest.approx(30.84 - 11.94)


def test_views_stored_twice_leave_one_outcome_with_the_later_number(
    results: TalkResults, history: HistoryStore
) -> None:
    results.log("c02", 5400)

    results.log("c02", 6100)

    assert results.read_views()["c02"] == 6100
    assert [(outcome.views, outcome.hook_type) for outcome in history.list_outcomes()] == [
        (6100, "contrarian")
    ]


def test_cleared_views_are_gone_the_count_falls_and_the_outcome_leaves_the_history(
    results: TalkResults, three_exported: ExportedTalk, history: HistoryStore
) -> None:
    results.log("c01", 1200)
    results.log("c02", 5400)

    results.log("c01", None)

    assert results.read_views() == {"c01": None, "c02": 5400, "c03": None}
    assert three_exported.read_project().logged_count == 1
    assert [outcome.clip.clip_id for outcome in history.list_outcomes()] == ["c02"]


@pytest.mark.parametrize("clip_id", ["c04", "c05", "c07"])
def test_views_for_a_clip_without_a_finished_file_and_for_an_unknown_clip_are_refused(
    results: TalkResults, three_exported: ExportedTalk, history: HistoryStore, clip_id: str
) -> None:
    three_exported.store("c05", keep_part("c05"))

    with pytest.raises(ChangeRefusedError):
        results.log(clip_id, 1200)

    assert set(results.read_views().values()) == {None}
    assert (three_exported.read_project().logged_count, history.list_outcomes()) == (0, [])


def test_a_project_with_no_candidates_answers_with_no_clips(
    results: TalkResults, three_exported: ExportedTalk
) -> None:
    selection = three_exported.sources.review.selection

    selection.replace_candidates(three_exported.project_id, [], [])

    assert results.describe() == []


def test_a_project_with_no_transcript_and_no_export_answers_with_no_clips(
    exported_talk: ExportedTalk, results_sources: ResultsSources
) -> None:
    data_folder = exported_talk.sources.review.data_folder
    (data_folder.project_dir(exported_talk.project_id) / "transcript.json").unlink()

    assert TalkResults(exported_talk, results_sources).describe() == []
