import json
from pathlib import Path

from .replay_peaks import GraphPoint, find_replay_peaks, read_replay_peaks
from .selection_records import ReplayPeak

POINT_SECONDS = 2.0
LOW = 0.1


def make_graph(values: list[float]) -> list[GraphPoint]:
    return [
        {"start_time": at * POINT_SECONDS, "end_time": (at + 1) * POINT_SECONDS, "value": value}
        for at, value in enumerate(values)
    ]


def make_low_graph(high: dict[int, float], point_count: int = 100) -> list[GraphPoint]:
    return make_graph([high.get(at, LOW) for at in range(point_count)])


def test_the_high_first_point_of_a_graph_is_no_peak() -> None:
    assert find_replay_peaks(make_low_graph({0: 1.0})) == []


def test_a_high_point_anywhere_in_the_first_twentieth_is_no_peak() -> None:
    graph = make_low_graph({0: 1.0, 4: 0.9, 5: 0.9})

    assert find_replay_peaks(graph) == [ReplayPeak(10.0, 12.0)]


def test_a_flat_graph_has_no_peak() -> None:
    assert find_replay_peaks(make_graph([0.4] * 100)) == []


def test_a_graph_that_is_flat_at_nothing_has_no_peak() -> None:
    assert find_replay_peaks(make_graph([0.0] * 100)) == []


def test_one_rise_over_a_graph_that_is_otherwise_at_nothing_is_a_peak() -> None:
    graph = make_graph([0.0] * 60 + [0.8] + [0.0] * 39)

    assert find_replay_peaks(graph) == [ReplayPeak(120.0, 122.0)]


def test_one_high_point_is_a_peak_of_its_own_length() -> None:
    assert find_replay_peaks(make_low_graph({60: 0.9})) == [ReplayPeak(120.0, 122.0)]


def test_two_high_points_side_by_side_form_one_peak() -> None:
    assert find_replay_peaks(make_low_graph({60: 0.9, 61: 0.7})) == [ReplayPeak(120.0, 124.0)]


def test_high_points_with_a_low_one_between_them_are_two_peaks() -> None:
    peaks = find_replay_peaks(make_low_graph({60: 0.9, 62: 0.7}))

    assert peaks == [ReplayPeak(120.0, 122.0), ReplayPeak(124.0, 126.0)]


def test_neighbours_form_one_peak_although_their_shared_edge_is_not_the_same_number() -> None:
    graph = make_low_graph({60: 0.9, 61: 0.7})
    graph[61]["start_time"] = 122.0000001

    assert find_replay_peaks(graph) == [ReplayPeak(120.0, 124.0)]


def test_a_point_among_the_highest_that_stays_under_one_and_a_half_medians_is_no_peak() -> None:
    assert find_replay_peaks(make_low_graph({60: 0.14})) == []
    assert find_replay_peaks(make_low_graph({60: 0.16})) == [ReplayPeak(120.0, 122.0)]


def test_a_point_at_exactly_one_and_a_half_medians_reaches_it_whatever_the_rounding() -> None:
    assert LOW * 1.5 != 0.15
    assert find_replay_peaks(make_low_graph({60: 0.15})) == [ReplayPeak(120.0, 122.0)]


def test_only_the_tenth_of_the_points_with_the_highest_values_can_be_peaks() -> None:
    graph = make_low_graph({at: 0.5 + at / 1000 for at in range(20, 40)})

    peaks = find_replay_peaks(graph)

    assert peaks == [ReplayPeak(60.0, 80.0)]


def test_points_given_out_of_order_are_read_in_the_order_of_their_starts() -> None:
    graph = make_low_graph({60: 0.9, 61: 0.7})

    assert find_replay_peaks(list(reversed(graph))) == [ReplayPeak(120.0, 124.0)]


def test_no_points_give_no_peak() -> None:
    assert find_replay_peaks([]) == []


def test_the_peaks_of_a_stored_graph_are_read_from_its_file(tmp_path: Path) -> None:
    graph_file = tmp_path / "replay-graph.json"
    graph_file.write_text(json.dumps(make_low_graph({60: 0.9, 61: 0.7})))

    assert read_replay_peaks(graph_file) == [ReplayPeak(120.0, 124.0)]


def test_a_project_without_a_stored_graph_has_no_peak(tmp_path: Path) -> None:
    assert read_replay_peaks(tmp_path / "replay-graph.json") == []
