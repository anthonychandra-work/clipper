import shutil
import threading
from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path

from ..media import MediaTools
from ..projects import Project
from ..review import Decision, Look, ReviewSources, StandingClip, read_standing_review
from .draw_overlays import OverlayLook, draw_overlays
from .encode_clip import encode_clip
from .frame_picture import choose_framing, frame_picture
from .overlay_timeline import time_overlays
from .render_plan import RenderPlan
from .sample_faces import FaceSearchJob, sample_faces

FACE_SEARCH_PERCENT = 10.0
WHOLE_BAR = 100.0


class SourceGoneError(Exception):
    def __init__(self, project_id: str) -> None:
        super().__init__(f"Project {project_id} has no source video on this Mac.")


class ClipNotKeptError(Exception):
    def __init__(self, clip_id: str) -> None:
        super().__init__(f"Clip {clip_id} is not a kept clip of its project.")


@dataclass(frozen=True)
class RenderWork:
    sources: ReviewSources
    tools: MediaTools


@dataclass(frozen=True)
class ClipRender:
    project: Project
    clip_id: str
    stop: threading.Event
    report_percent: Callable[[float], None]


@dataclass(frozen=True)
class RenderJob:
    clip: StandingClip
    look: Look
    source: Path
    work_dir: Path
    target: Path


def render_clip(render: ClipRender, work: RenderWork) -> None:
    job = describe_job(render, work)
    empty_folder(job.work_dir)
    try:
        plan = plan_render(job, render, work.tools)
        job.target.parent.mkdir(exist_ok=True)
        report_encoding = share_bar(render.report_percent, FACE_SEARCH_PERCENT, WHOLE_BAR)
        encode_clip(plan, work.tools, render.stop, report_encoding)
    finally:
        shutil.rmtree(job.work_dir)


def describe_job(render: ClipRender, work: RenderWork) -> RenderJob:
    project_id, data_folder = render.project.id, work.sources.data_folder
    standing = read_standing_review(render.project, work.sources)
    kept = [clip for clip in standing.clips if clip.decision is Decision.KEEP]
    clip = next((clip for clip in kept if clip.candidate.id == render.clip_id), None)
    if clip is None:
        raise ClipNotKeptError(render.clip_id)
    source = data_folder.find_source_file(project_id)
    if source is None:
        raise SourceGoneError(project_id)
    return RenderJob(
        clip=clip,
        look=standing.look,
        source=source,
        work_dir=data_folder.render_work_dir(project_id, clip.candidate.id),
        target=data_folder.export_file(project_id, clip.candidate.rank, clip.candidate.id),
    )


def empty_folder(folder: Path) -> None:
    if folder.exists():
        shutil.rmtree(folder)
    folder.mkdir()


def plan_render(job: RenderJob, render: ClipRender, tools: MediaTools) -> RenderPlan:
    clip, look = job.clip, job.look
    stretch = FaceSearchJob(job.source, clip.times.start_seconds, clip.seconds, job.work_dir)
    report_search = share_bar(render.report_percent, 0.0, FACE_SEARCH_PERCENT)
    sampled = sample_faces(stretch, tools, render.stop, report_search)
    framing = choose_framing(sampled.moments, look.framing)
    hook_title = clip.candidate.hook_title.strip() if look.show_hook_title else ""
    changes = time_overlays(clip.captions, clip.seconds, hook_title or None)
    overlay_look = OverlayLook(look.caption_style, framing)
    return RenderPlan(
        source=job.source,
        start_seconds=clip.times.start_seconds,
        seconds=clip.seconds,
        work_dir=job.work_dir,
        target=job.target,
        layout=frame_picture(sampled.moments, sampled.shape, framing),
        overlays=draw_overlays(changes, overlay_look, job.work_dir, render.stop),
    )


def share_bar(
    report_percent: Callable[[float], None], from_percent: float, to_percent: float
) -> Callable[[float], None]:
    def report_share(percent: float) -> None:
        report_percent(from_percent + (to_percent - from_percent) * percent / WHOLE_BAR)

    return report_share
