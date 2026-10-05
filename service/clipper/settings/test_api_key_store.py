import stat
from pathlib import Path

import pytest

from ..conftest import UNREACHABLE_KEY_FILE
from ..problems import RefusedError
from .api_key_store import ApiKeyStore, show_ending
from .startup_settings import StartupSettings

TEST_KEY = "sk-ant-test-4f2a"
OTHER_KEY = "sk-ant-test-9b07"


@pytest.fixture
def key_file(tmp_path: Path) -> Path:
    return tmp_path / "Clipper" / "anthropic-api-key"


def read_mode(path: Path) -> int:
    return stat.S_IMODE(path.stat().st_mode)


def test_a_saved_key_is_read_back_from_its_file(key_file: Path) -> None:
    store = ApiKeyStore(key_file)

    store.save(TEST_KEY)

    assert key_file.read_text() == TEST_KEY
    assert store.read() == TEST_KEY
    assert ApiKeyStore(key_file).read() == TEST_KEY


def test_saving_makes_the_missing_folder_and_the_file_for_the_account_of_the_user_only(
    key_file: Path,
) -> None:
    ApiKeyStore(key_file).save(TEST_KEY)

    assert read_mode(key_file.parent) == 0o700
    assert read_mode(key_file) == 0o600
    assert [entry.name for entry in key_file.parent.iterdir()] == ["anthropic-api-key"]


def test_a_key_saved_over_a_file_others_could_read_closes_that_file(key_file: Path) -> None:
    key_file.parent.mkdir()
    key_file.write_text(OTHER_KEY)
    key_file.chmod(0o644)

    ApiKeyStore(key_file).save(TEST_KEY)

    assert key_file.read_text() == TEST_KEY
    assert read_mode(key_file) == 0o600


def test_a_file_that_is_not_there_means_no_key(key_file: Path) -> None:
    assert ApiKeyStore(key_file).read() is None


def test_a_file_that_cannot_be_reached_means_no_key() -> None:
    assert ApiKeyStore(Path(UNREACHABLE_KEY_FILE)).read() is None


def test_an_empty_file_means_no_key(key_file: Path) -> None:
    key_file.parent.mkdir()
    key_file.write_text("\n")

    assert ApiKeyStore(key_file).read() is None


def test_a_line_break_after_a_key_written_by_hand_is_not_part_of_the_key(key_file: Path) -> None:
    key_file.parent.mkdir()
    key_file.write_text(f"{TEST_KEY}\n")

    assert ApiKeyStore(key_file).read() == TEST_KEY


def test_removing_deletes_the_file_and_removing_again_changes_nothing(key_file: Path) -> None:
    store = ApiKeyStore(key_file)
    store.save(TEST_KEY)

    store.remove()
    store.remove()

    assert not key_file.exists()
    assert store.read() is None


@pytest.mark.parametrize("sent", ["", "   ", "\n"])
def test_an_empty_key_is_refused_and_nothing_is_written(key_file: Path, sent: str) -> None:
    with pytest.raises(RefusedError) as refused:
        ApiKeyStore(key_file).save(sent)

    assert refused.value.message == "Paste the key first."
    assert not key_file.exists()


@pytest.mark.parametrize("sent", ["sk-ant test-4f2a", "sk-ant-test\n-4f2a", "sk-ant\ttest-4f2a"])
def test_a_key_with_a_space_or_a_line_break_in_it_is_refused_without_repeating_it(
    key_file: Path, sent: str
) -> None:
    with pytest.raises(RefusedError) as refused:
        ApiKeyStore(key_file).save(sent)

    assert refused.value.message == "An API key has no spaces or line breaks. Paste it again."
    assert "4f2a" not in str(refused.value.describe())
    assert not key_file.exists()


def test_blanks_around_a_pasted_key_are_left_out(key_file: Path) -> None:
    ApiKeyStore(key_file).save(f"  {TEST_KEY}\n")

    assert key_file.read_text() == TEST_KEY


def test_a_refused_key_leaves_the_saved_one_in_place(key_file: Path) -> None:
    store = ApiKeyStore(key_file)
    store.save(TEST_KEY)

    with pytest.raises(RefusedError):
        store.save("")

    assert store.read() == TEST_KEY


def test_only_the_last_four_characters_of_a_key_are_shown() -> None:
    assert show_ending(TEST_KEY) == "4f2a"
    assert show_ending(None) is None


def test_a_key_of_four_characters_or_fewer_is_not_shown_at_all() -> None:
    assert show_ending("4f2a") is None
    assert show_ending("a") is None


def test_the_startup_settings_of_a_test_session_name_no_file_in_the_home_of_the_user() -> None:
    key_file = StartupSettings().key_file

    assert key_file == Path(UNREACHABLE_KEY_FILE)
    assert not key_file.is_relative_to(Path.home())
