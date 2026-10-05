import pytest
from pydantic import ValidationError

from ..projects import ClipLength
from ..storage import Database
from .preference_store import PreferenceStore
from .preferences import (
    ClaudeModel,
    ClipsPerVideo,
    PreferenceChanges,
    Preferences,
    SourceRetention,
    WhisperModel,
)


@pytest.fixture
def store(database: Database) -> PreferenceStore:
    return PreferenceStore(database)


def test_the_defaults_are_the_choices_of_a_new_tool(store: PreferenceStore) -> None:
    assert store.read() == Preferences(
        scoring_model=ClaudeModel.SONNET,
        cutting_model=ClaudeModel.OPUS,
        whisper_model=WhisperModel.LARGE_V3_TURBO,
        default_length=ClipLength.STANDARD,
        clips_per_video=ClipsPerVideo.AUTO,
        source_retention=SourceRetention.SEVEN_DAYS,
    )


def test_the_models_are_stored_under_the_identifiers_the_api_names() -> None:
    assert [model.value for model in ClaudeModel] == [
        "claude-fable-5-1",
        "claude-opus-5-5",
        "claude-sonnet-5-5",
        "claude-haiku-4-5",
    ]
    assert [model.value for model in WhisperModel] == ["large-v3-turbo", "medium", "small"]


def test_one_choice_is_stored_and_the_others_keep_their_defaults(store: PreferenceStore) -> None:
    saved = store.save(PreferenceChanges(scoring_model=ClaudeModel.HAIKU))

    assert saved.scoring_model is ClaudeModel.HAIKU
    assert saved.cutting_model is ClaudeModel.OPUS
    assert store.read() == saved


def test_every_choice_can_be_changed_and_is_read_back(store: PreferenceStore) -> None:
    changes = PreferenceChanges(
        scoring_model=ClaudeModel.FABLE,
        cutting_model=ClaudeModel.SONNET,
        whisper_model=WhisperModel.SMALL,
        default_length=ClipLength.LONG,
        clips_per_video=ClipsPerVideo.TWELVE,
        source_retention=SourceRetention.NEVER,
    )

    store.save(changes)

    assert store.read().model_dump() == changes.model_dump()


def test_a_later_choice_replaces_an_earlier_one(store: PreferenceStore) -> None:
    store.save(PreferenceChanges(source_retention=SourceRetention.THREE_DAYS))
    store.save(PreferenceChanges(source_retention=SourceRetention.THIRTY_DAYS))

    assert store.read().source_retention is SourceRetention.THIRTY_DAYS


def test_choices_survive_a_new_store_on_the_same_database(
    store: PreferenceStore, database: Database
) -> None:
    store.save(PreferenceChanges(whisper_model=WhisperModel.MEDIUM))

    assert PreferenceStore(database).read().whisper_model is WhisperModel.MEDIUM


def test_a_value_outside_the_options_is_not_a_change() -> None:
    with pytest.raises(ValidationError):
        PreferenceChanges.model_validate({"scoringModel": "gpt-4"})


def test_a_name_that_is_not_a_choice_is_not_a_change() -> None:
    with pytest.raises(ValidationError):
        PreferenceChanges.model_validate({"apiKey": "sk-ant-not-stored-here"})
