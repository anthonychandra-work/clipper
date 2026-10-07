from ..projects import Project
from ..review import StandingClip, read_standing_review
from .describe_export import ExportSources, ProjectExports


def list_exported_clips(project: Project, sources: ExportSources) -> list[StandingClip]:
    renders = sources.renders.list_renders(project.id)
    if not any(render.has_export for render in renders.values()):
        return []
    exports = ProjectExports(project, renders, sources.review.data_folder)
    standing = read_standing_review(project, sources.review)
    return [clip for clip in standing.clips if exports.has_finished_file(clip.candidate)]
