import logging
import stat
from collections.abc import Sequence
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from ..learning import (
    LAST_DECISIONS,
    ClipKey,
    HistoryStore,
    Outcome,
    PastDecision,
    record_decision,
    record_outcome,
)
from ..main import create_app
from ..storage import BYTES_PER_GB, Database, open_database
from .describe_machine import find_network_address
from .startup_settings import StartupSettings

DEFAULT_CHOICES = {
    "scoringModel": "claude-sonnet-5-5",
    "cuttingModel": "claude-opus-5-5",
    "whisperModel": "large-v3-turbo",
    "defaultLength": "standard",
    "clipsPerVideo": "auto",
    "sourceRetention": "7",
}
MACHINE_FACTS = {"freeDiskGb", "totalDiskGb", "phoneAddress", "hasApiKey", "apiKeyEnding"}
EVERY_FIELD = {*DEFAULT_CHOICES, *MACHINE_FACTS, "rejections"}
TEST_KEY = "sk-ant-test-4f2a"
KEY_ADDRESS = "/api/settings/api-key"
HISTORY_ADDRESS = "/api/settings/history"
NO_REJECTIONS = {"cutOff": 0, "notInteresting": 0, "needsContext": 0, "repeat": 0}
REASONS_GIVEN = ("cut-off", "repeat", None, "repeat", "needs-context", "repeat")
REJECTIONS_OF_THE_REASONS_GIVEN = {
    "cutOff": 1,
    "notInteresting": 0,
    "needsContext": 1,
    "repeat": 3,
}
CHANGED_CHOICES = {
    "scoringModel": "claude-haiku-4-5",
    "cuttingModel": "claude-fable-5-1",
    "whisperModel": "small",
    "defaultLength": "long",
    "clipsPerVideo": "12",
    "sourceRetention": "never",
}
UNREADABLE_CHANGE = "Clipper could not read this change to Settings. Reload the page and try again."


@pytest.fixture
def key_file(tmp_path: Path) -> Path:
    return tmp_path / "Clipper" / "anthropic-api-key"


@pytest.fixture
def client(tmp_path: Path, key_file: Path) -> TestClient:
    return start_client(tmp_path, key_file)


def start_client(tmp_path: Path, key_file: Path) -> TestClient:
    startup = StartupSettings(
        data_dir=tmp_path / "data",
        reported_free_bytes=29 * BYTES_PER_GB,
        web_port=3100,
        key_file=key_file,
    )
    return TestClient(create_app(startup))


def open_the_tool_database(tmp_path: Path) -> Database:
    return open_database(tmp_path / "data" / "clipper.sqlite3")


def record_rejections(tmp_path: Path, reasons: Sequence[str | None]) -> None:
    with open_the_tool_database(tmp_path).transaction() as connection:
        for number, reason in enumerate(reasons, start=1):
            clip = ClipKey("a1b2c3", f"c{number:02d}")
            record_decision(connection, PastDecision(clip, is_rejection=True, reject_reason=reason))
            record_outcome(connection, Outcome(clip, views=number, hook_type="story", seconds=30))


def test_settings_start_at_the_defaults(client: TestClient) -> None:
    settings = client.get("/api/settings").json()

    assert {name: settings[name] for name in DEFAULT_CHOICES} == DEFAULT_CHOICES


def test_settings_carry_the_disk_space_and_the_phone_address(client: TestClient) -> None:
    settings = client.get("/api/settings").json()

    assert settings["freeDiskGb"] == 29.0
    assert settings["totalDiskGb"] > 29
    assert settings["phoneAddress"] == f"http://{find_network_address()}:3100"
    assert set(settings) == EVERY_FIELD


@pytest.mark.parametrize(
    ("name", "value"),
    [
        ("scoringModel", "claude-haiku-4-5"),
        ("cuttingModel", "claude-fable-5-1"),
        ("whisperModel", "small"),
        ("defaultLength", "long"),
        ("clipsPerVideo", "12"),
        ("sourceRetention", "never"),
    ],
)
def test_one_choice_is_stored_and_returned_with_the_rest(
    client: TestClient, name: str, value: str
) -> None:
    changed = client.patch("/api/settings", json={name: value})

    assert changed.status_code == 200
    assert changed.json()[name] == value
    assert client.get("/api/settings").json() == changed.json()
    assert {**DEFAULT_CHOICES, name: value}.items() <= changed.json().items()


