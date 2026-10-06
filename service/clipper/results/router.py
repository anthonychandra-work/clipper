from dataclasses import dataclass
from typing import Annotated

from fastapi import APIRouter, Depends, Request

from ..projects import ProjectRepository
from ..review import ClipAddress, RouteThatRefusesInOneSentence
from .describe_results import ResultsSources, describe_results
from .log_views import log_views
from .results_schemas import ResultsResponse, ViewsBody

router = APIRouter(prefix="/api/projects", route_class=RouteThatRefusesInOneSentence)


@dataclass(frozen=True)
class ResultsDependencies:
    repository: ProjectRepository
    sources: ResultsSources


def provide_results(request: Request) -> ResultsDependencies:
    dependencies = request.app.state.results
    if not isinstance(dependencies, ResultsDependencies):
        raise RuntimeError("The app was started without the dependencies of its results routes.")
    return dependencies


Results = Annotated[ResultsDependencies, Depends(provide_results)]


@router.get("/{project_id}/results")
def read_results(project_id: str, results: Results) -> ResultsResponse:
    return describe_results(results.repository.get(project_id), results.sources)


@router.put("/{project_id}/clips/{clip_id}/views")
def store_views(
    project_id: str, clip_id: str, sent: ViewsBody, results: Results
) -> ResultsResponse:
    project = results.repository.get(project_id)
    log_views(ClipAddress(project, clip_id), sent.views, results.sources)
    return describe_results(project, results.sources)
