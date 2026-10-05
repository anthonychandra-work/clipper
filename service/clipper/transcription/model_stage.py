from ..pipeline import StageFailedError, StageRun, StepCheck
from ..projects import Project, ProjectQueue, ProjectStatus, StepKind
from ..settings import PreferenceStore
from ..storage import DataFolder
from .download_model import ModelDownload, ModelDownloadError, download_model
from .whisper_models import find_published_model

MODEL_DOWNLOAD_FAILED = (
    "The transcription model could not be downloaded. Check your connection, then retry."
)


class DownloadPlanner:
    def __init__(
        self, preferences: PreferenceStore, data_folder: DataFolder, queue: ProjectQueue
    ) -> None:
        self._preferences = preferences
        self._data_folder = data_folder
        self._queue = queue

    def list_checks(self) -> dict[StepKind, StepCheck]:
        return {StepKind.MODEL: self.plan_for, StepKind.TRANSCRIBE: self.plan_for}

    def plan_for(self, project: Project) -> None:
        choice = self._preferences.read().whisper_model
        if self._data_folder.has_model(choice):
            return
        self._queue.put_step_ahead(
            project.id,
            kind=StepKind.MODEL,
            label=f"Downloading {find_published_model(choice).shown_name}",
            ahead_of=StepKind.TRANSCRIBE,
        )


class ModelStage:
    step = StepKind.MODEL
    resting_status = ProjectStatus.FETCHED

    def __init__(
        self, preferences: PreferenceStore, data_folder: DataFolder, model_source: str
    ) -> None:
        self._preferences = preferences
        self._data_folder = data_folder
        self._model_source = model_source

    def run(self, stage_run: StageRun) -> None:
        choice = self._preferences.read().whisper_model
        if self._data_folder.has_model(choice):
            return
        download = ModelDownload(
            model=find_published_model(choice),
            source=self._model_source,
            folder=self._data_folder.model_dir(choice),
        )
        try:
            download_model(download, stage_run.stop, stage_run.report_percent)
        except ModelDownloadError as failure:
            raise StageFailedError(MODEL_DOWNLOAD_FAILED) from failure
