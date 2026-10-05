import re
import secrets
from urllib.parse import urlsplit

from ..problems import RefusedError
from ..storage import BYTES_PER_GB, DiskSpace
from .project import STEP_ORDER, Project, ProjectStatus, SourceKind, Step, StepState, Upload
from .project_repository import ProjectRepository
from .project_schemas import CreateProjectRequest

LINK_PATTERN = re.compile(r"^https?://\S+\.\S+")
MAX_UPLOAD_GB = 4
MIN_FREE_GB = 5
SHOWN_GB_STEP = 0.1
ID_BYTES = 6
SOURCE_SECTION = "source"
PLATFORMS_SECTION = "platforms"
LINK_TITLE = "New video from link"


def create_project(
    draft: CreateProjectRequest, repository: ProjectRepository, disk_space: DiskSpace
) -> Project:
    refuse_incomplete_draft(draft)
    refuse_oversized_file(draft)
    refuse_when_disk_is_low(disk_space)
    project = plan_project(draft)
    repository.add(project)
    return project


def refuse_incomplete_draft(draft: CreateProjectRequest) -> None:
    is_link = draft.source_kind is SourceKind.LINK
    if is_link and not LINK_PATTERN.match(draft.link.strip()):
        raise RefusedError("Paste the full link, starting with https://", SOURCE_SECTION)
    if not is_link and (not draft.file_name or draft.file_size_bytes == 0):
        raise RefusedError("Choose a video file first.", SOURCE_SECTION)
    if not draft.platforms:
        raise RefusedError("Turn on at least one platform.", PLATFORMS_SECTION)


def refuse_oversized_file(draft: CreateProjectRequest) -> None:
    is_file = draft.source_kind is SourceKind.FILE
    if is_file and draft.file_size_bytes > MAX_UPLOAD_GB * BYTES_PER_GB:
        raise RefusedError(
            f"This file is larger than {MAX_UPLOAD_GB} GB. Choose a smaller one.", SOURCE_SECTION
        )


def refuse_when_disk_is_low(disk_space: DiskSpace) -> None:
    if disk_space.free_bytes >= MIN_FREE_GB * BYTES_PER_GB:
        return
    shown_gb = min(round(disk_space.free_gb(), 1), MIN_FREE_GB - SHOWN_GB_STEP)
    raise RefusedError(
        f"Only {shown_gb:.1f} GB is free on this Mac, and a new project needs {MIN_FREE_GB} GB. "
        "Delete a project or free some space.",
        SOURCE_SECTION,
    )


def plan_project(draft: CreateProjectRequest) -> Project:
    is_link = draft.source_kind is SourceKind.LINK
    return Project(
        id=secrets.token_hex(ID_BYTES),
        title=LINK_TITLE if is_link else draft.file_name,
        source_kind=draft.source_kind,
        source_label=label_source(draft),
        link=draft.link.strip() if is_link else None,
        clip_length=draft.clip_length,
        platforms=tuple(dict.fromkeys(draft.platforms)),
        brief=draft.brief.strip(),
        status=ProjectStatus.QUEUED if is_link else ProjectStatus.UPLOADING,
        duration_seconds=None,
        steps=plan_steps(first_state=StepState.PENDING if is_link else StepState.RUNNING),
        halt_reason=None,
        upload=None if is_link else Upload(draft.file_name, draft.file_size_bytes, 0),
    )


def plan_steps(first_state: StepState) -> tuple[Step, ...]:
    later_steps = [Step(kind, StepState.PENDING, 0.0) for kind in STEP_ORDER[1:]]
    return (Step(STEP_ORDER[0], first_state, 0.0), *later_steps)


def label_source(draft: CreateProjectRequest) -> str:
    if draft.source_kind is SourceKind.FILE:
        return "Uploaded file"
    host = urlsplit(draft.link.strip()).hostname or ""
    is_youtube = host in ("youtu.be", "youtube.com") or host.endswith(".youtube.com")
    return "YouTube link" if is_youtube else "Video link"
