from dataclasses import dataclass
from pathlib import Path

DATABASE_NAME = "clipper.sqlite3"
PROJECTS_DIR_NAME = "projects"
SOURCE_STEM = "source"


@dataclass(frozen=True)
class DataFolder:
    root: Path
    database_file: Path
    projects_dir: Path

    def project_dir(self, project_id: str) -> Path:
        return self.projects_dir / project_id

    def find_source_file(self, project_id: str) -> Path | None:
        stored = sorted(self.project_dir(project_id).glob(f"{SOURCE_STEM}.*"))
        return stored[0] if stored else None


def open_data_folder(root: Path) -> DataFolder:
    projects_dir = root / PROJECTS_DIR_NAME
    projects_dir.mkdir(parents=True, exist_ok=True)
    return DataFolder(root=root, database_file=root / DATABASE_NAME, projects_dir=projects_dir)
