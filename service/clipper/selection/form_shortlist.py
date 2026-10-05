import math
from collections.abc import Mapping, Sequence

from .selection_records import WindowRecord
from .split_windows import Window

SHORTEST_SHORTLIST = 3
LONGEST_SHORTLIST = 10
MINUTES_PER_FURTHER_WINDOW = 10
SECONDS_PER_MINUTE = 60


def form_shortlist(
    windows: Sequence[Window], scores: Mapping[str, int], duration_seconds: float
) -> list[WindowRecord]:
    size = count_shortlist(duration_seconds, len(windows))
    best_first = sorted(windows, key=lambda window: (-scores[window.id], window.start_seconds))
    shortlisted = {window.id for window in best_first[:size]}
    return [
        WindowRecord(window, score=scores[window.id], is_shortlisted=window.id in shortlisted)
        for window in windows
    ]


def count_shortlist(duration_seconds: float, window_count: int) -> int:
    minutes = duration_seconds / SECONDS_PER_MINUTE
    by_length = SHORTEST_SHORTLIST - 1 + math.ceil(minutes / MINUTES_PER_FURTHER_WINDOW)
    return min(window_count, LONGEST_SHORTLIST, max(SHORTEST_SHORTLIST, by_length))
