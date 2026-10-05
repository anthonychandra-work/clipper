from collections.abc import Sequence

from ..projects import Project, ProjectQueue, ProjectRepository
from .pipeline_stage import PipelineStage


def requeue_rested(
    repository: ProjectRepository, queue: ProjectQueue, stages: Sequence[PipelineStage]
) -> list[str]:
    oldest_first = reversed(repository.list_newest_first())
    going_on = [project.id for project in oldest_first if rests_before_a_stage(project, stages)]
    for project_id in going_on:
        queue.requeue(project_id)
    return going_on


def rests_before_a_stage(project: Project, stages: Sequence[PipelineStage]) -> bool:
    next_step = project.first_unfinished_step()
    is_resting = project.status in {stage.resting_status for stage in stages}
    return (
        is_resting and next_step is not None and next_step.kind in {stage.step for stage in stages}
    )
