from collections.abc import Mapping
from typing import TypedDict

from typing_extensions import TypeIs

GRAPH_FIELD = "heatmap"


class ReplayPoint(TypedDict):
    start_time: float
    end_time: float
    value: float


def read_replay_graph(info: Mapping[str, object]) -> list[ReplayPoint] | None:
    given = info.get(GRAPH_FIELD)
    if not isinstance(given, list) or not given:
        return None
    points = [read_point(point) for point in given]
    readable = [point for point in points if point is not None]
    return readable if len(readable) == len(points) else None


def read_point(given: object) -> ReplayPoint | None:
    if not isinstance(given, Mapping):
        return None
    start, end, value = given.get("start_time"), given.get("end_time"), given.get("value")
    if not (is_number(start) and is_number(end) and is_number(value)):
        return None
    return ReplayPoint(start_time=float(start), end_time=float(end), value=float(value))


def is_number(part: object) -> TypeIs[float]:
    return isinstance(part, int | float) and not isinstance(part, bool)
