import sqlite3
from dataclasses import replace

import pytest

from ..learning import ClipKey, HistoryStore, Outcome
from ..projects import ProjectRepository
from ..review.conftest import CutTalk, CutTheTalk
from ..storage import Database
from .results_store import ResultsStore


@pytest.fixture
def store(database: Database) -> ResultsStore:
    return ResultsStore(database)


@pytest.fixture
def history(database: Database) -> HistoryStore:
    return HistoryStore(database)


def post(project_id: str, clip_id: str, views: int) -> Outcome:
    return Outcome(ClipKey(project_id, clip_id), views, hook_type="story", seconds=32.76)


def test_a_project_with_nothing_stored_has_no_views_and_counts_none(
    store: ResultsStore, cut_talk: CutTalk, repository: ProjectRepository
) -> None:
    assert store.list_views(cut_talk.project.id) == {}
    assert repository.get(cut_talk.project.id).logged_count == 0


def test_stored_views_are_given_back_under_their_clips_and_the_project_counts_them(
    store: ResultsStore, cut_talk: CutTalk, repository: ProjectRepository
) -> None:
    project_id = cut_talk.project.id

    store.save_views(post(project_id, "c01", 1200))
    store.save_views(post(project_id, "c03", 48000))

    assert store.list_views(project_id) == {"c01": 1200, "c03": 48000}
    assert repository.get(project_id).logged_count == 2


def test_storing_views_records_the_outcome_with_the_hook_type_and_the_length_given(
    store: ResultsStore, cut_talk: CutTalk, history: HistoryStore
) -> None:
    posted = Outcome(ClipKey(cut_talk.project.id, "c02"), 5400, "contrarian", 33.18)

    store.save_views(posted)

    assert history.list_outcomes() == [posted]


def test_views_stored_twice_leave_one_outcome_with_the_later_number_and_one_counted_clip(
    store: ResultsStore, cut_talk: CutTalk, repository: ProjectRepository, history: HistoryStore
) -> None:
    project_id = cut_talk.project.id
    first = post(project_id, "c01", 1200)
    store.save_views(first)

    store.save_views(replace(first, views=90000, seconds=30.5))

    assert store.list_views(project_id) == {"c01": 90000}
    assert repository.get(project_id).logged_count == 1
    assert history.list_outcomes() == [replace(first, views=90000, seconds=30.5)]


def test_cleared_views_are_gone_the_count_falls_and_the_outcome_leaves_the_history(
    store: ResultsStore, cut_talk: CutTalk, repository: ProjectRepository, history: HistoryStore
) -> None:
    project_id = cut_talk.project.id
    store.save_views(post(project_id, "c01", 1200))
    store.save_views(post(project_id, "c02", 5400))

    store.clear_views(ClipKey(project_id, "c01"))

    assert store.list_views(project_id) == {"c02": 5400}
    assert repository.get(project_id).logged_count == 1
    assert history.list_outcomes() == [post(project_id, "c02", 5400)]


def test_clearing_views_that_were_never_stored_changes_nothing(
    store: ResultsStore, cut_talk: CutTalk, repository: ProjectRepository
) -> None:
    store.save_views(post(cut_talk.project.id, "c02", 5400))

    store.clear_views(ClipKey(cut_talk.project.id, "c01"))

    assert store.list_views(cut_talk.project.id) == {"c02": 5400}
    assert repository.get(cut_talk.project.id).logged_count == 1


def test_each_project_holds_and_counts_its_own_views(
    store: ResultsStore, cut_the_talk: CutTheTalk, repository: ProjectRepository
) -> None:
    first, second = cut_the_talk().project, cut_the_talk().project

    store.save_views(post(first.id, "c01", 1200))
    store.save_views(post(second.id, "c01", 300))
    store.save_views(post(second.id, "c02", 700))

    assert store.list_views(first.id) == {"c01": 1200}
    assert (repository.get(first.id).logged_count, repository.get(second.id).logged_count) == (1, 2)


def test_views_of_a_clip_that_is_no_candidate_are_not_stored_and_record_no_outcome(
    store: ResultsStore, cut_talk: CutTalk, history: HistoryStore
) -> None:
    with pytest.raises(sqlite3.IntegrityError):
        store.save_views(post(cut_talk.project.id, "c07", 1200))

    assert store.list_views(cut_talk.project.id) == {}
    assert history.list_outcomes() == []


def test_deleting_the_project_removes_its_views_and_leaves_its_outcomes(
    store: ResultsStore, cut_talk: CutTalk, repository: ProjectRepository, history: HistoryStore
) -> None:
    project_id = cut_talk.project.id
    store.save_views(post(project_id, "c01", 1200))

    repository.delete(project_id)

    assert store.list_views(project_id) == {}
    assert history.list_outcomes() == [post(project_id, "c01", 1200)]
