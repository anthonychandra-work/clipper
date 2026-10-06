import logging
import shutil
import threading

from ..media import FrameJob, MediaTools, NoFrameError, grab_frame
from ..selection import Candidate, ChosenClips
from ..storage import DataFolder
from .trim_reach import find_trim_reach, list_reach

FRAMES_PER_CLIP = 12
FRAME_HEIGHT = 104
ALL_FRAMES_PERCENT = 100.0

log = logging.getLogger("clipper.review")


class FilmstripMaker:
    def __init__(self, data_folder: DataFolder, tools: MediaTools) -> None:
        self._data_folder = data_folder
        self._tools = tools

    def make_frames(self, chosen: ChosenClips) -> None:
        frames_dir = self._data_folder.frames_dir(chosen.project_id)
        if frames_dir.exists():
            shutil.rmtree(frames_dir)
        frames_dir.mkdir(parents=True)
        jobs = [
            job for candidate in chosen.candidates for job in self._plan_frames(chosen, candidate)
        ]
        for taken, job in enumerate(jobs, start=1):
            self._take(job, chosen.stop)
            chosen.report_percent(ALL_FRAMES_PERCENT * taken / len(jobs))

    def _plan_frames(self, chosen: ChosenClips, candidate: Candidate) -> list[FrameJob]:
        reached = list_reach(find_trim_reach(candidate, chosen.sentences), chosen.sentences)
        preview = self._data_folder.preview_file(chosen.project_id)
        return [
            FrameJob(
                video=preview,
                target=self._data_folder.frame_file(chosen.project_id, candidate.id, number),
                at_seconds=moment,
                height=FRAME_HEIGHT,
            )
            for number, moment in enumerate(
                list_frame_moments(reached[0].start, reached[-1].end), start=1
            )
        ]

    def _take(self, job: FrameJob, stop: threading.Event) -> None:
        try:
            grab_frame(job, self._tools, stop)
        except NoFrameError as missing:
            log.warning("The filmstrip frame %s was left out: %s", job.target.name, missing)


def list_frame_moments(start_seconds: float, end_seconds: float) -> list[float]:
    twelfth = (end_seconds - start_seconds) / FRAMES_PER_CLIP
    return [start_seconds + (place + 0.5) * twelfth for place in range(FRAMES_PER_CLIP)]
