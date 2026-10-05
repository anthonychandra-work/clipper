from collections.abc import Callable
from dataclasses import dataclass
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request, status
from fastapi.concurrency import run_in_threadpool

from ..storage import DataFolder, DiskSpace
from .create_project import create_project
from .delete_project import delete_project
from .describe_project import describe_project
from .project_repository import ProjectRepository
from .project_schemas import (
    CreateProjectRequest,
    ProjectListResponse,
    ProjectResponse,
    UploadProgressResponse,
)
from .receive_upload import MAX_PART_BYTES, PartTooLargeError, UploadPart, receive_upload_part

FREE_DISK_DECIMALS = 1

router = APIRouter(prefix="/api/projects")


@dataclass(frozen=True)
class ProjectsDependencies:
    repository: ProjectRepository
    data_folder: DataFolder
    read_disk_space: Callable[[], DiskSpace]


def provide_projects(request: Request) -> ProjectsDependencies:
    dependencies = request.app.state.projects
    if not isinstance(dependencies, ProjectsDependencies):
        raise RuntimeError("The app was started without the dependencies of its project routes.")
    return dependencies


Projects = Annotated[ProjectsDependencies, Depends(provide_projects)]


@router.get("")
def list_projects(projects: Projects) -> ProjectListResponse:
    found = projects.repository.list_newest_first()
    return ProjectListResponse(
        projects=[describe_project(project) for project in found],
        free_disk_gb=round(projects.read_disk_space().free_gb(), FREE_DISK_DECIMALS),
    )


@router.post("", status_code=status.HTTP_201_CREATED)
def add_project(draft: CreateProjectRequest, projects: Projects) -> ProjectResponse:
    project = create_project(draft, projects.repository, projects.read_disk_space())
    return describe_project(project)


@router.get("/{project_id}")
def read_project(project_id: str, projects: Projects) -> ProjectResponse:
    return describe_project(projects.repository.get(project_id))


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_project(project_id: str, projects: Projects) -> None:
    delete_project(project_id, projects.repository, projects.data_folder)


@router.put("/{project_id}/upload")
async def add_upload_part(
    project_id: str, offset: Annotated[int, Query(ge=0)], request: Request, projects: Projects
) -> UploadProgressResponse:
    part = UploadPart(project_id=project_id, offset=offset, content=await read_part(request))
    received_bytes = await run_in_threadpool(
        receive_upload_part, part, projects.repository, projects.data_folder
    )
    return UploadProgressResponse(received_bytes=received_bytes)


async def read_part(request: Request) -> bytes:
    declared_length = request.headers.get("content-length", "0")
    if int(declared_length) > MAX_PART_BYTES:
        raise PartTooLargeError()
    content = bytearray()
    async for chunk in request.stream():
        content.extend(chunk)
        if len(content) > MAX_PART_BYTES:
            raise PartTooLargeError()
    return bytes(content)
