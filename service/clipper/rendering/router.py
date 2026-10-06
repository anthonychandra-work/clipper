from collections.abc import Callable
from dataclasses import dataclass
from typing import Annotated

from fastapi import APIRouter, Depends, Request
from fastapi.responses import FileResponse

from ..projects import ProjectRepository
from .describe_export import ExportSources, describe_export
from .export_schemas import ExportResponse
from .find_download import find_download
from .queue_renders import cancel_renders, queue_kept_clips, queue_one_clip

EXPORT_MEDIA_TYPE = "video/mp4"

router = APIRouter(prefix="/api/projects")


@dataclass(frozen=True)
class ExportDependencies:
    repository: ProjectRepository
    sources: ExportSources
    stop_render: Callable[[str], object]


def provide_export(request: Request) -> ExportDependencies:
    dependencies = request.app.state.export
    if not isinstance(dependencies, ExportDependencies):
        raise RuntimeError("The app was started without the dependencies of its export routes.")
    return dependencies


Export = Annotated[ExportDependencies, Depends(provide_export)]


@router.get("/{project_id}/export")
def read_export(project_id: str, export: Export) -> ExportResponse:
    return describe_export(export.repository.get(project_id), export.sources)


@router.post("/{project_id}/renders")
def render_kept_clips(project_id: str, export: Export) -> ExportResponse:
    project = export.repository.get(project_id)
    queue_kept_clips(project, export.sources)
    return describe_export(project, export.sources)


@router.post("/{project_id}/clips/{clip_id}/render")
def render_one_clip(project_id: str, clip_id: str, export: Export) -> ExportResponse:
    project = export.repository.get(project_id)
    queue_one_clip(project, clip_id, export.sources)
    return describe_export(project, export.sources)


@router.delete("/{project_id}/renders")
def cancel_project_renders(project_id: str, export: Export) -> ExportResponse:
    project = export.repository.get(project_id)
    cancel_renders(project, export.sources, export.stop_render)
    return describe_export(project, export.sources)


@router.get("/{project_id}/clips/{clip_id}/export")
def read_export_file(project_id: str, clip_id: str, export: Export) -> FileResponse:
    download = find_download(export.repository.get(project_id), clip_id, export.sources)
    return FileResponse(download.file, media_type=EXPORT_MEDIA_TYPE, filename=download.name)
