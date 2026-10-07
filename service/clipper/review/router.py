from collections.abc import Callable, Coroutine
from dataclasses import dataclass
from typing import Annotated

from fastapi import APIRouter, Depends, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse
from fastapi.routing import APIRoute

from ..problems import NotFoundError
from ..projects import ProjectRepository
from .change_clip import ClipAddress, ClipChange, change_clip
from .clip_points import ChangeRefusedError
from .describe_review import ReviewSources, describe_review
from .review_records import Look
from .review_schemas import ClipResponse, LookBody, ReviewResponse

PREVIEW_MEDIA_TYPE = "video/mp4"
FRAME_MEDIA_TYPE = "image/jpeg"


class RouteThatRefusesInOneSentence(APIRoute):
    def get_route_handler(self) -> Callable[[Request], Coroutine[object, object, Response]]:
        handle = super().get_route_handler()

        async def handle_without_echo(request: Request) -> Response:
            try:
                return await handle(request)
            except RequestValidationError:
                raise ChangeRefusedError() from None

        return handle_without_echo


router = APIRouter(prefix="/api/projects", route_class=RouteThatRefusesInOneSentence)


class PreviewMissingError(NotFoundError):
    def __init__(self) -> None:
        super().__init__("This project has no preview copy on this Mac.")


class FrameMissingError(NotFoundError):
    def __init__(self) -> None:
        super().__init__("This clip has no such frame on this Mac.")


@dataclass(frozen=True)
class ReviewDependencies:
    repository: ProjectRepository
    sources: ReviewSources


def provide_review(request: Request) -> ReviewDependencies:
    dependencies = request.app.state.review
    if not isinstance(dependencies, ReviewDependencies):
        raise RuntimeError("The app was started without the dependencies of its review routes.")
    return dependencies


Review = Annotated[ReviewDependencies, Depends(provide_review)]


@router.get("/{project_id}/review")
def read_review(project_id: str, review: Review) -> ReviewResponse:
    return describe_review(review.repository.get(project_id), review.sources)


@router.patch("/{project_id}/clips/{clip_id}")
def change_one_clip(
    project_id: str, clip_id: str, change: ClipChange, review: Review
) -> ClipResponse:
    address = ClipAddress(review.repository.get(project_id), clip_id)
    return change_clip(address, change, review.sources)


@router.put("/{project_id}/look")
def store_look(project_id: str, look: LookBody, review: Review) -> LookBody:
    project = review.repository.get(project_id)
    review.sources.reviews.save_look(project.id, Look(**look.model_dump()))
    return look


@router.get("/{project_id}/preview")
def read_preview(project_id: str, review: Review) -> FileResponse:
    project = review.repository.get(project_id)
    preview = review.sources.data_folder.preview_file(project.id)
    if not preview.is_file():
        raise PreviewMissingError()
    return FileResponse(preview, media_type=PREVIEW_MEDIA_TYPE)


@router.get("/{project_id}/clips/{clip_id}/frames/{number}")
def read_frame(project_id: str, clip_id: str, number: int, review: Review) -> FileResponse:
    project = review.repository.get(project_id)
    frame = review.sources.data_folder.frame_file(project.id, clip_id, number)
    if not frame.is_file():
        raise FrameMissingError()
    return FileResponse(frame, media_type=FRAME_MEDIA_TYPE)
