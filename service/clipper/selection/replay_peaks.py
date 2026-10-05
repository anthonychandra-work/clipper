import json
import math
import statistics
from collections.abc import Sequence
from pathlib import Path
from typing import TypedDict

from .selection_records import ReplayPeak

OPENING_SHARE = 1 / 20
HIGHEST_SHARE = 1 / 10
TIMES_THE_MEDIAN = 1.5
ENCODING = "utf-8"


class GraphPoint(TypedDict):
    start_time: float
    end_time: float
    value: float


def read_replay_peaks(graph_file: Path) -> list[ReplayPeak]:
    if not graph_file.is_file():
        return []
    points: list[GraphPoint] = json.loads(graph_file.read_text(encoding=ENCODING))
    return find_replay_peaks(points)


def find_replay_peaks(points: Sequence[GraphPoint]) -> list[ReplayPeak]:
    in_order = sorted(points, key=lambda point: point["start_time"])
    after_the_opening = leave_out_the_opening(in_order)
    return join_neighbours(after_the_opening, find_high_positions(after_the_opening))


def leave_out_the_opening(points: Sequence[GraphPoint]) -> list[GraphPoint]:
    if not points:
        return []
    opening_ends = points[-1]["end_time"] * OPENING_SHARE
    return [point for point in points if point["start_time"] >= opening_ends]


def find_high_positions(points: Sequence[GraphPoint]) -> list[int]:
    if not points:
        return []
    median = statistics.median(point["value"] for point in points)
    highest_first = sorted(range(len(points)), key=lambda at: (-points[at]["value"], at))
    among_the_highest = highest_first[: math.ceil(len(points) * HIGHEST_SHARE)]
    return sorted(at for at in among_the_highest if stands_out(points[at]["value"], median))


def stands_out(value: float, median: float) -> bool:
    least = median * TIMES_THE_MEDIAN
    return value > median and (value >= least or math.isclose(value, least))


def join_neighbours(
    points: Sequence[GraphPoint], high_positions: Sequence[int]
) -> list[ReplayPeak]:
    peaks: list[ReplayPeak] = []
    previous: int | None = None
    for at in high_positions:
        is_beside_the_last = previous is not None and at == previous + 1
        starts_at = peaks.pop().start_seconds if is_beside_the_last else points[at]["start_time"]
        peaks.append(ReplayPeak(starts_at, points[at]["end_time"]))
        previous = at
    return peaks
