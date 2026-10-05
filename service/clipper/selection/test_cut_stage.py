import logging
import shutil
import threading
import time
from collections.abc import Callable

import pytest

from ..pipeline import QueueWorker, requeue_project
from ..projects import Project, ProjectQueue, ProjectRepository, ProjectStatus, StepKind, StepState
from ..settings import (
    ApiKeyStore,
    ClaudeModel,
    ClipsPerVideo,
    PreferenceChanges,
    PreferenceStore,
)
from ..storage import Database, DataFolder
from ..transcription import Transcript
from .ask_claude import ClaudeAccess
from .conftest import (
    TALK_BRIEF,
    TALK_REPLAY_GRAPH_FILE,
    TALK_SECONDS,
    TEST_KEY,
    RecordedClaude,
    StartSelection,
)
from .cut_stage import cut_each_window
from .prepare_pass import PreparedPass
from .score_stage import ScoreStage
from .selection_reasons import NO_CANDIDATE, UNREADABLE_REPLY
from .selection_records import Candidate, ClipFlag, ReplayPeak
from .selection_store import SelectionStore
from .selection_task import ClipSeconds, PassContext
from .split_sentences import split_sentences
from .split_windows import split_windows
from .transcript_part import write_transcript_part

WAIT_SECONDS = 30
STOP_DEADLINE_SECONDS = 2
DONE, PENDING = StepState.DONE, StepState.PENDING
SELECTION_TABLES = ("selection_windows", "replay_peaks", "candidates")
SIX_PARTS_BEST_FIRST = [
    ("c01", 1, 11.94, 44.7, 88),
    ("c02", 2, 86.54, 119.72, 84),
    ("c03", 3, 45.22, 86.54, 82),
    ("c04", 4, 120.16, 161.46, 82),
    ("c05", 5, 161.8, 192.96, 75),
    ("c06", 6, 193.4, 222.92, 55),
]
ALL_FOUR_REQUESTS = ["score", "cut w01", "cut w02", "cut w03"]


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


def name_requests(stand_in: RecordedClaude) -> list[str]:
    return [name_task(request.read_task()) for request in stand_in.list_requests()]


def name_task(task: dict[str, object]) -> str:
    window = task.get("window")
    return f"cut {window['id']}" if isinstance(window, dict) else str(task["task"])


def describe_ranks(candidates: list[Candidate]) -> list[tuple[str, int, float, float, int]]:
    return [(c.id, c.rank, c.start_seconds, c.end_seconds, c.total) for c in candidates]


def stop_and_time(worker: QueueWorker, project_id: str) -> float:
    asked_at = time.monotonic()
    worker.stop_project(project_id)
    return time.monotonic() - asked_at


def test_the_talk_rests_ready_after_one_score_request_and_three_cut_requests_with_six_candidates(
    transcribed_talk: Project,
    start_selection: StartSelection,
    recorded_claude: RecordedClaude,
    key_store: ApiKeyStore,
    repository: ProjectRepository,
    database: Database,
) -> None:
    key_store.save(TEST_KEY)

    start_selection(recorded_claude.at("talk"))
    ready = wait_for_status(repository, transcribed_talk.id, ProjectStatus.READY)

    store = SelectionStore(database)
    candidates = store.list_candidates(ready.id)
    assert name_requests(recorded_claude) == ALL_FOUR_REQUESTS
    assert describe_ranks(candidates) == SIX_PARTS_BEST_FIRST
    assert [candidate.is_replay_peak for candidate in candidates] == [False] * 6
    assert ready.candidate_count == 6
    assert ready.label_of_kind(StepKind.SCORE) == "Scoring 4 windows"
    assert store.list_peaks(ready.id) == []
    assert ([step.state for step in ready.steps], ready.percent()) == ([DONE] * 4, 100)
    assert (ready.halt_reason, ready.halt_opens_settings) == (None, False)


