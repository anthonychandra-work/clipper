import threading
from dataclasses import replace

import pytest

from ..conftest import CLOSED_LOCAL_PORT
from ..pipeline import StageFailedError, StageRun
from ..projects import ClipLength, Project, ProjectQueue
from ..settings import ApiKeyStore, ClaudeModel, PreferenceStore
from ..storage import Database, DataFolder
from .ask_claude import ClaudeAccess
from .conftest import TALK_BRIEF, TALK_SECONDS, TEST_KEY
from .prepare_pass import StageDependencies, prepare_pass
from .selection_reasons import MISSING_KEY
from .selection_store import SelectionStore
from .selection_task import ClipSeconds
from .transcript_part import write_transcript_part

LAST_WORD_ENDS_AT = 234.56


@pytest.fixture
def dependencies(
    key_store: ApiKeyStore, database: Database, data_folder: DataFolder, queue: ProjectQueue
) -> StageDependencies:
    return StageDependencies(
        keys=key_store,
        preferences=PreferenceStore(database),
        data_folder=data_folder,
        queue=queue,
        store=SelectionStore(database),
        anthropic_source=CLOSED_LOCAL_PORT,
    )


def run_step_of(project: Project) -> StageRun:
    return StageRun(project, threading.Event(), lambda percent: None)


def test_with_no_key_saved_the_pass_fails_with_the_missing_key_sentence_marked_for_settings(
    transcribed_talk: Project, dependencies: StageDependencies
) -> None:
    with pytest.raises(StageFailedError) as raised:
        prepare_pass(run_step_of(transcribed_talk), ClaudeModel.SONNET, dependencies)

    assert (raised.value.reason, raised.value.opens_settings) == (MISSING_KEY, True)


def test_a_prepared_pass_carries_the_key_the_address_the_model_and_the_stop_signal(
    transcribed_talk: Project, dependencies: StageDependencies, key_store: ApiKeyStore
) -> None:
    key_store.save(TEST_KEY)
    stage_run = run_step_of(transcribed_talk)

    context = prepare_pass(stage_run, ClaudeModel.HAIKU, dependencies).context

    assert context.access == ClaudeAccess(key=TEST_KEY, address=CLOSED_LOCAL_PORT)
    assert context.model is ClaudeModel.HAIKU
    assert context.stop is stage_run.stop


def test_a_prepared_pass_carries_the_brief_the_clip_length_and_the_language_of_the_transcript(
    transcribed_talk: Project, dependencies: StageDependencies, key_store: ApiKeyStore
) -> None:
    key_store.save(TEST_KEY)

    prepared = prepare_pass(run_step_of(transcribed_talk), ClaudeModel.SONNET, dependencies)

    context = prepared.context
    assert (context.brief, context.language) == (TALK_BRIEF, "en")
    assert context.clip_seconds == ClipSeconds(min=25, max=60)
    assert len(prepared.sentences) == 54
    assert context.transcript_part == write_transcript_part(prepared.sentences)
    assert prepared.duration_seconds == TALK_SECONDS


@pytest.mark.parametrize(
    ("clip_length", "limits"),
    [
        (ClipLength.SHORT, ClipSeconds(min=15, max=30)),
        (ClipLength.LONG, ClipSeconds(min=60, max=180)),
    ],
)
def test_the_clip_length_chosen_for_the_project_sets_the_limits_of_the_pass(
    transcribed_talk: Project,
    dependencies: StageDependencies,
    key_store: ApiKeyStore,
    clip_length: ClipLength,
    limits: ClipSeconds,
) -> None:
    key_store.save(TEST_KEY)
    project = replace(transcribed_talk, clip_length=clip_length)

    prepared = prepare_pass(run_step_of(project), ClaudeModel.SONNET, dependencies)

    assert prepared.context.clip_seconds == limits


def test_a_video_whose_length_was_never_recorded_lasts_until_its_last_sentence_ends(
    transcribed_talk: Project, dependencies: StageDependencies, key_store: ApiKeyStore
) -> None:
    key_store.save(TEST_KEY)
    project = replace(transcribed_talk, duration_seconds=None)

    prepared = prepare_pass(run_step_of(project), ClaudeModel.SONNET, dependencies)

    assert prepared.duration_seconds == LAST_WORD_ENDS_AT
