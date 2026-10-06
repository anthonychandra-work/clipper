from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from .project import ClipLength, Platform, ProjectStatus, SourceKind, StepKind, StepState


class ApiModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class CreateProjectRequest(ApiModel):
    source_kind: SourceKind
    link: str = ""
    file_name: str = ""
    file_size_bytes: int = Field(default=0, ge=0)
    clip_length: ClipLength = ClipLength.STANDARD
    platforms: list[Platform] = Field(default_factory=list)
    brief: str = ""


class StepResponse(ApiModel):
    kind: StepKind
    label: str
    state: StepState
    percent: float


class HaltResponse(ApiModel):
    reason: str
    opens_settings: bool


class UploadResponse(ApiModel):
    file_name: str
    size_bytes: int
    received_bytes: int


class ProjectResponse(ApiModel):
    id: str
    title: str
    source_kind: SourceKind
    source_label: str
    duration_seconds: float | None
    status: ProjectStatus
    steps: list[StepResponse]
    percent: float
    halt: HaltResponse | None
    upload: UploadResponse | None
    candidate_count: int
    kept_count: int
    rejected_count: int


class ProjectListResponse(ApiModel):
    projects: list[ProjectResponse]
    free_disk_gb: float


class UploadProgressResponse(ApiModel):
    received_bytes: int