def test_the_candidates_of_the_talk_keep_the_flags_and_the_texts_of_the_recorded_replies(
    transcribed_talk: Project,
    start_selection: StartSelection,
    recorded_claude: RecordedClaude,
    key_store: ApiKeyStore,
    repository: ProjectRepository,
    database: Database,
) -> None:
    key_store.save(TEST_KEY)

    start_selection(recorded_claude.at("talk"))
    ready = wait_for_status(repository, transcribed_talk.id, ProjectStatus.READY)

    candidates = SelectionStore(database).list_candidates(ready.id)
    best = candidates[0]
    assert [candidate.flag for candidate in candidates] == [
        None,
        None,
        None,
        ClipFlag.NEEDS_CONTEXT,
        None,
        ClipFlag.NOT_RECOMMENDED,
    ]
    assert (best.title, best.hook_type) == ("The worst day my bakery ever had", "story")
    assert best.scores.total == 88
    assert best.platforms.shorts.title and best.platforms.reels.description


def test_the_cut_requests_name_the_cutting_model_with_high_effort_and_the_score_request_does_not(
    transcribed_talk: Project,
    start_selection: StartSelection,
    recorded_claude: RecordedClaude,
    key_store: ApiKeyStore,
    repository: ProjectRepository,
    database: Database,
) -> None:
    PreferenceStore(database).save(PreferenceChanges(cutting_model=ClaudeModel.FABLE))
    key_store.save(TEST_KEY)

    start_selection(recorded_claude.at("talk"))
    wait_for_status(repository, transcribed_talk.id, ProjectStatus.READY)

    requests = recorded_claude.list_requests()
    assert [request.body["model"] for request in requests] == [
        "claude-sonnet-5-5",
        "claude-fable-5-1",
        "claude-fable-5-1",
        "claude-fable-5-1",
    ]
    assert [request.read_output_config()["effort"] for request in requests] == [
        "medium",
        "high",
        "high",
        "high",
    ]


def test_with_the_recorded_graph_in_its_folder_the_peak_is_stored_and_the_clip_under_it_is_marked(
    transcribed_talk: Project,
    start_selection: StartSelection,
    recorded_claude: RecordedClaude,
    key_store: ApiKeyStore,
    repository: ProjectRepository,
    database: Database,
    data_folder: DataFolder,
) -> None:
    shutil.copy(TALK_REPLAY_GRAPH_FILE, data_folder.replay_graph_file(transcribed_talk.id))
    key_store.save(TEST_KEY)

    start_selection(recorded_claude.at("talk"))
    ready = wait_for_status(repository, transcribed_talk.id, ProjectStatus.READY)

    store = SelectionStore(database)
    candidates = store.list_candidates(ready.id)
    assert store.list_peaks(ready.id) == [ReplayPeak(131.992, 150.848)]
    assert [(c.rank, c.start_seconds, c.total, c.is_replay_peak) for c in candidates] == [
        (1, 11.94, 88, False),
        (2, 86.54, 84, False),
        (3, 120.16, 82, True),
        (4, 45.22, 82, False),
        (5, 161.8, 75, False),
        (6, 193.4, 55, False),
    ]


def test_unreadable_cuts_fail_the_cut_step_with_the_windows_stored_and_retry_sends_cuts_only(
    transcribed_talk: Project,
    start_selection: StartSelection,
    recorded_claude: RecordedClaude,
    key_store: ApiKeyStore,
    repository: ProjectRepository,
    queue: ProjectQueue,
    database: Database,
) -> None:
    key_store.save(TEST_KEY)
    failing_worker = start_selection(recorded_claude.at("unreadable-cuts+talk"))
    failed = wait_for_status(repository, transcribed_talk.id, ProjectStatus.FAILED)
    sent_before_the_retry = name_requests(recorded_claude)
    stored_at_the_failure = SelectionStore(database).list_windows(failed.id)
    failing_worker.stop()
    recorded_claude.forget_requests()

    start_selection(recorded_claude.at("talk"))
    requeue_project(failed.id, repository, queue)
    ready = wait_for_status(repository, failed.id, ProjectStatus.READY)

    assert (failed.halt_reason, failed.halt_opens_settings) == (UNREADABLE_REPLY, False)
    assert [step.state for step in failed.steps] == [DONE, DONE, DONE, PENDING]
    assert sent_before_the_retry == ["score", "cut w01", "cut w01", "cut w01"]
    assert [record.window.id for record in stored_at_the_failure] == ["w01", "w02", "w03", "w04"]
    assert name_requests(recorded_claude) == ["cut w01", "cut w02", "cut w03"]
    assert (ready.candidate_count, failed.candidate_count) == (6, 0)


