import re
from dataclasses import dataclass
from pathlib import Path

from ..problems import NotFoundError
from ..projects import Project
from .describe_export import ExportSources, ProjectExports

UNFIT_FOR_A_FILE_NAME = re.compile(r'[\\/:*?"<>|\x00-\x1f\x7f]')
FILE_ENDING = ".mp4"


class ExportMissingError(NotFoundError):
    def __init__(self) -> None:
        super().__init__("This clip has no export on this Mac.")


@dataclass(frozen=True)
class Download:
    file: Path
    name: str


def find_download(project: Project, clip_id: str, sources: ExportSources) -> Download:
    candidates = sources.review.selection.list_candidates(project.id)
    candidate = next((clip for clip in candidates if clip.id == clip_id), None)
    renders = sources.renders.list_renders(project.id)
    exports = ProjectExports(project, renders, sources.review.data_folder)
    if candidate is None or not exports.has_finished_file(candidate):
        raise ExportMissingError()
    review = sources.review.reviews.list_reviews(project.id).get(clip_id)
    title = (review.title if review else None) or candidate.title
    return Download(exports.find_file(candidate), name_download(candidate.rank, title))


def name_download(rank: int, title: str) -> str:
    fit = " ".join(UNFIT_FOR_A_FILE_NAME.sub("", title).split()).strip(". ")
    return f"{rank:02d} {fit}".strip() + FILE_ENDING
