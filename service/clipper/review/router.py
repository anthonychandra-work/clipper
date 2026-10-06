from dataclasses import dataclass
from typing import Annotated

from fastapi import APIRouter, Depends, Request
from fastapi.responses import FileResponse

from ..problems import NotFoundError
from ..projects import ProjectRepository
from ..storage import DataFolder

PREVIEW_MEDIA_TYPE = "video/mp4"

router = APIRouter(prefix="/api/projects")


class PreviewMissingError(NotFoundError):
    def __init__(self) -> None:
        super().__init__("This project has no preview copy on this Mac.")


@dataclass(frozen=True)
class ReviewDependencies:
    repository: ProjectRepository
    data_folder: DataFolder


def provide_review(request: Request) -> ReviewDependencies:
    dependencies = request.app.state.review
    if not isinstance(dependencies, ReviewDependencies):
        raise RuntimeError("The app was started without the dependencies of its review routes.")
    return dependencies


Review = Annotated[ReviewDependencies, Depends(provide_review)]


@router.get("/{project_id}/preview")
def read_preview(project_id: str, review: Review) -> FileResponse:
    project = review.repository.get(project_id)
    preview = review.data_folder.preview_file(project.id)
    if not preview.is_file():
        raise PreviewMissingError()
    return FileResponse(preview, media_type=PREVIEW_MEDIA_TYPE)