@pytest.mark.parametrize(
    "change",
    [
        {"scoringModel": "gpt-4"},
        {"whisperModel": "large"},
        {"defaultLength": "90"},
        {"clipsPerVideo": "5"},
        {"sourceRetention": "14"},
        {"apiKey": TEST_KEY},
    ],
)
def test_a_value_outside_the_options_is_refused_and_nothing_changes(
    client: TestClient, change: dict[str, str]
) -> None:
    refused = client.patch("/api/settings", json=change)

    assert refused.status_code == 422
    assert refused.json() == {"problem": {"section": None, "message": UNREADABLE_CHANGE}}
    assert DEFAULT_CHOICES.items() <= client.get("/api/settings").json().items()


def test_a_refused_change_of_the_choices_does_not_repeat_what_was_sent(
    client: TestClient, key_file: Path
) -> None:
    refused = client.patch("/api/settings", json={"apiKey": TEST_KEY, "scoringModel": "gpt-4"})

    assert refused.status_code == 422
    assert TEST_KEY not in refused.text
    assert "gpt-4" not in refused.text
    assert not key_file.exists()


def test_with_no_key_saved_settings_say_so(client: TestClient) -> None:
    settings = client.get("/api/settings").json()

    assert (settings["hasApiKey"], settings["apiKeyEnding"]) == (False, None)


def test_a_saved_key_is_in_its_file_and_only_its_ending_is_in_an_answer(
    client: TestClient, key_file: Path
) -> None:
    saved = client.put(KEY_ADDRESS, json={"apiKey": TEST_KEY})
    read_again = client.get("/api/settings")

    assert saved.status_code == 200
    assert (saved.json()["hasApiKey"], saved.json()["apiKeyEnding"]) == (True, "4f2a")
    assert saved.json() == read_again.json()
    assert set(saved.json()) == EVERY_FIELD
    assert key_file.read_text() == TEST_KEY
    assert stat.S_IMODE(key_file.stat().st_mode) == 0o600
    assert TEST_KEY not in saved.text + read_again.text
    assert TEST_KEY not in str(saved.headers) + str(read_again.headers)


def test_removing_the_key_deletes_its_file(client: TestClient, key_file: Path) -> None:
    client.put(KEY_ADDRESS, json={"apiKey": TEST_KEY})

    removed = client.delete(KEY_ADDRESS)

    assert removed.status_code == 200
    assert (removed.json()["hasApiKey"], removed.json()["apiKeyEnding"]) == (False, None)
    assert removed.json() == client.get("/api/settings").json()
    assert not key_file.exists()


def test_a_key_saved_by_one_app_is_read_by_the_next_one_started_on_the_same_file(
    client: TestClient, tmp_path: Path, key_file: Path
) -> None:
    client.put(KEY_ADDRESS, json={"apiKey": TEST_KEY})

    restarted = start_client(tmp_path, key_file).get("/api/settings").json()

    assert (restarted["hasApiKey"], restarted["apiKeyEnding"]) == (True, "4f2a")


@pytest.mark.parametrize(
    ("sent", "sentence"),
    [
        ("", "Paste the key first."),
        ("  ", "Paste the key first."),
        ("sk-ant test-4f2a", "An API key has no spaces or line breaks. Paste it again."),
        ("sk-ant-test\n-4f2a", "An API key has no spaces or line breaks. Paste it again."),
    ],
)
def test_an_unusable_key_is_refused_in_the_problem_form_without_repeating_it(
    client: TestClient, key_file: Path, sent: str, sentence: str
) -> None:
    refused = client.put(KEY_ADDRESS, json={"apiKey": sent})

    assert refused.status_code == 422
    assert refused.json() == {"problem": {"section": None, "message": sentence}}
    assert "4f2a" not in refused.text
    assert not key_file.exists()
    assert client.get("/api/settings").json()["hasApiKey"] is False


