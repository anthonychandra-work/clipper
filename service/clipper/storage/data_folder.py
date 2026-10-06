from dataclasses import dataclass
from pathlib import Path

DATABASE_NAME = "clipper.sqlite3"
PROJECTS_DIR_NAME = "projects"
MODELS_DIR_NAME = "models"
SOURCE_STEM = "source"
PREVIEW_NAME = "preview.mp4"
REPLAY_GRAPH_NAME = "replay-graph.json"
FRAMES_DIR_NAME = "frames"
EXPORTS_DIR_NAME = "exports"
RENDER_WORK_PREFIX = "rendering-"


@dataclass(frozen=True)
class DataFolder:
    root: Path
    database_file: Path
    projects_dir: Path
    models_dir: Path

    def project_dir(self, project_id: str) -> Path:
        return self.projects_dir / project_id

    def find_source_file(self, project_id: str) -> Path | None:
        stored = sorted(self.project_dir(project_id).glob(f"{SOURCE_STEM}.*"))
        return stored[0] if stored else None

    def preview_file(self, project_id: str) -> Path:
        return self.project_dir(project_id) / PREVIEW_NAME

    def remove_source_and_preview(self, project_id: str) -> None:
        sources = self.project_dir(project_id).glob(f"{SOURCE_STEM}.*")
        for copy in (*sources, self.preview_file(project_id)):
            copy.unlink(missing_ok=True)

    def replay_graph_file(self, project_id: str) -> Path:
        return self.project_dir(project_id) / REPLAY_GRAPH_NAME

    def frames_dir(self, project_id: str) -> Path:
        return self.project_dir(project_id) / FRAMES_DIR_NAME

    def frame_file(self, project_id: str, clip_id: str, number: int) -> Path:
        return self.frames_dir(project_id) / f"{clip_id}-{number:02d}.jpg"

    def exports_dir(self, project_id: str) -> Path:
        return self.project_dir(project_id) / EXPORTS_DIR_NAME

    def export_file(self, project_id: str, rank: int, clip_id: str) -> Path:
        return self.exports_dir(project_id) / f"{rank:02d}-{clip_id}.mp4"

    def render_work_dir(self, project_id: str, clip_id: str) -> Path:
        return self.project_dir(project_id) / f"{RENDER_WORK_PREFIX}{clip_id}"

    def model_dir(self, choice: str) -> Path:
        return self.models_dir / choice

    def has_model(self, choice: str) -> bool:
        return self.model_dir(choice).is_dir()


def open_data_folder(root: Path) -> DataFolder:
    projects_dir = root / PROJECTS_DIR_NAME
    models_dir = root / MODELS_DIR_NAME
    projects_dir.mkdir(parents=True, exist_ok=True)
    models_dir.mkdir(exist_ok=True)
    return DataFolder(
        root=root,
        database_file=root / DATABASE_NAME,
        projects_dir=projects_dir,
        models_dir=models_dir,
    )
