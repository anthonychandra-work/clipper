import logging
import time
from collections.abc import Callable

import pytest

from ..conftest import CLOSED_LOCAL_PORT
from ..pipeline import requeue_project
from ..projects import Project, ProjectQueue, ProjectRepository, ProjectStatus, StepKind, StepState
from ..settings import ApiKeyStore, ClaudeModel, PreferenceChanges, PreferenceStore
from ..storage import Database
from .conftest import TEST_KEY, RecordedClaude, StartSelection
from .score_stage import ScoreStage, label_scoring
from .selection_reasons import (
    DECLINED_REPLY,
    MISSING_KEY,
    NO_ANSWER,
    REFUSED_KEY,
    UNREADABLE_REPLY,
)
from .selection_store import SelectionStore

WAIT_SECONDS = 30
STOP_DEADLINE_SECONDS = 2
DONE, PENDING = StepState.DONE, StepState.PENDING


def wait_until(condition: Callable[[], bool]) -> None:
    deadline = time.monotonic() + WAIT_SECONDS
    while not condition():
        assert time.monotonic() < deadline, "The queue did not get there in time."
        time.sleep(0.02)


def wait_for_status(
    repository: ProjectRepository, project_id: str, status: ProjectStatus
) -> Project:
    wait_until(lambda: repository.get(project_id).status is status)
    return repository.get(project_id)


def list_asked_tasks(stand_in: RecordedClaude) -> list[object]:
    return [request.read_task()["task"] for request in stand_in.list_requests()]


@pytest.mark.parametrize(
    ("window_count", "label"),
    [(1, "Scoring 1 window"), (4, "Scoring 4 windows"), (180, "Scoring 180 windows")],
)
def test_the_label_of_the_score_step_gives_the_real_number_of_windows(
    window_count: int, label: str
) -> None:
    assert label_scoring(window_count) == label


def test_the_score_step_alone_rests_transcribed_with_every_window_scored_and_three_shortlisted(
    transcribed_talk: Project,
    start_selection: StartSelection,
    recorded_claude: RecordedClaude,
    key_store: ApiKeyStore,
    repository: ProjectRepository,
    database: Database,
) -> None:
    key_store.save(TEST_KEY)

    start_selection(recorded_claude.at("talk"), [ScoreStage])
    rested = wait_for_status(repository, transcribed_talk.id, ProjectStatus.TRANSCRIBED)

    stored = SelectionStore(database).list_windows(rested.id)
    (request,) = recorded_claude.list_requests()
    assert [step.state for step in rested.steps] == [DONE, DONE, DONE, PENDING]
    assert rested.label_of_kind(StepKind.SCORE) == "Scoring 4 windows"
    assert [(record.window.id, record.score, record.is_shortlisted) for record in stored] == [
        ("w01", 72, True),
        ("w02", 81, True),
        ("w03", 64, True),
        ("w04", 23, False),
    ]
    assert [(record.window.first_sentence, record.window.last_sentence) for record in stored] == [
        (1, 23),
        (17, 38),
        (32, 49),
        (44, 54),
    ]
    assert request.body["model"] == "claude-sonnet-5-5"
    assert request.read_output_config()["effort"] == "medium"


def test_with_no_key_the_score_step_fails_marked_after_no_request_and_retry_with_a_key_finishes_it(
    transcribed_talk: Project,
    start_selection: StartSelection,
    recorded_claude: RecordedClaude,
    key_store: ApiKeyStore,
    repository: ProjectRepository,
    queue: ProjectQueue,
) -> None:
    start_selection(recorded_claude.at("talk"))
    failed = wait_for_status(repository, transcribed_talk.id, ProjectStatus.FAILED)
    sent_without_a_key = recorded_claude.list_requests()

    key_store.save(TEST_KEY)
    requeue_project(failed.id, repository, queue)
    ready = wait_for_status(repository, failed.id, ProjectStatus.READY)

    assert (failed.halt_reason, failed.halt_opens_settings) == (MISSING_KEY, True)
    assert [step.state for step in failed.steps] == [DONE, DONE, PENDING, PENDING]
    assert sent_without_a_key == []
    assert (ready.candidate_count, ready.halt_reason) == (6, None)
    assert [request.has_key for request in recorded_claude.list_requests()] == [True] * 4


def test_unreadable_replies_fail_the_score_step_after_three_requests_and_store_no_window(
    transcribed_talk: Project,
    start_selection: StartSelection,
    recorded_claude: RecordedClaude,
    key_store: ApiKeyStore,
    repository: ProjectRepository,
    database: Database,
) -> None:
    key_store.save(TEST_KEY)

    start_selection(recorded_claude.at("unreadable"))
    failed = wait_for_status(repository, transcribed_talk.id, ProjectStatus.FAILED)

    assert failed.halt_reason == (
        "Claude’s reply could not be read, three times in a row. Retry to run this step again."
    )
    assert (failed.halt_reason, failed.halt_opens_settings) == (UNREADABLE_REPLY, False)
    assert list_asked_tasks(recorded_claude) == ["score"] * 3
    assert SelectionStore(database).list_windows(failed.id) == []
    assert [step.state for step in failed.steps] == [DONE, DONE, PENDING, PENDING]


