from dataclasses import dataclass
from typing import Annotated

from fastapi import APIRouter, Depends, Request

from ..projects import (
    ProjectQueue,
    ProjectRepository,
    ProjectResponse,
    describe_project,
)
from .halt_project import requeue_project, stop_project
from .run_queue import QueueWorker

router = APIRouter(prefix="/api/projects")


@dataclass(frozen=True)
class PipelineDependencies:
    repository: ProjectRepository
    queue: ProjectQueue
    worker: QueueWorker


def provide_pipeline(request: Request) -> PipelineDependencies:
    dependencies = request.app.state.pipeline
    if not isinstance(dependencies, PipelineDependencies):
        raise RuntimeError("The app was started without the dependencies of its pipeline routes.")
    return dependencies


Pipeline = Annotated[PipelineDependencies, Depends(provide_pipeline)]


@router.post("/{project_id}/stop")
def stop(project_id: str, pipeline: Pipeline) -> ProjectResponse:
    return describe_project(stop_project(project_id, pipeline.repository, pipeline.worker))


@router.post("/{project_id}/resume")
def resume(project_id: str, pipeline: Pipeline) -> ProjectResponse:
    return describe_project(requeue_project(project_id, pipeline.repository, pipeline.queue))


@router.post("/{project_id}/retry")
def retry(project_id: str, pipeline: Pipeline) -> ProjectResponse:
    return describe_project(requeue_project(project_id, pipeline.repository, pipeline.queue))
