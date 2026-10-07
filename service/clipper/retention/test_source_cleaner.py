import threading
import time
from collections.abc import Callable
from dataclasses import replace

import pytest
from fastapi.testclient import TestClient

from ..main import create_app
from ..settings import PreferenceChanges, SourceRetention, StartupSettings
from .conftest import NOW, StoredTalk
from .remove_old_sources import SECONDS_PER_DAY, RetentionSources
from .source_cleaner import CLEANER_THREAD, SourceCleaner, run_clock_ahead

SHORT_INTERVAL_SECONDS = 0.02
WAIT_SECONDS = 5
REVIEW_AND_EXPORT = ("review", "export")

type Json = dict[str, object]


class ClockOfTheTest:
    def __init__(self, now_seconds: float) -> None:
        self.now_seconds = now_seconds

    def __call__(self) -> float:
        return self.now_seconds


def count_cleaner_threads() -> int:
    return sum(1 for thread in threading.enumerate() if thread.name == CLEANER_THREAD)


def wait_until(condition: Callable[[], bool]) -> None:
    deadline = time.monotonic() + WAIT_SECONDS
    while not condition():
        assert time.monotonic() < deadline, "The cleaner did not get there in time."
        time.sleep(0.01)


def ask_the_started_tool(talk: StoredTalk, clock_ahead_days: int) -> list[Json]:
    settings = StartupSettings(data_dir=talk.data_folder.root, clock_ahead_days=clock_ahead_days)
    with TestClient(create_app(settings)) as client:
        address = f"/api/projects/{talk.project_id}"
        return [client.get(f"{address}/{tab}").json() for tab in REVIEW_AND_EXPORT]


def test_the_clock_runs_ahead_of_the_mac_by_the_days_named() -> None:
    on_time, eight_days_ahead = run_clock_ahead(0), run_clock_ahead(8)

    assert on_time() == pytest.approx(time.time(), abs=2)
    assert eight_days_ahead() - on_time() == pytest.approx(8 * SECONDS_PER_DAY, abs=2)


def test_starting_the_cleaner_runs_one_pass_before_it_returns(
    stored_talk: StoredTalk, retention_sources: RetentionSources
) -> None:
    stored_talk.import_days_before_now(8)
    cleaner = SourceCleaner(retention_sources, ClockOfTheTest(NOW))

    cleaner.start()
    is_gone_at_once = not stored_talk.has_source()
    cleaner.stop()

    assert is_gone_at_once
    assert stored_talk.has_preview() is False


def test_the_cleaner_runs_a_pass_at_each_interval_by_the_clock_it_reads(
    stored_talk: StoredTalk, retention_sources: RetentionSources
) -> None:
    stored_talk.import_days_before_now(8)
    clock = ClockOfTheTest(NOW - 2 * SECONDS_PER_DAY)
    cleaner = SourceCleaner(retention_sources, clock, SHORT_INTERVAL_SECONDS)

    cleaner.start()
    time.sleep(5 * SHORT_INTERVAL_SECONDS)
    is_kept_at_six_days = stored_talk.has_source()
    clock.now_seconds = NOW
    wait_until(lambda: not stored_talk.has_source())
    cleaner.stop()

    assert is_kept_at_six_days
    assert stored_talk.has_preview() is False


def test_a_retention_changed_while_the_cleaner_runs_is_followed_at_the_next_pass(
    stored_talk: StoredTalk, retention_sources: RetentionSources
) -> None:
    stored_talk.import_days_before_now(5)
    cleaner = SourceCleaner(retention_sources, ClockOfTheTest(NOW), SHORT_INTERVAL_SECONDS)

    cleaner.start()
    is_kept_at_seven_days = stored_talk.has_source()
    retention_sources.preferences.save(
        PreferenceChanges(source_retention=SourceRetention.THREE_DAYS)
    )
    wait_until(lambda: not stored_talk.has_source())
    cleaner.stop()

    assert is_kept_at_seven_days


def test_stopping_the_cleaner_ends_its_thread_and_its_passes(
    stored_talk: StoredTalk, retention_sources: RetentionSources
) -> None:
    clock = ClockOfTheTest(NOW - 2 * SECONDS_PER_DAY)
    stored_talk.import_days_before_now(8)
    cleaner = SourceCleaner(retention_sources, clock, SHORT_INTERVAL_SECONDS)
    before = count_cleaner_threads()

    cleaner.start()
    while_running = count_cleaner_threads()
    cleaner.stop()
    clock.now_seconds = NOW
    time.sleep(5 * SHORT_INTERVAL_SECONDS)

    assert (before, while_running, count_cleaner_threads()) == (0, 1, 0)
    assert stored_talk.has_source() is True


def test_a_pass_that_cannot_remove_a_file_is_logged_and_the_next_pass_still_runs(
    stored_talk: StoredTalk,
    retention_sources: RetentionSources,
    caplog: pytest.LogCaptureFixture,
) -> None:
    answers = iter([OSError("The disk does not answer.")])

    def ask_once_in_vain(project_id: str) -> bool:
        for failure in answers:
            raise failure
        return retention_sources.has_queued_clip(project_id)

    stored_talk.import_days_before_now(8)
    flaky = replace(retention_sources, has_queued_clip=ask_once_in_vain)
    cleaner = SourceCleaner(flaky, ClockOfTheTest(NOW), SHORT_INTERVAL_SECONDS)

    cleaner.start()
    is_kept_by_the_failed_pass = stored_talk.has_source()
    wait_until(lambda: not stored_talk.has_source())
    cleaner.stop()

    assert is_kept_by_the_failed_pass
    assert "The sources of old projects could not be removed." in caplog.text


def test_a_tool_started_with_its_clock_eight_days_ahead_answers_with_the_source_gone(
    stored_talk: StoredTalk,
) -> None:
    review, export = ask_the_started_tool(stored_talk, clock_ahead_days=8)

    assert (review["hasPreview"], export["hasSource"]) == (False, False)
    assert (stored_talk.has_source(), stored_talk.has_preview()) == (False, False)
    assert isinstance(review["clips"], list) and len(review["clips"]) == 6
    assert "exports/01-c01.mp4" in stored_talk.list_files()


@pytest.mark.parametrize("clock_ahead_days", [0, 6])
def test_a_tool_started_with_no_variable_or_six_days_ahead_keeps_the_source_and_the_preview(
    stored_talk: StoredTalk, clock_ahead_days: int
) -> None:
    review, export = ask_the_started_tool(stored_talk, clock_ahead_days)

    assert (review["hasPreview"], export["hasSource"]) == (True, True)
    assert (stored_talk.has_source(), stored_talk.has_preview()) == (True, True)
