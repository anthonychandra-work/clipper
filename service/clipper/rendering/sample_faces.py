import shutil
import threading
from collections.abc import Callable, Sequence
from dataclasses import dataclass
from pathlib import Path

from PIL import Image

from ..media import MediaTools, MediaWorkStoppedError, SampleJob, sample_frames
from .find_faces import SEARCHED_LONGER_SIDE, Face, FaceFinder
from .follow_faces import MOMENTS_PER_SECOND
from .frame_picture import PictureShape

PICTURES_DIR_NAME = "moments"
ALL_SEARCHED = 100.0


@dataclass(frozen=True)
class FaceSearchJob:
    source: Path
    start_seconds: float
    seconds: float
    work_dir: Path


@dataclass(frozen=True)
class SampledFaces:
    moments: list[list[Face]]
    shape: PictureShape


class NoPictureError(Exception):
    def __init__(self, job: FaceSearchJob) -> None:
        stretch = f"{job.start_seconds:.2f} seconds and the {job.seconds:.2f} after them"
        super().__init__(f"{job.source.name} has no picture between {stretch}.")
        self.job = job


def sample_faces(
    job: FaceSearchJob,
    tools: MediaTools,
    stop: threading.Event,
    on_percent: Callable[[float], None],
) -> SampledFaces:
    pictures_dir = job.work_dir / PICTURES_DIR_NAME
    pictures_dir.mkdir()
    try:
        pictures = sample_frames(describe_sampling(job, pictures_dir), tools, stop)
        if not pictures:
            raise NoPictureError(job)
        return SampledFaces(search_pictures(pictures, stop, on_percent), read_shape(pictures[0]))
    finally:
        shutil.rmtree(pictures_dir)


def describe_sampling(job: FaceSearchJob, pictures_dir: Path) -> SampleJob:
    return SampleJob(
        video=job.source,
        start_seconds=job.start_seconds,
        seconds=job.seconds,
        per_second=MOMENTS_PER_SECOND,
        longest_side=SEARCHED_LONGER_SIDE,
        folder=pictures_dir,
    )


def search_pictures(
    pictures: Sequence[Path], stop: threading.Event, on_percent: Callable[[float], None]
) -> list[list[Face]]:
    finder = FaceFinder()
    moments: list[list[Face]] = []
    for searched, picture in enumerate(pictures, start=1):
        if stop.is_set():
            raise MediaWorkStoppedError()
        moments.append(finder.find_faces(picture))
        on_percent(ALL_SEARCHED * searched / len(pictures))
    return moments


def read_shape(picture: Path) -> PictureShape:
    with Image.open(picture) as opened:
        return PictureShape(*opened.size)
