from ..learning import ClipKey, Outcome
from ..rendering import list_exported_clips
from ..review import ChangeRefusedError, ClipAddress, StandingClip
from .describe_results import ResultsSources


def log_views(address: ClipAddress, views: int | None, sources: ResultsSources) -> None:
    clip = find_exported_clip(address, sources)
    logged = ClipKey(address.project.id, address.clip_id)
    if views is None:
        sources.views.clear_views(logged)
        return
    sources.views.save_views(Outcome(logged, views, clip.candidate.hook_type, clip.seconds))


def find_exported_clip(address: ClipAddress, sources: ResultsSources) -> StandingClip:
    exported = list_exported_clips(address.project, sources.exports)
    found = next((clip for clip in exported if clip.candidate.id == address.clip_id), None)
    if found is None:
        raise ChangeRefusedError()
    return found
