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


@pytest.fixture
def client(tmp_path: Path) -> TestClient:
    startup = StartupSettings(
        data_dir=tmp_path / "data", reported_free_bytes=29 * BYTES_PER_GB, web_port=3100
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
    assert set(settings) == {*DEFAULT_CHOICES, "freeDiskGb", "totalDiskGb", "phoneAddress"}


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
        {"apiKey": "sk-ant-not-stored-here"},
    ],
)
def test_a_value_outside_the_options_is_refused_and_nothing_changes(
    client: TestClient, change: dict[str, str]
) -> None:
    refused = client.patch("/api/settings", json=change)

    assert refused.status_code == 422
    assert DEFAULT_CHOICES.items() <= client.get("/api/settings").json().items()
