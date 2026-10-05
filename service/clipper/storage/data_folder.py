from dataclasses import dataclass
from pathlib import Path

DATABASE_NAME = "clipper.sqlite3"
PROJECTS_DIR_NAME = "projects"
MODELS_DIR_NAME = "models"
SOURCE_STEM = "source"


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
