import math
from collections import Counter
from collections.abc import Sequence

from .history_records import LAST_DECISIONS, Outcome, PastDecision, count_rejections

FEWEST_OUTCOMES_COMPARED = 3
THIRDS = 3


def write_note(newest_decisions: Sequence[PastDecision], outcomes: Sequence[Outcome]) -> str | None:
    lines = (describe_rejections(newest_decisions[:LAST_DECISIONS]), describe_outcomes(outcomes))
    return "\n".join(line for line in lines if line is not None) or None


def describe_rejections(decisions: Sequence[PastDecision]) -> str | None:
    rejected_count = sum(decision.is_rejection for decision in decisions)
    if rejected_count == 0:
        return None
    reasons = count_rejections(decisions)
    return (
        f"Of the last {len(decisions)} clips this user decided on, {rejected_count} were "
        f"rejected: {reasons.cut_off} cut off mid-thought, {reasons.not_interesting} not "
        f"interesting, {reasons.needs_context} needing earlier context, {reasons.repeat} "
        "repeating another clip."
    )


def describe_outcomes(outcomes: Sequence[Outcome]) -> str | None:
    if len(outcomes) < FEWEST_OUTCOMES_COMPARED:
        return None
    most_viewed_first = sorted(outcomes, key=lambda outcome: outcome.views, reverse=True)
    third = len(outcomes) // THIRDS
    best, worst = most_viewed_first[:third], most_viewed_first[-third:]
    return (
        f"Of {len(outcomes)} posted clips with views logged, the best third opened with these "
        f"hooks: {describe_third(best)}. The worst third opened with: {describe_third(worst)}."
    )


def describe_third(clips: Sequence[Outcome]) -> str:
    hooks = Counter(clip.hook_type for clip in clips).most_common()
    named = ", ".join(f"{hook_type} {clip_count}" for hook_type, clip_count in hooks)
    return f"{named}, and lasted {describe_lengths(clips)} seconds"


def describe_lengths(clips: Sequence[Outcome]) -> str:
    whole_seconds = [math.floor(clip.seconds + 0.5) for clip in clips]
    shortest, longest = min(whole_seconds), max(whole_seconds)
    return str(shortest) if shortest == longest else f"{shortest} to {longest}"
