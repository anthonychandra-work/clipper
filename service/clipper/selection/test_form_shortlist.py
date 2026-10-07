import pytest

from .form_shortlist import count_shortlist, form_shortlist
from .selection_records import WindowRecord
from .split_windows import Window

MANY_WINDOWS = 200


def make_windows(count: int) -> list[Window]:
    return [
        Window(f"w{number:02d}", number, number, 60.0 * (number - 1), 60.0 * number + 30)
        for number in range(1, count + 1)
    ]


def list_shortlisted(records: list[WindowRecord]) -> list[str]:
    return [record.window.id for record in records if record.is_shortlisted]


@pytest.mark.parametrize(
    ("minutes", "size"),
    [(4, 3), (10, 3), (10.5, 4), (35, 6), (70, 9), (71, 10), (180, 10)],
)
def test_the_shortlist_grows_with_the_length_of_the_video(minutes: float, size: int) -> None:
    assert count_shortlist(minutes * 60, MANY_WINDOWS) == size


@pytest.mark.parametrize(("minutes", "size"), [(0.5, 3), (20, 4), (20.01, 5), (69.99, 9)])
def test_one_more_window_is_taken_for_each_further_ten_minutes_begun(
    minutes: float, size: int
) -> None:
    assert count_shortlist(minutes * 60, MANY_WINDOWS) == size


def test_the_shortlist_never_holds_more_windows_than_the_transcript_has() -> None:
    assert count_shortlist(35 * 60, 2) == 2
    assert count_shortlist(35 * 60, 0) == 0


def test_the_windows_with_the_highest_scores_are_taken() -> None:
    windows = make_windows(5)
    scores = {"w01": 10, "w02": 90, "w03": 55, "w04": 70, "w05": 54}

    records = form_shortlist(windows, scores, duration_seconds=240)

    assert list_shortlisted(records) == ["w02", "w03", "w04"]


def test_every_window_is_kept_with_its_score_in_the_order_of_the_windows() -> None:
    windows = make_windows(5)
    scores = {"w01": 10, "w02": 90, "w03": 55, "w04": 70, "w05": 54}

    records = form_shortlist(windows, scores, duration_seconds=240)

    assert [record.window for record in records] == windows
    assert [record.score for record in records] == [10, 90, 55, 70, 54]


def test_fewer_windows_than_the_shortlist_holds_are_all_taken() -> None:
    records = form_shortlist(make_windows(2), {"w01": 0, "w02": 3}, duration_seconds=240)

    assert list_shortlisted(records) == ["w01", "w02"]


def test_of_two_equal_scores_the_earlier_window_is_taken() -> None:
    windows = make_windows(5)
    scores = {"w01": 40, "w02": 80, "w03": 40, "w04": 80, "w05": 40}

    records = form_shortlist(windows, scores, duration_seconds=240)

    assert list_shortlisted(records) == ["w01", "w02", "w04"]


def test_a_longer_video_takes_more_of_the_same_windows() -> None:
    windows = make_windows(12)
    scores = {window.id: 100 - number for number, window in enumerate(windows)}

    records = form_shortlist(windows, scores, duration_seconds=35 * 60)

    assert list_shortlisted(records) == ["w01", "w02", "w03", "w04", "w05", "w06"]
