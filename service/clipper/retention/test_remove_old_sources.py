import pytest

from ..projects import ProjectStatus
from ..rendering import RenderStore
from ..review import ClipPoint, ClipReview, Decision, ReviewStore
from ..review.conftest import CutTheTalk
from ..selection import SelectionStore
from ..settings import PreferenceChanges, SourceRetention
from ..storage import Database
from .conftest import FILES_THAT_STAY, NOW, StoredTalk
from .remove_old_sources import RetentionSources, remove_old_sources


def choose_retention(sources: RetentionSources, retention: SourceRetention) -> None:
    sources.preferences.save(PreferenceChanges(source_retention=retention))


def read_copies(talk: StoredTalk) -> tuple[bool, bool]:
    return talk.has_source(), talk.has_preview()


def test_a_ready_project_imported_eight_days_before_loses_its_source_and_its_preview_at_seven_days(
    stored_talk: StoredTalk, retention_sources: RetentionSources
) -> None:
    stored_talk.import_days_before_now(8)

    remove_old_sources(NOW, retention_sources)

    assert read_copies(stored_talk) == (False, False)
    assert stored_talk.list_files() == sorted(FILES_THAT_STAY)


def test_the_cleanup_keeps_the_candidates_the_reviews_and_the_renders_of_the_project(
    stored_talk: StoredTalk, retention_sources: RetentionSources, database: Database
) -> None:
    project_id = stored_talk.project_id
    kept = ClipReview(ClipPoint(4), ClipPoint(12), Decision.KEEP)
    ReviewStore(database).save_review(project_id, "c01", kept)
    stored_talk.import_days_before_now(8)

    remove_old_sources(NOW, retention_sources)

    project = retention_sources.repository.get(project_id)
    assert stored_talk.has_source() is False
    assert len(SelectionStore(database).list_candidates(project_id)) == 6
    assert ReviewStore(database).list_reviews(project_id) == {"c01": kept}
    assert (project.status, project.candidate_count, project.kept_count) == ("ready", 6, 1)


@pytest.mark.parametrize("days", [0, 6, 7])
def test_a_ready_project_imported_seven_days_before_or_later_keeps_both_at_seven_days(
    stored_talk: StoredTalk, retention_sources: RetentionSources, days: int
) -> None:
    stored_talk.import_days_before_now(days)

    remove_old_sources(NOW, retention_sources)

    assert read_copies(stored_talk) == (True, True)


def test_an_exported_project_is_treated_as_a_ready_one(
    stored_talk: StoredTalk, retention_sources: RetentionSources
) -> None:
    stored_talk.rest(ProjectStatus.EXPORTED)
    stored_talk.import_days_before_now(8)

    remove_old_sources(NOW, retention_sources)

    assert read_copies(stored_talk) == (False, False)
    assert "exports/01-c01.mp4" in stored_talk.list_files()


@pytest.mark.parametrize(
    ("retention", "days", "are_kept"),
    [
        (SourceRetention.THREE_DAYS, 4, False),
        (SourceRetention.THREE_DAYS, 2, True),
        (SourceRetention.THIRTY_DAYS, 29, True),
        (SourceRetention.THIRTY_DAYS, 31, False),
        (SourceRetention.NEVER, 1000, True),
    ],
)
def test_the_retention_chosen_in_settings_decides_at_3_and_30_days_and_never_removes_nothing(
    stored_talk: StoredTalk,
    retention_sources: RetentionSources,
    retention: SourceRetention,
    days: int,
    are_kept: bool,
) -> None:
    choose_retention(retention_sources, retention)
    stored_talk.import_days_before_now(days)

    remove_old_sources(NOW, retention_sources)

    assert read_copies(stored_talk) == (are_kept, are_kept)


@pytest.mark.parametrize(
    "status",
    [
        ProjectStatus.FAILED,
        ProjectStatus.STOPPED,
        ProjectStatus.QUEUED,
        ProjectStatus.PROCESSING,
        ProjectStatus.FETCHED,
        ProjectStatus.TRANSCRIBED,
    ],
)
def test_a_project_that_has_not_reached_its_clips_keeps_its_source_at_any_age(
    stored_talk: StoredTalk, retention_sources: RetentionSources, status: ProjectStatus
) -> None:
    stored_talk.rest(status)
    stored_talk.import_days_before_now(1000)

    remove_old_sources(NOW, retention_sources)

    assert read_copies(stored_talk) == (True, True)


def test_a_project_with_a_clip_waiting_keeps_both_and_loses_them_once_the_render_is_done(
    stored_talk: StoredTalk, retention_sources: RetentionSources, database: Database
) -> None:
    renders = RenderStore(database)
    stored_talk.import_days_before_now(8)
    renders.queue_clips(stored_talk.project_id, ["c01"])

    remove_old_sources(NOW, retention_sources)
    while_waiting = read_copies(stored_talk)
    taken = renders.take_oldest_waiting()
    remove_old_sources(NOW, retention_sources)
    while_rendering = read_copies(stored_talk)
    assert taken is not None
    renders.mark_done(taken)
    remove_old_sources(NOW, retention_sources)

    assert (while_waiting, while_rendering) == ((True, True), (True, True))
    assert read_copies(stored_talk) == (False, False)


def test_a_project_whose_source_is_already_gone_is_passed_over(
    stored_talk: StoredTalk, retention_sources: RetentionSources
) -> None:
    stored_talk.import_days_before_now(8)
    remove_old_sources(NOW, retention_sources)

    remove_old_sources(NOW, retention_sources)

    assert read_copies(stored_talk) == (False, False)
    assert stored_talk.list_files() == sorted(FILES_THAT_STAY)


def test_a_changed_retention_is_followed_at_the_next_pass(
    stored_talk: StoredTalk, retention_sources: RetentionSources
) -> None:
    stored_talk.import_days_before_now(5)
    remove_old_sources(NOW, retention_sources)
    at_seven_days = read_copies(stored_talk)

    choose_retention(retention_sources, SourceRetention.THREE_DAYS)
    remove_old_sources(NOW, retention_sources)

    assert at_seven_days == (True, True)
    assert read_copies(stored_talk) == (False, False)


def test_of_two_projects_only_the_one_past_the_retention_loses_its_source(
    cut_the_talk: CutTheTalk, retention_sources: RetentionSources, database: Database
) -> None:
    data_folder = retention_sources.data_folder
    old = StoredTalk(cut_the_talk().project.id, data_folder, database)
    new = StoredTalk(cut_the_talk().project.id, data_folder, database)
    old.place_files()
    new.place_files()
    old.import_days_before_now(8)
    new.import_days_before_now(1)

    remove_old_sources(NOW, retention_sources)

    assert (read_copies(old), read_copies(new)) == ((False, False), (True, True))
