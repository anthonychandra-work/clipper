from dataclasses import dataclass

import pytest

from ..projects import ProjectRepository, ProjectStatus
from ..rendering import RenderStore
from ..review.conftest import CutTalk
from ..review.conftest import cut_talk as cut_talk
from ..review.conftest import cut_the_talk as cut_the_talk
from ..review.conftest import recorded_claude_address as recorded_claude_address
from ..review.conftest import sources as sources
from ..review.conftest import talk_candidates as talk_candidates
from ..review.conftest import talk_sentences as talk_sentences
from ..review.conftest import talk_transcript as talk_transcript
from ..settings import PreferenceStore
from ..storage import Database, DataFolder
from .remove_old_sources import SECONDS_PER_DAY, RetentionSources

NOW = 1_760_000_000
FILES_THAT_STAY = ("transcript.json", "frames/c01-01.jpg", "exports/01-c01.mp4")


@dataclass(frozen=True)
class StoredTalk:
    project_id: str
    data_folder: DataFolder
    database: Database

    def place_files(self) -> None:
        project_dir = self.data_folder.project_dir(self.project_id)
        for name in ("source.mp4", "preview.mp4", *FILES_THAT_STAY[1:]):
            (project_dir / name).parent.mkdir(exist_ok=True)
            (project_dir / name).write_bytes(b"kept")

    def import_days_before_now(self, days: float) -> None:
        self._update("imported_at", int(NOW - days * SECONDS_PER_DAY))

    def rest(self, status: ProjectStatus) -> None:
        self._update("status", status)

    def has_source(self) -> bool:
        return self.data_folder.find_source_file(self.project_id) is not None

    def has_preview(self) -> bool:
        return self.data_folder.preview_file(self.project_id).is_file()

    def list_files(self) -> list[str]:
        project_dir = self.data_folder.project_dir(self.project_id)
        return sorted(file.relative_to(project_dir).as_posix() for file in project_dir.rglob("*.*"))

    def _update(self, column: str, value: str | int) -> None:
        with self.database.transaction() as connection:
            connection.execute(
                f"UPDATE projects SET {column} = ? WHERE id = ?", [value, self.project_id]
            )


@pytest.fixture
def stored_talk(cut_talk: CutTalk, data_folder: DataFolder, database: Database) -> StoredTalk:
    talk = StoredTalk(cut_talk.project.id, data_folder, database)
    talk.place_files()
    return talk


@pytest.fixture
def retention_sources(
    repository: ProjectRepository, database: Database, data_folder: DataFolder
) -> RetentionSources:
    return RetentionSources(
        repository=repository,
        preferences=PreferenceStore(database),
        data_folder=data_folder,
        has_queued_clip=RenderStore(database).has_queued_clip,
    )
