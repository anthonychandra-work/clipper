import threading
from collections.abc import Callable, Sequence
from dataclasses import dataclass

from ..learning import LAST_DECISIONS, HistoryStore, write_note
from ..pipeline import StageFailedError, StageRun
from ..projects import ProjectQueue
from ..settings import ApiKeyStore, ClaudeModel, PreferenceStore
from ..storage import DataFolder
from ..transcription import read_transcript
from .ask_claude import ClaudeAccess
from .clip_limits import find_clip_limits
from .selection_reasons import MISSING_KEY
from .selection_records import Candidate
from .selection_store import SelectionStore
from .selection_task import PassContext
from .split_sentences import Sentence, split_sentences
from .transcript_part import write_transcript_part


@dataclass(frozen=True)
class ChosenClips:
    project_id: str
    candidates: Sequence[Candidate]
    sentences: Sequence[Sentence]
    stop: threading.Event
    report_percent: Callable[[float], None]


type ClipWork = Callable[[ChosenClips], None]


@dataclass(frozen=True)
class StageDependencies:
    keys: ApiKeyStore
    preferences: PreferenceStore
    data_folder: DataFolder
    queue: ProjectQueue
    store: SelectionStore
    history: HistoryStore
    anthropic_source: str
    work_on_chosen_clips: ClipWork | None = None


@dataclass(frozen=True)
class PreparedPass:
    sentences: list[Sentence]
    context: PassContext
    duration_seconds: float


def prepare_pass(
    stage_run: StageRun, model: ClaudeModel, dependencies: StageDependencies
) -> PreparedPass:
    key = dependencies.keys.read()
    if key is None:
        raise StageFailedError(MISSING_KEY, opens_settings=True)
    project = stage_run.project
    transcript = read_transcript(dependencies.data_folder.project_dir(project.id))
    sentences = split_sentences(transcript.words)
    context = PassContext(
        access=ClaudeAccess(key=key, address=dependencies.anthropic_source),
        model=model,
        transcript_part=write_transcript_part(sentences),
        clip_seconds=find_clip_limits(project.clip_length),
        language=transcript.language,
        brief=project.brief,
        stop=stage_run.stop,
        note=write_note_from(dependencies.history),
    )
    return PreparedPass(sentences, context, project.duration_seconds or sentences[-1].end)


def write_note_from(history: HistoryStore) -> str | None:
    return write_note(history.list_newest_decisions(LAST_DECISIONS), history.list_outcomes())