def test_cuts_that_leave_no_candidate_fail_the_cut_step_with_their_sentence_and_store_none(
    transcribed_talk: Project,
    start_selection: StartSelection,
    recorded_claude: RecordedClaude,
    key_store: ApiKeyStore,
    repository: ProjectRepository,
    database: Database,
) -> None:
    key_store.save(TEST_KEY)

    start_selection(recorded_claude.at("no-clips+talk"))
    failed = wait_for_status(repository, transcribed_talk.id, ProjectStatus.FAILED)

    assert failed.halt_reason == (
        "No clip of the chosen length was found in this video. Retry to look again."
    )
    assert (failed.halt_reason, failed.halt_opens_settings) == (NO_CANDIDATE, False)
    assert name_requests(recorded_claude) == ALL_FOUR_REQUESTS
    assert [step.state for step in failed.steps] == [DONE, DONE, DONE, PENDING]
    assert SelectionStore(database).list_candidates(failed.id) == []
    assert failed.candidate_count == 0


def test_the_brief_the_clip_length_and_the_language_are_in_every_request(
    transcribed_talk: Project,
    start_selection: StartSelection,
    recorded_claude: RecordedClaude,
    key_store: ApiKeyStore,
    repository: ProjectRepository,
) -> None:
    key_store.save(TEST_KEY)

    start_selection(recorded_claude.at("talk"))
    wait_for_status(repository, transcribed_talk.id, ProjectStatus.READY)

    tasks = [request.read_task() for request in recorded_claude.list_requests()]
    assert [task["brief"] for task in tasks] == [TALK_BRIEF] * 4
    assert [task["clipSeconds"] for task in tasks] == [{"min": 25, "max": 60}] * 4
    assert [task["language"] for task in tasks] == ["en"] * 4
    assert [task["clipCount"] for task in tasks[1:]] == [2, 2, 2]


def test_a_fixed_target_of_4_asks_for_four_clips_and_keeps_the_best_four(
    transcribed_talk: Project,
    start_selection: StartSelection,
    recorded_claude: RecordedClaude,
    key_store: ApiKeyStore,
    repository: ProjectRepository,
    database: Database,
) -> None:
    PreferenceStore(database).save(PreferenceChanges(clips_per_video=ClipsPerVideo.FOUR))
    key_store.save(TEST_KEY)

    start_selection(recorded_claude.at("talk"))
    ready = wait_for_status(repository, transcribed_talk.id, ProjectStatus.READY)

    candidates = SelectionStore(database).list_candidates(ready.id)
    tasks = [request.read_task() for request in recorded_claude.list_requests()]
    assert describe_ranks(candidates) == SIX_PARTS_BEST_FIRST[:4]
    assert ready.candidate_count == 4
    assert [task["clipCount"] for task in tasks[1:]] == [4, 4, 4]


def test_a_percent_is_reported_after_each_window_is_cut_and_the_clip_with_an_absent_quote_is_lost(
    recorded_claude: RecordedClaude, talk_transcript: Transcript
) -> None:
    sentences = split_sentences(talk_transcript.words)
    context = PassContext(
        access=ClaudeAccess(key=TEST_KEY, address=recorded_claude.at("talk")),
        model=ClaudeModel.OPUS,
        transcript_part=write_transcript_part(sentences),
        clip_seconds=ClipSeconds(min=25, max=60),
        language="en",
        brief="",
        stop=threading.Event(),
    )
    reported: list[float] = []

    placed = cut_each_window(
        split_windows(sentences)[:3],
        2,
        PreparedPass(sentences, context, TALK_SECONDS),
        reported.append,
    )

    assert [round(percent) for percent in reported] == [33, 67, 100]
    assert len(placed) == 8
    assert "The secret to pricing bread is simple." not in [
        clip.proposal.opening_words for clip in placed
    ]