def test_a_reply_unreadable_once_is_asked_for_again_and_the_project_rests_ready(
    transcribed_talk: Project,
    start_selection: StartSelection,
    recorded_claude: RecordedClaude,
    key_store: ApiKeyStore,
    repository: ProjectRepository,
) -> None:
    key_store.save(TEST_KEY)

    start_selection(recorded_claude.at("unreadable-once+talk"))
    ready = wait_for_status(repository, transcribed_talk.id, ProjectStatus.READY)

    assert list_asked_tasks(recorded_claude) == ["score", "score", "cut", "cut", "cut"]
    assert ready.candidate_count == 6


@pytest.mark.parametrize(
    ("scenario", "sentence"), [("declined", DECLINED_REPLY), ("rejected-key", REFUSED_KEY)]
)
def test_a_declined_reply_and_a_refused_key_fail_the_score_step_marked_for_settings(
    transcribed_talk: Project,
    start_selection: StartSelection,
    recorded_claude: RecordedClaude,
    key_store: ApiKeyStore,
    repository: ProjectRepository,
    scenario: str,
    sentence: str,
) -> None:
    key_store.save(TEST_KEY)

    start_selection(recorded_claude.at(scenario))
    failed = wait_for_status(repository, transcribed_talk.id, ProjectStatus.FAILED)

    assert (failed.halt_reason, failed.halt_opens_settings) == (sentence, True)
    assert list_asked_tasks(recorded_claude) == ["score"]


def test_no_answer_from_the_api_fails_the_score_step_with_its_own_sentence_and_no_mark(
    transcribed_talk: Project,
    start_selection: StartSelection,
    key_store: ApiKeyStore,
    repository: ProjectRepository,
) -> None:
    key_store.save(TEST_KEY)

    start_selection(CLOSED_LOCAL_PORT)
    failed = wait_for_status(repository, transcribed_talk.id, ProjectStatus.FAILED)

    assert failed.halt_reason == (
        "Clipper could not reach Anthropic. Check your connection, then retry."
    )
    assert (failed.halt_reason, failed.halt_opens_settings) == (NO_ANSWER, False)


def test_with_haiku_chosen_for_scoring_the_request_names_it_with_no_effort_and_no_fallback(
    transcribed_talk: Project,
    start_selection: StartSelection,
    recorded_claude: RecordedClaude,
    key_store: ApiKeyStore,
    repository: ProjectRepository,
    database: Database,
) -> None:
    PreferenceStore(database).save(PreferenceChanges(scoring_model=ClaudeModel.HAIKU))
    key_store.save(TEST_KEY)

    start_selection(recorded_claude.at("talk"), [ScoreStage])
    wait_for_status(repository, transcribed_talk.id, ProjectStatus.TRANSCRIBED)

    (request,) = recorded_claude.list_requests()
    assert request.body["model"] == "claude-haiku-4-5"
    assert "effort" not in request.read_output_config()
    assert "fallbacks" not in request.body
    assert (request.path, request.beta) == ("/v1/messages", None)


def test_a_stop_during_the_score_step_ends_it_within_two_seconds_and_resume_finishes_the_project(
    transcribed_talk: Project,
    start_selection: StartSelection,
    recorded_claude: RecordedClaude,
    key_store: ApiKeyStore,
    repository: ProjectRepository,
    queue: ProjectQueue,
) -> None:
    key_store.save(TEST_KEY)
    slow_worker = start_selection(recorded_claude.at("slow/talk"))
    wait_until(lambda: list_asked_tasks(recorded_claude) == ["score"])
    asked_at = time.monotonic()

    slow_worker.stop_project(transcribed_talk.id)
    seconds_to_stop = time.monotonic() - asked_at
    stopped = repository.get(transcribed_talk.id)
    slow_worker.stop()
    start_selection(recorded_claude.at("talk"))
    requeue_project(stopped.id, repository, queue)
    ready = wait_for_status(repository, stopped.id, ProjectStatus.READY)

    assert seconds_to_stop < STOP_DEADLINE_SECONDS
    assert (stopped.status, stopped.halt_opens_settings) == (ProjectStatus.STOPPED, False)
    assert stopped.halt_reason == "Stopped at “Scoring 4 windows”. The stages before it are kept."
    assert [step.state for step in stopped.steps] == [DONE, DONE, PENDING, PENDING]
    assert ready.candidate_count == 6


def test_with_every_logger_at_debug_no_record_of_a_run_that_a_refused_key_fails_holds_the_key(
    transcribed_talk: Project,
    start_selection: StartSelection,
    recorded_claude: RecordedClaude,
    key_store: ApiKeyStore,
    repository: ProjectRepository,
    caplog: pytest.LogCaptureFixture,
) -> None:
    caplog.set_level(logging.DEBUG)
    key_store.save(TEST_KEY)

    start_selection(recorded_claude.at("rejected-key"))
    failed = wait_for_status(repository, transcribed_talk.id, ProjectStatus.FAILED)

    logged = [f"{record.getMessage()} {record.args!r}" for record in caplog.records]
    assert failed.halt_reason == REFUSED_KEY
    assert "A step of project" in caplog.text
    assert not any(TEST_KEY in line for line in logged)
    assert TEST_KEY not in caplog.text
