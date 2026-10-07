from dataclasses import dataclass
from typing import Annotated

from fastapi import APIRouter, Depends, Request

from ..projects import ProjectRepository
from .clip_limits import find_clip_limits
from .selection_records import WindowRecord
from .selection_schemas import (
    CandidateResponse,
    ReplayPeakResponse,
    SelectionResponse,
    WindowResponse,
)
from .selection_store import SelectionStore

router = APIRouter(prefix="/api/projects")


@dataclass(frozen=True)
class SelectionDependencies:
    repository: ProjectRepository
    store: SelectionStore


def provide_selection(request: Request) -> SelectionDependencies:
    dependencies = request.app.state.selection
    if not isinstance(dependencies, SelectionDependencies):
        raise RuntimeError("The app was started without the dependencies of its selection routes.")
    return dependencies


Selection = Annotated[SelectionDependencies, Depends(provide_selection)]


@router.get("/{project_id}/selection")
def read_selection(project_id: str, selection: Selection) -> SelectionResponse:
    project = selection.repository.get(project_id)
    store = selection.store
    return SelectionResponse(
        clip_seconds=find_clip_limits(project.clip_length),
        windows=[describe_window(record) for record in store.list_windows(project.id)],
        replay_peaks=[
            ReplayPeakResponse.model_validate(peak) for peak in store.list_peaks(project.id)
        ],
        candidates=[
            CandidateResponse.model_validate(candidate)
            for candidate in store.list_candidates(project.id)
        ],
    )


def describe_window(record: WindowRecord) -> WindowResponse:
    window = record.window
    return WindowResponse(
        id=window.id,
        start_seconds=window.start_seconds,
        end_seconds=window.end_seconds,
        score=record.score,
        is_shortlisted=record.is_shortlisted,
    )
