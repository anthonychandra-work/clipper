from collections.abc import Sequence
from dataclasses import dataclass

from .clip_proposal import ProposedClip
from .place_quote import Placement
from .selection_records import Candidate, Subscores
from .selection_task import ClipSeconds

HUNDREDTHS = 100


@dataclass(frozen=True)
class PlacedClip:
    proposal: ProposedClip
    placement: Placement

    @property
    def total(self) -> int:
        return sum(self.proposal.scores.model_dump().values())

    @property
    def length_hundredths(self) -> int:
        return round((self.placement.end_seconds - self.placement.start_seconds) * HUNDREDTHS)


def choose_candidates(
    placed_clips: Sequence[PlacedClip], limits: ClipSeconds, most_kept: int
) -> list[Candidate]:
    inside_the_preset = [clip for clip in placed_clips if lasts_inside(clip, limits)]
    best_first = sorted(
        inside_the_preset, key=lambda clip: (-clip.total, clip.placement.start_seconds)
    )
    kept: list[PlacedClip] = []
    for clip in best_first:
        if not any(overlaps_by_more_than_half(clip, earlier) for earlier in kept):
            kept.append(clip)
    return [describe_candidate(rank, clip) for rank, clip in enumerate(kept[:most_kept], start=1)]


def lasts_inside(clip: PlacedClip, limits: ClipSeconds) -> bool:
    return limits.min * HUNDREDTHS <= clip.length_hundredths <= limits.max * HUNDREDTHS


def overlaps_by_more_than_half(clip: PlacedClip, other: PlacedClip) -> bool:
    shared_from = max(clip.placement.start_seconds, other.placement.start_seconds)
    shared_until = min(clip.placement.end_seconds, other.placement.end_seconds)
    shared_hundredths = round((shared_until - shared_from) * HUNDREDTHS)
    return 2 * shared_hundredths > min(clip.length_hundredths, other.length_hundredths)


def describe_candidate(rank: int, clip: PlacedClip) -> Candidate:
    proposal = clip.proposal
    return Candidate(
        id=f"c{rank:02d}",
        rank=rank,
        start_seconds=clip.placement.start_seconds,
        end_seconds=clip.placement.end_seconds,
        scores=Subscores(**proposal.scores.model_dump()),
        reason=proposal.reason,
        title=proposal.title,
        hook_title=proposal.hook_title,
        hook_type=proposal.hook_type,
        platforms=proposal.platforms,
        flag=proposal.flag.kind if proposal.flag else None,
        flag_note=proposal.flag.note if proposal.flag else None,
        is_replay_peak=False,
    )
