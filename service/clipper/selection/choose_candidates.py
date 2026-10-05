from collections.abc import Sequence
from dataclasses import dataclass

from .clip_proposal import ProposedClip
from .place_quote import Placement
from .selection_records import Candidate, ReplayPeak, Subscores
from .selection_task import ClipSeconds

HUNDREDTHS = 100
SHARED_WITH_A_PEAK_HUNDREDTHS = 1 * HUNDREDTHS


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
    placed_clips: Sequence[PlacedClip],
    limits: ClipSeconds,
    most_kept: int,
    peaks: Sequence[ReplayPeak] = (),
) -> list[Candidate]:
    inside_the_preset = [clip for clip in placed_clips if lasts_inside(clip, limits)]
    with_markers = [(clip, lies_under_a_peak(clip, peaks)) for clip in inside_the_preset]
    best_first = sorted(with_markers, key=rank_before)
    kept: list[tuple[PlacedClip, bool]] = []
    for clip, is_marked in best_first:
        if not any(overlaps_by_more_than_half(clip, earlier) for earlier, _ in kept):
            kept.append((clip, is_marked))
    return [
        describe_candidate(rank, clip, is_replay_peak=is_marked)
        for rank, (clip, is_marked) in enumerate(kept[:most_kept], start=1)
    ]


def rank_before(marked_clip: tuple[PlacedClip, bool]) -> tuple[int, bool, float]:
    clip, is_marked = marked_clip
    return -clip.total, not is_marked, clip.placement.start_seconds


def lasts_inside(clip: PlacedClip, limits: ClipSeconds) -> bool:
    return limits.min * HUNDREDTHS <= clip.length_hundredths <= limits.max * HUNDREDTHS


def lies_under_a_peak(clip: PlacedClip, peaks: Sequence[ReplayPeak]) -> bool:
    return any(
        measure_shared_hundredths(clip.placement, peak.start_seconds, peak.end_seconds)
        >= SHARED_WITH_A_PEAK_HUNDREDTHS
        for peak in peaks
    )


def overlaps_by_more_than_half(clip: PlacedClip, other: PlacedClip) -> bool:
    shared = measure_shared_hundredths(
        clip.placement, other.placement.start_seconds, other.placement.end_seconds
    )
    return 2 * shared > min(clip.length_hundredths, other.length_hundredths)


def measure_shared_hundredths(
    placement: Placement, start_seconds: float, end_seconds: float
) -> int:
    shared_from = max(placement.start_seconds, start_seconds)
    shared_until = min(placement.end_seconds, end_seconds)
    return round((shared_until - shared_from) * HUNDREDTHS)


def describe_candidate(rank: int, clip: PlacedClip, *, is_replay_peak: bool) -> Candidate:
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
        is_replay_peak=is_replay_peak,
    )
