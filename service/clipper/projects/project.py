from dataclasses import dataclass
from enum import StrEnum


class SourceKind(StrEnum):
    LINK = "link"
    FILE = "file"


class ClipLength(StrEnum):
    SHORT = "short"
    STANDARD = "standard"
    LONG = "long"


class Platform(StrEnum):
    TIKTOK = "tiktok"
    REELS = "reels"
    SHORTS = "shorts"


class ProjectStatus(StrEnum):
    UPLOADING = "uploading"
    QUEUED = "queued"
    PROCESSING = "processing"
    FAILED = "failed"
    STOPPED = "stopped"
    FETCHED = "fetched"
    TRANSCRIBED = "transcribed"
    READY = "ready"
    EXPORTED = "exported"


class StepKind(StrEnum):
    FETCH = "fetch"
    MODEL = "model"
    TRANSCRIBE = "transcribe"
    SCORE = "score"
    CUT = "cut"


class StepState(StrEnum):
    PENDING = "pending"
    RUNNING = "running"
    DONE = "done"


# A project is created with these four; a step of another kind is added ahead of one of them.
STEP_ORDER = (StepKind.FETCH, StepKind.TRANSCRIBE, StepKind.SCORE, StepKind.CUT)
ARRIVAL_SHARE_PERCENT = 70.0
LATER_STEP_LABELS = {
    StepKind.MODEL: "Downloading the transcription model",
    StepKind.TRANSCRIBE: "Transcribing on this Mac",
    StepKind.SCORE: "Scoring windows",
    StepKind.CUT: "Cutting clips",
}


@dataclass(frozen=True)
class Step:
    kind: StepKind
    state: StepState
    percent: float
    label: str | None = None


@dataclass(frozen=True)
class Upload:
    file_name: str
    size_bytes: int
    received_bytes: int


@dataclass(frozen=True)
class Project:
    id: str
    title: str
    source_kind: SourceKind
    source_label: str
    link: str | None
    clip_length: ClipLength
    platforms: tuple[Platform, ...]
    brief: str
    status: ProjectStatus
    duration_seconds: float | None
    steps: tuple[Step, ...]
    halt_reason: str | None
    upload: Upload | None

    def percent(self) -> float:
        shares = self._share_out_steps()
        return sum(sum(share) / len(share) for share in shares) / len(shares)

    def _share_out_steps(self) -> list[list[float]]:
        shares: list[list[float]] = [[]]
        for step in self.steps:
            shares[-1].append(step.percent)
            if step.kind in STEP_ORDER:
                shares.append([])
        return [share for share in shares if share]

    def first_unfinished_step(self) -> Step | None:
        return next((step for step in self.steps if step.state is not StepState.DONE), None)

    def label_of_kind(self, kind: StepKind) -> str:
        return self.label_of(next(step for step in self.steps if step.kind is kind))

    def label_of(self, step: Step) -> str:
        if step.label is not None:
            return step.label
        if step.kind is not StepKind.FETCH:
            return LATER_STEP_LABELS[step.kind]
        if self.source_kind is SourceKind.LINK:
            return "Fetching video"
        return "Uploading video" if self.status is ProjectStatus.UPLOADING else "Preparing video"
