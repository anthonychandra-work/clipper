import re
import threading
from dataclasses import dataclass
from http import HTTPStatus
from pathlib import Path

from ..problems import AppError, ConflictError, ProblemBody
from ..storage import DataFolder
from .project import Project, ProjectStatus, Upload
from .project_repository import ProjectRepository

MAX_PART_BYTES = 8 * 1024 * 1024
SOURCE_STEM = "source"
PLAIN_SUFFIX = re.compile(r"\.[a-z0-9]{1,8}")
UNKNOWN_SUFFIX = ".video"

append_lock = threading.Lock()


@dataclass(frozen=True)
class UploadPart:
    project_id: str
    offset: int
    content: bytes


class PartTooLargeError(AppError):
    status_code = HTTPStatus.REQUEST_ENTITY_TOO_LARGE

    def __init__(self) -> None:
        super().__init__("Send the file in parts of 8 MiB or less.")


class NotUploadingError(ConflictError):
    def __init__(self) -> None:
        super().__init__("This project is not waiting for an upload.")


class UploadOutOfStepError(ConflictError):
    def __init__(self, received_bytes: int) -> None:
        super().__init__("This part does not continue the upload from the bytes held.")
        self.received_bytes = received_bytes

    def describe(self) -> ProblemBody:
        return {**super().describe(), "receivedBytes": self.received_bytes}


def receive_upload_part(
    part: UploadPart, repository: ProjectRepository, data_folder: DataFolder
) -> int:
    with append_lock:
        project = repository.get(part.project_id)
        upload = require_upload(project)
        upload_file = data_folder.project_dir(project.id) / name_upload_file(upload.file_name)
        received_bytes = append_in_step(upload_file, part, upload.size_bytes)
        repository.record_received_bytes(project.id, received_bytes)
        if received_bytes == upload.size_bytes:
            repository.queue_uploaded(project.id)
        return received_bytes


def require_upload(project: Project) -> Upload:
    if project.status is not ProjectStatus.UPLOADING or project.upload is None:
        raise NotUploadingError()
    return project.upload


def name_upload_file(file_name: str) -> str:
    suffix = Path(file_name).suffix.lower()
    return SOURCE_STEM + (suffix if PLAIN_SUFFIX.fullmatch(suffix) else UNKNOWN_SUFFIX)


def append_in_step(upload_file: Path, part: UploadPart, declared_bytes: int) -> int:
    held_bytes = upload_file.stat().st_size if upload_file.exists() else 0
    if part.offset != held_bytes or held_bytes + len(part.content) > declared_bytes:
        raise UploadOutOfStepError(held_bytes)
    upload_file.parent.mkdir(parents=True, exist_ok=True)
    with upload_file.open("ab") as held:
        held.write(part.content)
    return held_bytes + len(part.content)