def test_a_stop_during_the_cut_step_ends_it_within_two_seconds_and_resume_finishes_the_project(
    transcribed_talk: Project,
    start_selection: StartSelection,
    recorded_claude: RecordedClaude,
    key_store: ApiKeyStore,
    repository: ProjectRepository,
    queue: ProjectQueue,
) -> None:
    key_store.save(TEST_KEY)
    scoring_worker = start_selection(recorded_claude.at("talk"), [ScoreStage])
    wait_for_status(repository, transcribed_talk.id, ProjectStatus.TRANSCRIBED)
    scoring_worker.stop()
    slow_worker = start_selection(recorded_claude.at("slow/talk"))
    queue.requeue(transcribed_talk.id)
    wait_until(lambda: name_requests(recorded_claude) == ["score", "cut w01"])

    seconds_to_stop = stop_and_time(slow_worker, transcribed_talk.id)
    stopped = repository.get(transcribed_talk.id)
    slow_worker.stop()
    start_selection(recorded_claude.at("talk"))
    requeue_project(stopped.id, repository, queue)
    ready = wait_for_status(repository, stopped.id, ProjectStatus.READY)

    assert seconds_to_stop < STOP_DEADLINE_SECONDS
    assert stopped.status is ProjectStatus.STOPPED
    assert stopped.halt_reason == "Stopped at “Cutting clips”. The stages before it are kept."
    assert [step.state for step in stopped.steps] == [DONE, DONE, DONE, PENDING]
    assert name_requests(recorded_claude) == ["score", "cut w01", *ALL_FOUR_REQUESTS[1:]]
    assert ready.candidate_count == 6


def count_selection_rows(database: Database) -> dict[str, int]:
    with database.transaction() as connection:
        return {
            table: connection.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
            for table in SELECTION_TABLES
        }


def test_deleting_a_ready_project_leaves_no_window_no_peak_and_no_candidate(
    transcribed_talk: Project,
    start_selection: StartSelection,
    recorded_claude: RecordedClaude,
    key_store: ApiKeyStore,
    repository: ProjectRepository,
    database: Database,
    data_folder: DataFolder,
) -> None:
    shutil.copy(TALK_REPLAY_GRAPH_FILE, data_folder.replay_graph_file(transcribed_talk.id))
    key_store.save(TEST_KEY)
    start_selection(recorded_claude.at("talk"))
    ready = wait_for_status(repository, transcribed_talk.id, ProjectStatus.READY)
    stored = count_selection_rows(database)

    repository.delete(ready.id)

    assert stored == {"selection_windows": 4, "replay_peaks": 1, "candidates": 6}
    assert count_selection_rows(database) == dict.fromkeys(SELECTION_TABLES, 0)


def test_with_every_logger_at_debug_no_record_of_a_whole_run_of_the_two_steps_holds_the_key(
    transcribed_talk: Project,
    start_selection: StartSelection,
    recorded_claude: RecordedClaude,
    key_store: ApiKeyStore,
    repository: ProjectRepository,
    caplog: pytest.LogCaptureFixture,
) -> None:
    caplog.set_level(logging.DEBUG)
    key_store.save(TEST_KEY)

    start_selection(recorded_claude.at("talk"))
    wait_for_status(repository, transcribed_talk.id, ProjectStatus.READY)

    logged = [f"{record.getMessage()} {record.args!r}" for record in caplog.records]
    assert any("claude-sonnet-5-5" in line for line in logged)
    assert any("claude-opus-5-5" in line for line in logged)
    assert [line for line in logged if TEST_KEY in line] == []
    assert TEST_KEY not in caplog.text
