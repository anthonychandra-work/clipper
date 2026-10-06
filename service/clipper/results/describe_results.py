from dataclasses import dataclass

from ..projects import Project
from ..rendering import ExportSources, list_exported_clips
from .results_schemas import ResultClipResponse, ResultsResponse
from .results_store import ResultsStore


@dataclass(frozen=True)
class ResultsSources:
    exports: ExportSources
    views: ResultsStore


def describe_results(project: Project, sources: ResultsSources) -> ResultsResponse:
    views = sources.views.list_views(project.id)
    exported = list_exported_clips(project, sources.exports)
    return ResultsResponse(
        clips=[
            ResultClipResponse(
                id=clip.candidate.id,
                rank=clip.candidate.rank,
                title=clip.title,
                views=views.get(clip.candidate.id),
            )
            for clip in exported
        ]
    )
