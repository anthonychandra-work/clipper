from .project import Project, Step, Upload
from .project_schemas import HaltResponse, ProjectResponse, StepResponse, UploadResponse

PERCENT_DECIMALS = 1


def describe_project(project: Project) -> ProjectResponse:
    return ProjectResponse(
        id=project.id,
        title=project.title,
        source_kind=project.source_kind,
        source_label=project.source_label,
        duration_seconds=project.duration_seconds,
        status=project.status,
        steps=[describe_step(project, step) for step in project.steps],
        percent=round(project.percent(), PERCENT_DECIMALS),
        halt=HaltResponse(reason=project.halt_reason) if project.halt_reason else None,
        upload=describe_upload(project.upload) if project.upload else None,
    )


def describe_step(project: Project, step: Step) -> StepResponse:
    return StepResponse(
        kind=step.kind,
        label=project.label_of(step),
        state=step.state,
        percent=round(step.percent, PERCENT_DECIMALS),
    )


def describe_upload(upload: Upload) -> UploadResponse:
    return UploadResponse(
        file_name=upload.file_name,
        size_bytes=upload.size_bytes,
        received_bytes=upload.received_bytes,
    )