@pytest.mark.parametrize(
    "body",
    [
        f'{{"apiKey": ["{TEST_KEY}"]}}',
        f'{{"key": "{TEST_KEY}"}}',
        f'{{"apiKey": "{TEST_KEY}", "note": "{TEST_KEY}"}}',
        f'"{TEST_KEY}"',
        f'{{"apiKey": "{TEST_KEY}',
    ],
)
def test_a_body_of_the_wrong_shape_is_refused_without_repeating_it(
    client: TestClient, key_file: Path, body: str
) -> None:
    refused = client.put(KEY_ADDRESS, content=body, headers={"Content-Type": "application/json"})

    assert refused.status_code == 422
    assert refused.json() == {"problem": {"section": None, "message": UNREADABLE_CHANGE}}
    assert TEST_KEY not in refused.text
    assert not key_file.exists()


def test_with_every_logger_at_debug_no_record_holds_a_saved_or_a_refused_key(
    client: TestClient, caplog: pytest.LogCaptureFixture
) -> None:
    caplog.set_level(logging.DEBUG)

    client.put(KEY_ADDRESS, json={"apiKey": TEST_KEY})
    client.get("/api/settings")
    client.patch("/api/settings", json={"apiKey": TEST_KEY})
    client.put(KEY_ADDRESS, json={"apiKey": f"{TEST_KEY} {TEST_KEY}"})
    client.delete(KEY_ADDRESS)

    logged = [f"{record.getMessage()} {record.args!r}" for record in caplog.records]
    assert logged != []
    assert [line for line in logged if TEST_KEY in line] == []


def test_a_new_tool_answers_with_no_rejection_under_each_of_the_four_reasons(
    client: TestClient,
) -> None:
    assert client.get("/api/settings").json()["rejections"] == NO_REJECTIONS


def test_each_reason_is_given_the_number_of_its_rejections_and_one_without_a_reason_is_in_none(
    client: TestClient, tmp_path: Path
) -> None:
    record_rejections(tmp_path, REASONS_GIVEN)

    assert client.get("/api/settings").json()["rejections"] == REJECTIONS_OF_THE_REASONS_GIVEN


def test_a_changed_choice_a_saved_key_and_a_removed_key_are_answered_with_the_same_numbers(
    client: TestClient, tmp_path: Path
) -> None:
    record_rejections(tmp_path, REASONS_GIVEN)

    changed = client.patch("/api/settings", json={"clipsPerVideo": "8"})
    saved = client.put(KEY_ADDRESS, json={"apiKey": TEST_KEY})
    removed = client.delete(KEY_ADDRESS)

    assert [answer.json()["rejections"] for answer in (changed, saved, removed)] == [
        REJECTIONS_OF_THE_REASONS_GIVEN
    ] * 3


def test_forgetting_answers_no_rejection_and_so_does_a_later_read_and_both_lists_are_empty(
    client: TestClient, tmp_path: Path
) -> None:
    record_rejections(tmp_path, REASONS_GIVEN)

    forgotten = client.delete(HISTORY_ADDRESS)

    history = HistoryStore(open_the_tool_database(tmp_path))
    assert forgotten.status_code == 200
    assert forgotten.json()["rejections"] == NO_REJECTIONS
    assert client.get("/api/settings").json() == forgotten.json()
    assert (history.list_newest_decisions(LAST_DECISIONS), history.list_outcomes()) == ([], [])


def test_forgetting_leaves_the_six_choices_and_the_saved_key_as_they_were(
    client: TestClient, tmp_path: Path, key_file: Path
) -> None:
    record_rejections(tmp_path, REASONS_GIVEN)
    client.patch("/api/settings", json=CHANGED_CHOICES)
    before = client.put(KEY_ADDRESS, json={"apiKey": TEST_KEY}).json()

    forgotten = client.delete(HISTORY_ADDRESS).json()

    assert before["rejections"] == REJECTIONS_OF_THE_REASONS_GIVEN
    assert forgotten == {**before, "rejections": NO_REJECTIONS}
    assert {name: forgotten[name] for name in CHANGED_CHOICES} == CHANGED_CHOICES
    assert (forgotten["hasApiKey"], forgotten["apiKeyEnding"]) == (True, "4f2a")
    assert key_file.read_text() == TEST_KEY


def test_forgetting_an_empty_history_answers_no_rejection(client: TestClient) -> None:
    forgotten = client.delete(HISTORY_ADDRESS)

    assert (forgotten.status_code, forgotten.json()["rejections"]) == (200, NO_REJECTIONS)
