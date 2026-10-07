from pathlib import Path

from ..media import MediaTools, NoSoundTrackError, extract_audio, measure_sound_seconds
from ..pipeline import StageFailedError, StageRun
from ..projects import ProjectStatus, StepKind
from ..settings import PreferenceStore
from ..storage import DataFolder
from .run_transcriber import HeardSound, run_transcriber
from .transcript import NoSpeechError, build_transcript
from .transcript_store import write_transcript

NO_SPEECH = "No speech was recognised in this video. Clipper needs spoken words to find clips."
SAMPLES_NAME = "audio.pcm"
LEFT_BY_AN_ATTEMPT = ("audio.pcm*", "transcript*")


class SourceGoneError(Exception):
    def __init__(self, project_id: str) -> None:
        super().__init__(f"No source video is stored for project {project_id}.")


class TranscribeStage:
    step = StepKind.TRANSCRIBE
    resting_status = ProjectStatus.TRANSCRIBED

    def __init__(
        self, preferences: PreferenceStore, data_folder: DataFolder, tools: MediaTools
    ) -> None:
        self._preferences = preferences
        self._data_folder = data_folder
        self._tools = tools

    def run(self, stage_run: StageRun) -> None:
        project = stage_run.project
        project_dir = self._data_folder.project_dir(project.id)
        remove_earlier_attempt(project_dir)
        choice = self._preferences.read().whisper_model
        samples = project_dir / SAMPLES_NAME
        try:
            heard = self._hear(stage_run, samples, self._data_folder.model_dir(choice))
            length = project.duration_seconds or measure_sound_seconds(samples)
            transcript = build_transcript(heard, choice.value, length)
        except (NoSoundTrackError, NoSpeechError) as silence:
            raise StageFailedError(NO_SPEECH) from silence
        finally:
            samples.unlink(missing_ok=True)
        write_transcript(project_dir, transcript)

    def _hear(self, stage_run: StageRun, samples: Path, model_folder: Path) -> HeardSound:
        source = self._data_folder.find_source_file(stage_run.project.id)
        if source is None:
            raise SourceGoneError(stage_run.project.id)
        extract_audio(source, samples, self._tools, stage_run.stop)
        return run_transcriber(samples, model_folder, stage_run.stop, stage_run.report_percent)


def remove_earlier_attempt(project_dir: Path) -> None:
    for pattern in LEFT_BY_AN_ATTEMPT:
        for leftover in project_dir.glob(pattern):
            leftover.unlink()
