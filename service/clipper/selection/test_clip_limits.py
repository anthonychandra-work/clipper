import pytest

from ..projects import ClipLength
from ..settings import ClipsPerVideo
from .clip_limits import ClipCounts, count_clips, find_clip_limits
from .selection_task import ClipSeconds

TEN_MINUTES = 600


@pytest.mark.parametrize(
    ("clip_length", "limits"),
    [
        (ClipLength.SHORT, ClipSeconds(min=15, max=30)),
        (ClipLength.STANDARD, ClipSeconds(min=25, max=60)),
        (ClipLength.LONG, ClipSeconds(min=60, max=180)),
    ],
)
def test_each_preset_has_its_limits_in_seconds(
    clip_length: ClipLength, limits: ClipSeconds
) -> None:
    assert find_clip_limits(clip_length) == limits


def test_every_clip_length_a_project_can_have_has_limits() -> None:
    assert all(find_clip_limits(clip_length).min > 0 for clip_length in ClipLength)


@pytest.mark.parametrize("seconds", [20, 235.7, TEN_MINUTES - 0.01])
def test_on_auto_a_video_under_ten_minutes_is_asked_for_two_and_keeps_twelve(
    seconds: float,
) -> None:
    assert count_clips(ClipsPerVideo.AUTO, seconds) == ClipCounts(asked_for=2, kept=12)


@pytest.mark.parametrize("seconds", [TEN_MINUTES, 2100, 3 * 60 * 60])
def test_on_auto_a_video_from_ten_minutes_on_is_asked_for_four_and_keeps_twelve(
    seconds: float,
) -> None:
    assert count_clips(ClipsPerVideo.AUTO, seconds) == ClipCounts(asked_for=4, kept=12)


@pytest.mark.parametrize(
    ("choice", "count"),
    [(ClipsPerVideo.FOUR, 4), (ClipsPerVideo.EIGHT, 8), (ClipsPerVideo.TWELVE, 12)],
)
def test_a_fixed_target_is_asked_for_and_kept_whatever_the_length(
    choice: ClipsPerVideo, count: int
) -> None:
    assert count_clips(choice, 235.7) == ClipCounts(asked_for=count, kept=count)
    assert count_clips(choice, 3 * 60 * 60) == ClipCounts(asked_for=count, kept=count)
