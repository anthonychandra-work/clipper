from pathlib import Path

from ..media import MediaTools, PreviewJob, make_preview_copy, probe_video
from ..pipeline import StageFailedError, StageRun
from ..projects import ARRIVAL_SHARE_PERCENT, ProjectRepository, ProjectStatus, StepKind
from ..storage import DataFolder
from .download_link import DownloadedVideo, LinkDownload, LinkDownloadError, download_link

DOWNLOAD_FAILED = (
    "The video could not be downloaded. Check the link and your connection, then retry."
)
PREVIEW_NAME = "preview.mp4"
PREVIEW_PATTERN = "preview*"
ARRIVAL_SHARE = ARRIVAL_SHARE_PERCENT / 100
PREPARATION_SHARE = 1 - ARRIVAL_SHARE


class SourceMissingError(Exception):
    def __init__(self, project_id: str) -> None:
        super().__init__(f"No source video is stored for project {project_id}.")


class FetchStage:
    step = StepKind.FETCH
    resting_status = ProjectStatus.FETCHED

    def __init__(
        self, repository: ProjectRepository, data_folder: DataFolder, tools: MediaTools
    ) -> None:
        self._repository = repository
        self._data_folder = data_folder
        self._tools = tools

    def run(self, stage_run: StageRun) -> None:
        project_dir = self._data_folder.project_dir(stage_run.project.id)
        remove_earlier_preview(project_dir)
        source = self._bring_source(stage_run)
        facts = probe_video(source, self._tools)
        self._repository.record_duration(stage_run.project.id, facts.duration_seconds)
        make_preview_copy(
            PreviewJob(source, project_dir / PREVIEW_NAME, facts.duration_seconds),
            self._tools,
            stage_run.stop,
            lambda percent: stage_run.report_percent(preparation_as_step_percent(percent)),
        )

    def _bring_source(self, stage_run: StageRun) -> Path:
        project = stage_run.project
        if project.link is None:
            return self._find_uploaded_source(project.id)
        downloaded = self._download(stage_run, project.link)
        if downloaded.title:
            self._repository.rename(project.id, downloaded.title)
        return downloaded.file

    def _download(self, stage_run: StageRun, link: str) -> DownloadedVideo:
        try:
            return download_link(
                LinkDownload(link, self._data_folder.project_dir(stage_run.project.id)),
                self._tools,
                stage_run.stop,
                lambda percent: stage_run.report_percent(percent * ARRIVAL_SHARE),
            )
        except LinkDownloadError as failure:
            raise StageFailedError(DOWNLOAD_FAILED) from failure

    def _find_uploaded_source(self, project_id: str) -> Path:
        uploaded = self._data_folder.find_source_file(project_id)
        if uploaded is None:
            raise SourceMissingError(project_id)
        return uploaded


def remove_earlier_preview(project_dir: Path) -> None:
    for leftover in project_dir.glob(PREVIEW_PATTERN):
        leftover.unlink()


def preparation_as_step_percent(preparation_percent: float) -> float:
    return ARRIVAL_SHARE_PERCENT + preparation_percent * PREPARATION_SHARE
