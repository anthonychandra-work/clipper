from collections.abc import Callable

from ..problems import ConflictError
from ..projects import Project
from ..review import ChangeRefusedError, Decision
from .describe_export import ExportSources


class SourceDeletedError(ConflictError):
    def __init__(self) -> None:
        super().__init__(
            "The source video was deleted to free space. New clips cannot be rendered."
        )


def queue_kept_clips(project: Project, sources: ExportSources) -> None:
    refuse_without_source(project, sources)
    sources.renders.queue_clips(project.id, list_kept_clip_ids(project, sources))


def queue_one_clip(project: Project, clip_id: str, sources: ExportSources) -> None:
    refuse_without_source(project, sources)
    if clip_id not in list_kept_clip_ids(project, sources):
        raise ChangeRefusedError()
    sources.renders.queue_clips(project.id, [clip_id])


# The waiting clips leave the queue first, so the worker takes none of them once its render ends.
def cancel_renders(
    project: Project, sources: ExportSources, stop_render: Callable[[str], object]
) -> None:
    sources.renders.cancel_waiting(project.id)
    stop_render(project.id)


def refuse_without_source(project: Project, sources: ExportSources) -> None:
    if sources.review.data_folder.find_source_file(project.id) is None:
        raise SourceDeletedError()


def list_kept_clip_ids(project: Project, sources: ExportSources) -> list[str]:
    reviews = sources.review.reviews.list_reviews(project.id)
    by_rank = sources.review.selection.list_candidates(project.id)
    return [
        candidate.id
        for candidate in by_rank
        if candidate.id in reviews and reviews[candidate.id].decision is Decision.KEEP
    ]
