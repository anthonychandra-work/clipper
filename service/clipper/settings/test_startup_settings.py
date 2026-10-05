from pathlib import Path

import pytest

from .startup_settings import REPOSITORY_ROOT, StartupSettings

SETTING_VARIABLES = [
    "CLIPPER_DATA_DIR",
    "CLIPPER_FFMPEG_DIR",
    "CLIPPER_KEY_FILE",
    "CLIPPER_WEB_PORT",
    "CLIPPER_SERVICE_PORT",
    "CLIPPER_REPORTED_FREE_BYTES",
    "CLIPPER_MODEL_SOURCE",
    "CLIPPER_ANTHROPIC_SOURCE",
]
CLOSED_LOCAL_PORT = "http://127.0.0.1:9"


@pytest.fixture
def clean_environment(monkeypatch: pytest.MonkeyPatch) -> pytest.MonkeyPatch:
    for variable in SETTING_VARIABLES:
        monkeypatch.delenv(variable, raising=False)
    return monkeypatch


def test_defaults_are_the_values_the_tool_runs_with(clean_environment: pytest.MonkeyPatch) -> None:
    settings = StartupSettings()
    application_support = Path.home() / "Library" / "Application Support"

    assert settings.data_dir == REPOSITORY_ROOT / "data"
    assert settings.ffmpeg_dir == Path("/opt/homebrew/opt/ffmpeg-full/bin")
    assert settings.key_file == application_support / "Clipper" / "anthropic-api-key"
    assert settings.web_port == 3000
    assert settings.service_port == 8765


def test_the_free_disk_space_is_measured_unless_a_figure_is_reported(
    clean_environment: pytest.MonkeyPatch,
) -> None:
    assert StartupSettings().reported_free_bytes is None

    clean_environment.setenv("CLIPPER_REPORTED_FREE_BYTES", "3221225472")

    assert StartupSettings().reported_free_bytes == 3 * 1024**3


def test_models_come_from_hugging_face_unless_another_source_is_named(
    clean_environment: pytest.MonkeyPatch,
) -> None:
    assert StartupSettings().model_source == "https://huggingface.co"

    clean_environment.setenv("CLIPPER_MODEL_SOURCE", "http://127.0.0.1:4000")

    assert StartupSettings().model_source == "http://127.0.0.1:4000"


def test_selection_asks_anthropic_unless_another_source_is_named(
    clean_environment: pytest.MonkeyPatch,
) -> None:
    assert StartupSettings().anthropic_source == "https://api.anthropic.com"

    clean_environment.setenv("CLIPPER_ANTHROPIC_SOURCE", "http://127.0.0.1:4001/talk")

    assert StartupSettings().anthropic_source == "http://127.0.0.1:4001/talk"


def test_a_test_session_names_a_closed_local_port_in_place_of_anthropic() -> None:
    assert StartupSettings().anthropic_source == CLOSED_LOCAL_PORT


def test_the_repository_root_holds_the_service_folder() -> None:
    assert (REPOSITORY_ROOT / "service" / "clipper").is_dir()


def test_the_search_path_is_the_path_of_the_environment(
    clean_environment: pytest.MonkeyPatch,
) -> None:
    clean_environment.setenv("PATH", "/first/bin:/second/bin")

    assert StartupSettings().search_path == "/first/bin:/second/bin"


def test_a_setting_given_by_name_wins_over_the_environment(
    clean_environment: pytest.MonkeyPatch,
) -> None:
    clean_environment.setenv("PATH", "/first/bin")

    assert StartupSettings(search_path="").search_path == ""


def test_environment_variables_replace_the_defaults(clean_environment: pytest.MonkeyPatch) -> None:
    clean_environment.setenv("CLIPPER_DATA_DIR", "/tmp/clipper-data")
    clean_environment.setenv("CLIPPER_FFMPEG_DIR", "/tmp/tools")
    clean_environment.setenv("CLIPPER_KEY_FILE", "/tmp/key")
    clean_environment.setenv("CLIPPER_WEB_PORT", "3100")
    clean_environment.setenv("CLIPPER_SERVICE_PORT", "8865")

    settings = StartupSettings()

    assert settings.data_dir == Path("/tmp/clipper-data")
    assert settings.ffmpeg_dir == Path("/tmp/tools")
    assert settings.key_file == Path("/tmp/key")
    assert settings.web_port == 3100
    assert settings.service_port == 8865
