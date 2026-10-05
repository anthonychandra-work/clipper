import json
import subprocess
import time
from dataclasses import dataclass
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from ..conftest import CLOSED_LOCAL_PORT, SCRIPTS_DIR
from ..main import create_app
from ..projects import Project, ProjectQueue, ProjectResponse, ProjectStatus, StepState
from ..settings import ApiKeyStore, StartupSettings, WhisperModel
from ..storage import BYTES_PER_GB, DataFolder, open_data_folder
from ..transcription import Transcript, read_transcript
from .conftest import TALK_BRIEF, TEST_KEY, KeptRequest, RecordedClaude

WAIT_SECONDS = 90
DONE = StepState.DONE
SELECTION_FIELDS = {"clipSeconds", "windows", "replayPeaks", "candidates"}
WINDOW_FIELDS = {"id", "startSeconds", "endSeconds", "score", "isShortlisted"}
CANDIDATE_FIELDS = {
    "id",
    "rank",
    "startSeconds",
    "endSeconds",
    "scores",
    "total",
    "reason",
    "title",
    "hookTitle",
    "hookType",
    "platforms",
    "flag",
    "flagNote",
    "isReplayPeak",
}
HOOK_TYPES = {"number", "story", "list", "hot-take", "confession", "contrarian", "none"}


@dataclass(frozen=True)
class WholeRun:
    project: ProjectResponse
    selection_json: str
    transcript: Transcript
    requests: list[KeptRequest]


def describe_settings(
    data_folder: DataFolder, key_file: Path, anthropic_source: str
) -> StartupSettings:
    return StartupSettings(
        data_dir=data_folder.root,
        reported_free_bytes=50 * BYTES_PER_GB,
        model_source=CLOSED_LOCAL_PORT,
        key_file=key_file,
        anthropic_source=anthropic_source,
    )


def place_the_test_model(data_folder: DataFolder) -> None:
    fetched = subprocess.run(
        ["node", str(SCRIPTS_DIR / "fetch-test-model.mjs")],
        check=True,
        stdout=subprocess.PIPE,
        text=True,
    )
    data_folder.model_dir(WhisperModel.LARGE_V3_TURBO).symlink_to(Path(fetched.stdout.strip()))


def upload_with_the_brief(client: TestClient, video: Path) -> str:
    content = video.read_bytes()
    draft = {
        "sourceKind": "file",
        "fileName": video.name,
        "fileSizeBytes": len(content),
        "platforms": ["reels"],
        "brief": TALK_BRIEF,
    }
    project_id: str = client.post("/api/projects", json=draft).json()["id"]
    client.put(f"/api/projects/{project_id}/upload", params={"offset": 0}, content=content)
    return project_id


def wait_for_status(client: TestClient, project_id: str, status: ProjectStatus) -> ProjectResponse:
    deadline = time.monotonic() + WAIT_SECONDS
    while True:
        answer = client.get(f"/api/projects/{project_id}").json()
        project = ProjectResponse.model_validate(answer)
        if project.status is status:
            return project
        assert time.monotonic() < deadline, f"The project did not become {status}: {project}"
        time.sleep(0.05)


@pytest.fixture(scope="module")
def whole_run(
    tmp_path_factory: pytest.TempPathFactory, talk_video: Path, recorded_claude_address: str
) -> WholeRun:
    run_dir = tmp_path_factory.mktemp("whole-app")
    data_folder = open_data_folder(run_dir / "data")
    place_the_test_model(data_folder)
    stand_in = RecordedClaude(recorded_claude_address)
    stand_in.forget_requests()
    key_file = run_dir / "keys" / "anthropic-api-key"
    with TestClient(
        create_app(describe_settings(data_folder, key_file, stand_in.at("talk")))
    ) as client:
        client.put("/api/settings/api-key", json={"apiKey": TEST_KEY})
        project_id = upload_with_the_brief(client, talk_video)
        ready = wait_for_status(client, project_id, ProjectStatus.READY)
        selection_json = client.get(f"/api/projects/{project_id}/selection").text
    transcript = read_transcript(data_folder.project_dir(project_id))
    return WholeRun(ready, selection_json, transcript, stand_in.list_requests())


def test_an_uploaded_talk_goes_through_the_whole_app_and_rests_ready_with_six_candidates(
    whole_run: WholeRun,
) -> None:
    ready = whole_run.project

    assert ready.status is ProjectStatus.READY
    assert (ready.candidate_count, ready.percent, ready.halt) == (6, 100, None)
    assert [step.state for step in ready.steps] == [DONE] * 4
    assert [step.label for step in ready.steps] == [
        "Preparing video",
        "Transcribing on this Mac",
        "Scoring 4 windows",
        "Cutting clips",
    ]


