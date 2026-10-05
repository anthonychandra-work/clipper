import logging
import stat
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from ..main import create_app
from ..storage import BYTES_PER_GB
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
TEST_KEY = "sk-ant-test-4f2a"
KEY_ADDRESS = "/api/settings/api-key"
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


def test_settings_start_at_the_defaults(client: TestClient) -> None:
    settings = client.get("/api/settings").json()

    assert {name: settings[name] for name in DEFAULT_CHOICES} == DEFAULT_CHOICES


def test_settings_carry_the_disk_space_and_the_phone_address(client: TestClient) -> None:
    settings = client.get("/api/settings").json()

    assert settings["freeDiskGb"] == 29.0
    assert settings["totalDiskGb"] > 29
    assert settings["phoneAddress"] == f"http://{find_network_address()}:3100"
    assert set(settings) == {*DEFAULT_CHOICES, *MACHINE_FACTS}


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
    assert set(saved.json()) == {*DEFAULT_CHOICES, *MACHINE_FACTS}
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
