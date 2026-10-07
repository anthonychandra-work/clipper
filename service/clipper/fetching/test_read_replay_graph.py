import pytest

from .read_replay_graph import read_replay_graph

POINTS = [
    {"start_time": 0.0, "end_time": 2.36, "value": 1.0},
    {"start_time": 2.36, "end_time": 4.71, "value": 0.31},
    {"start_time": 4.71, "end_time": 7.07, "value": 0},
]


def test_the_graph_is_read_from_the_heatmap_of_the_metadata_in_the_form_it_has() -> None:
    info = {"id": "talk", "title": "Talk", "duration": 235.7, "heatmap": POINTS}

    assert read_replay_graph(info) == [
        {"start_time": 0.0, "end_time": 2.36, "value": 1.0},
        {"start_time": 2.36, "end_time": 4.71, "value": 0.31},
        {"start_time": 4.71, "end_time": 7.07, "value": 0.0},
    ]


def test_metadata_without_a_graph_gives_nothing() -> None:
    assert read_replay_graph({"id": "talk", "title": "Talk"}) is None
    assert read_replay_graph({}) is None


@pytest.mark.parametrize("heatmap", [None, [], "high in the middle", {"start_time": 0}])
def test_an_empty_graph_or_one_that_is_no_list_of_points_gives_nothing(heatmap: object) -> None:
    assert read_replay_graph({"heatmap": heatmap}) is None


@pytest.mark.parametrize(
    "broken",
    [
        {"start_time": 7.07, "end_time": 9.43},
        {"start_time": 7.07, "end_time": 9.43, "value": "high"},
        {"start_time": None, "end_time": 9.43, "value": 0.2},
        {"start_time": 7.07, "end_time": 9.43, "value": True},
        [7.07, 9.43, 0.2],
    ],
)
def test_a_graph_with_a_point_that_cannot_be_read_gives_nothing(broken: object) -> None:
    assert read_replay_graph({"heatmap": [*POINTS, broken]}) is None
