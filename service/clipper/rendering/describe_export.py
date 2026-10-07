from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from pathlib import Path

from ..projects import Platform, Project
from ..review import Decision, Look, ReviewSources, StandingClip, read_standing_review
from ..selection import Candidate, PlatformTexts
from ..storage import DataFolder
from .export_schemas import (
    NEVER_QUEUED,
    ExportClipResponse,
    ExportLookResponse,
    ExportResponse,
    PlatformTextResponse,
    RenderResponse,
)
from .render_records import Render, RenderState
from .render_store import RenderStore

PERCENT_DECIMALS = 1
NOT_RENDERED = RenderResponse(state=NEVER_QUEUED, percent=0.0, reason=None)


@dataclass(frozen=True)
class ExportSources:
    review: ReviewSources
    renders: RenderStore


@dataclass(frozen=True)
class ProjectExports:
    project: Project
    renders: Mapping[str, Render]
    data_folder: DataFolder

    def find_file(self, candidate: Candidate) -> Path:
        return self.data_folder.export_file(self.project.id, candidate.rank, candidate.id)

    def has_finished_file(self, candidate: Candidate) -> bool:
        render = self.renders.get(candidate.id)
        return render is not None and render.has_export and self.find_file(candidate).is_file()


def describe_export(project: Project, sources: ExportSources) -> ExportResponse:
    data_folder = sources.review.data_folder
    look, kept_clips = read_kept_clips(project, sources.review)
    exports = ProjectExports(project, sources.renders.list_renders(project.id), data_folder)
    return ExportResponse(
        look=ExportLookResponse(
            caption_style=look.caption_style,
            framing=look.framing,
            show_hook_title=look.show_hook_title,
        ),
        has_source=data_folder.find_source_file(project.id) is not None,
        platforms=list_chosen_platforms(project),
        clips=[describe_clip(clip, exports) for clip in kept_clips],
    )


def read_kept_clips(project: Project, review: ReviewSources) -> tuple[Look, list[StandingClip]]:
    if project.kept_count == 0:
        return review.reviews.read_look(project.id), []
    standing = read_standing_review(project, review)
    return standing.look, [clip for clip in standing.clips if clip.decision is Decision.KEEP]


def list_chosen_platforms(project: Project) -> list[Platform]:
    return [platform for platform in Platform if platform in project.platforms]


def describe_clip(clip: StandingClip, exports: ProjectExports) -> ExportClipResponse:
    candidate, project = clip.candidate, exports.project
    has_file = exports.has_finished_file(candidate)
    project_dir = exports.data_folder.project_dir(project.id)
    address = f"/api/projects/{project.id}/clips/{candidate.id}/export"
    return ExportClipResponse(
        id=candidate.id,
        rank=candidate.rank,
        title=clip.title,
        seconds=clip.seconds,
        file=exports.find_file(candidate).relative_to(project_dir).as_posix(),
        render=describe_render(exports.renders.get(candidate.id), has_file),
        download=address if has_file else None,
        texts=list_texts(candidate.platforms, list_chosen_platforms(project)),
    )


def describe_render(render: Render | None, has_file: bool) -> RenderResponse:
    if render is None or (render.state is RenderState.DONE and not has_file):
        return NOT_RENDERED
    return RenderResponse(
        state=render.state, percent=round(render.percent, PERCENT_DECIMALS), reason=render.reason
    )


def list_texts(written: PlatformTexts, chosen: Sequence[Platform]) -> list[PlatformTextResponse]:
    by_platform = {
        Platform.TIKTOK: written.tiktok,
        Platform.REELS: written.reels,
        Platform.SHORTS: written.shorts,
    }
    return [
        PlatformTextResponse(
            platform=platform,
            title=by_platform[platform].title,
            description=by_platform[platform].description,
        )
        for platform in chosen
    ]
