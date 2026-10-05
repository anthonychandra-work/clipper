from dataclasses import dataclass

from ..pipeline import StageFailedError, StageRun
from ..projects import ProjectQueue
from ..settings import ApiKeyStore, ClaudeModel, PreferenceStore
from ..storage import DataFolder
from ..transcription import read_transcript
from .ask_claude import ClaudeAccess
from .clip_limits import find_clip_limits
from .selection_reasons import MISSING_KEY
from .selection_store import SelectionStore
from .selection_task import PassContext
from .split_sentences import Sentence, split_sentences
from .transcript_part import write_transcript_part


@dataclass(frozen=True)
class StageDependencies:
    keys: ApiKeyStore
    preferences: PreferenceStore
    data_folder: DataFolder
    queue: ProjectQueue
    store: SelectionStore
    anthropic_source: str


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
    )
    return PreparedPass(sentences, context, project.duration_seconds or sentences[-1].end)