def test_the_selection_of_the_run_gives_its_limits_its_windows_and_no_peak(
    whole_run: WholeRun,
) -> None:
    selection = json.loads(whole_run.selection_json)

    assert set(selection) == SELECTION_FIELDS
    assert selection["clipSeconds"] == {"min": 25, "max": 60}
    assert [set(window) for window in selection["windows"]] == [WINDOW_FIELDS] * 4
    assert [window["id"] for window in selection["windows"]] == ["w01", "w02", "w03", "w04"]
    assert [window["isShortlisted"] for window in selection["windows"]] == [True, True, True, False]
    assert selection["replayPeaks"] == []


def test_every_candidate_of_the_run_has_every_field_of_the_selection(whole_run: WholeRun) -> None:
    candidates = json.loads(whole_run.selection_json)["candidates"]

    assert [set(candidate) for candidate in candidates] == [CANDIDATE_FIELDS] * 6
    assert [candidate["rank"] for candidate in candidates] == [1, 2, 3, 4, 5, 6]
    assert [candidate["total"] for candidate in candidates] == [88, 84, 82, 82, 75, 55]
    assert [sum(candidate["scores"].values()) for candidate in candidates] == [
        88,
        84,
        82,
        82,
        75,
        55,
    ]
    assert {candidate["hookType"] for candidate in candidates} <= HOOK_TYPES
    assert [set(candidate["platforms"]) for candidate in candidates] == [
        {"tiktok", "reels", "shorts"}
    ] * 6
    assert all(
        text["title"] and text["description"]
        for candidate in candidates
        for text in candidate["platforms"].values()
    )
    assert [candidate["flag"] for candidate in candidates] == [
        None,
        None,
        None,
        "needs-context",
        None,
        "not-recommended",
    ]


def test_the_words_transcribed_in_the_run_are_the_words_of_the_committed_transcript(
    whole_run: WholeRun, talk_transcript: Transcript
) -> None:
    transcribed = [word.text for word in whole_run.transcript.words]

    assert transcribed == [word.text for word in talk_transcript.words]
    assert whole_run.transcript.language == talk_transcript.language


def test_the_requests_of_the_run_went_to_the_address_of_the_settings_with_the_saved_key(
    whole_run: WholeRun,
) -> None:
    tasks = [request.read_task() for request in whole_run.requests]

    assert [task["task"] for task in tasks] == ["score", "cut", "cut", "cut"]
    assert [request.scenario for request in whole_run.requests] == ["talk"] * 4
    assert [request.has_key for request in whole_run.requests] == [True] * 4
    assert [task["brief"] for task in tasks] == [TALK_BRIEF] * 4
    assert [request.body["model"] for request in whole_run.requests] == [
        "claude-sonnet-5-5",
        "claude-opus-5-5",
        "claude-opus-5-5",
        "claude-opus-5-5",
    ]


def test_a_project_that_rested_transcribed_under_an_earlier_version_is_scored_and_cut_at_the_start(
    transcribed_talk: Project,
    queue: ProjectQueue,
    data_folder: DataFolder,
    key_file: Path,
    key_store: ApiKeyStore,
    recorded_claude: RecordedClaude,
) -> None:
    queue.take_oldest_queued()
    queue.rest(transcribed_talk.id, ProjectStatus.TRANSCRIBED)
    key_store.save(TEST_KEY)
    settings = describe_settings(data_folder, key_file, recorded_claude.at("talk"))

    with TestClient(create_app(settings)) as client:
        ready = wait_for_status(client, transcribed_talk.id, ProjectStatus.READY)

    tasks = [request.read_task()["task"] for request in recorded_claude.list_requests()]
    assert ready.candidate_count == 6
    assert [step.state for step in ready.steps] == [DONE] * 4
    assert tasks == ["score", "cut", "cut", "cut"]


def test_with_no_key_saved_a_transcribed_project_fails_marked_and_the_stand_in_hears_nothing(
    transcribed_talk: Project,
    data_folder: DataFolder,
    key_file: Path,
    recorded_claude: RecordedClaude,
) -> None:
    settings = describe_settings(data_folder, key_file, recorded_claude.at("talk"))

    with TestClient(create_app(settings)) as client:
        failed = wait_for_status(client, transcribed_talk.id, ProjectStatus.FAILED)

    assert failed.halt is not None
    assert (failed.halt.reason, failed.halt.opens_settings) == (
        "No Anthropic API key is saved. Add one in Settings, then retry.",
        True,
    )
    assert recorded_claude.list_requests() == []
