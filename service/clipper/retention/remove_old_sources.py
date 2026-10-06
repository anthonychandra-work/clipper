from collections.abc import Callable
from dataclasses import dataclass

from ..projects import Project, ProjectRepository, ProjectStatus
from ..settings import PreferenceStore, SourceRetention
from ..storage import DataFolder

SECONDS_PER_DAY = 86_400
# Retry and Resume need the source of a project that has not reached its clips.
STATUSES_WITH_CLIPS = (ProjectStatus.READY, ProjectStatus.EXPORTED)


@dataclass(frozen=True)
class RetentionSources:
    repository: ProjectRepository
    preferences: PreferenceStore
    data_folder: DataFolder
    has_queued_clip: Callable[[str], bool]


def remove_old_sources(now_seconds: float, sources: RetentionSources) -> None:
    kept_days = count_kept_days(sources.preferences.read().source_retention)
    if kept_days is None:
        return
    oldest_kept_import = now_seconds - kept_days * SECONDS_PER_DAY
    for project in sources.repository.list_newest_first():
        is_old = is_past_retention(project, oldest_kept_import)
        if is_old and not sources.has_queued_clip(project.id):
            sources.data_folder.remove_source_and_preview(project.id)


def count_kept_days(retention: SourceRetention) -> int | None:
    return None if retention is SourceRetention.NEVER else int(retention)


def is_past_retention(project: Project, oldest_kept_import: float) -> bool:
    return project.status in STATUSES_WITH_CLIPS and project.imported_at < oldest_kept_import
