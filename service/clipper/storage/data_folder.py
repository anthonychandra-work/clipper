from dataclasses import dataclass
from pathlib import Path

DATABASE_NAME = "clipper.sqlite3"


@dataclass(frozen=True)
class DataFolder:
    root: Path
    database_file: Path


def open_data_folder(root: Path) -> DataFolder:
    root.mkdir(parents=True, exist_ok=True)
    return DataFolder(root=root, database_file=root / DATABASE_NAME)
