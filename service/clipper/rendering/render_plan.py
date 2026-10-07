from collections.abc import Sequence
from dataclasses import dataclass
from pathlib import Path

FRAME_WIDTH = 1080
FRAME_HEIGHT = 1920
FRAMES_PER_SECOND = 30


@dataclass(frozen=True)
class Place:
    left: float
    top: float


@dataclass(frozen=True)
class PicturePart:
    width: float
    height: float
    places: Sequence[Place]


@dataclass(frozen=True)
class SpeakerLayout:
    part: PicturePart


@dataclass(frozen=True)
class StackedLayout:
    upper: PicturePart
    lower: PicturePart


@dataclass(frozen=True)
class WholePictureLayout:
    pass


type Layout = SpeakerLayout | StackedLayout | WholePictureLayout


@dataclass(frozen=True)
class TimedOverlay:
    picture: str
    start_seconds: float


@dataclass(frozen=True)
class RenderPlan:
    source: Path
    start_seconds: float
    seconds: float
    work_dir: Path
    target: Path
    layout: Layout
    overlays: Sequence[TimedOverlay]
