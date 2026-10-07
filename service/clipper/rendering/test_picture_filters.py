import re

import pytest

from .picture_filters import write_filter_graph, write_overlay_list, write_place_commands
from .render_plan import (
    Layout,
    PicturePart,
    Place,
    SpeakerLayout,
    StackedLayout,
    TimedOverlay,
    WholePictureLayout,
)

STILL_PART = PicturePart(width=0.31641, height=1.0, places=[Place(0.25, 0.0)])
SPEAKER = SpeakerLayout(STILL_PART)
STACKED = StackedLayout(
    upper=PicturePart(0.5, 0.79012, [Place(0.0, 0.1), Place(0.01, 0.1)]),
    lower=PicturePart(0.5, 0.79012, [Place(0.5, 0.2), Place(0.49, 0.2)]),
)
WHOLE = WholePictureLayout()
ONE_OVERLAY = [TimedOverlay("overlay-000.png", 0.0)]
CROP = re.compile(r"crop(@\w+)?=")


def test_the_speaker_graph_crops_one_part_from_its_first_place_and_fills_the_frame() -> None:
    assert write_filter_graph(SPEAKER, []) == (
        "[0:v]fps=30,sendcmd=f=places.cmd,"
        "crop@part=w=iw*0.31641:h=ih*1.00000:x=iw*0.25000:y=ih*0.00000,"
        "scale=1080:1920,setsar=1[picture];[picture]null[clip]"
    )


def test_the_stacked_graph_puts_one_part_of_half_the_frame_above_the_other() -> None:
    assert write_filter_graph(STACKED, []).split(";") == [
        "[0:v]fps=30,sendcmd=f=places.cmd,split[above][below]",
        "[above]crop@upper=w=iw*0.50000:h=ih*0.79012:x=iw*0.00000:y=ih*0.10000,scale=1080:960[upper]",
        "[below]crop@lower=w=iw*0.50000:h=ih*0.79012:x=iw*0.50000:y=ih*0.20000,scale=1080:960[lower]",
        "[upper][lower]vstack,setsar=1[picture]",
        "[picture]null[clip]",
    ]


def test_the_whole_picture_graph_lays_the_picture_over_a_blurred_copy_and_reads_no_places() -> None:
    graph = write_filter_graph(WHOLE, [])

    assert "gblur" in graph
    assert "force_original_aspect_ratio=decrease" in graph
    assert "sendcmd" not in graph
    assert write_place_commands(WHOLE) == ""


@pytest.mark.parametrize("layout", [SPEAKER, STACKED, WHOLE])
def test_every_crop_of_a_graph_has_a_name_of_its_own(layout: Layout) -> None:
    names = CROP.findall(write_filter_graph(layout, ONE_OVERLAY))

    assert names
    assert "" not in names
    assert len(set(names)) == len(names)


def test_overlays_are_read_as_a_second_input_and_laid_over_the_picture() -> None:
    graph = write_filter_graph(SPEAKER, ONE_OVERLAY)

    assert graph.endswith(";[picture][1:v]overlay=format=auto[clip]")


def test_a_place_is_commanded_for_every_thirtieth_of_a_second_half_a_frame_early() -> None:
    moving = PicturePart(0.31641, 1.0, [Place(0.0, 0.0), Place(0.1, 0.0), Place(0.2, 0.05)])

    assert write_place_commands(SpeakerLayout(moving)).splitlines() == [
        "0.0000 crop@part x iw*0.00000, crop@part y ih*0.00000;",
        "0.0167 crop@part x iw*0.10000, crop@part y ih*0.00000;",
        "0.0500 crop@part x iw*0.20000, crop@part y ih*0.05000;",
    ]


def test_the_stacked_commands_move_each_part_by_its_own_places() -> None:
    assert write_place_commands(STACKED).splitlines() == [
        "0.0000 crop@upper x iw*0.00000, crop@upper y ih*0.10000, "
        "crop@lower x iw*0.50000, crop@lower y ih*0.20000;",
        "0.0167 crop@upper x iw*0.01000, crop@upper y ih*0.10000, "
        "crop@lower x iw*0.49000, crop@lower y ih*0.20000;",
    ]


def test_a_part_with_fewer_places_than_the_other_keeps_its_last_one() -> None:
    uneven = StackedLayout(
        upper=PicturePart(0.5, 0.79012, [Place(0.0, 0.1)]),
        lower=PicturePart(0.5, 0.79012, [Place(0.5, 0.2), Place(0.4, 0.2)]),
    )

    last_line = write_place_commands(uneven).splitlines()[-1]

    assert "crop@upper x iw*0.00000" in last_line
    assert "crop@lower x iw*0.40000" in last_line


def test_the_overlay_list_shows_each_picture_until_the_next_starts_and_names_the_last_twice() -> (
    None
):
    overlays = [
        TimedOverlay("overlay-000.png", 0.0),
        TimedOverlay("overlay-001.png", 0.78),
        TimedOverlay("overlay-000.png", 2.5),
    ]

    assert write_overlay_list(overlays, clip_seconds=3.37).splitlines() == [
        "ffconcat version 1.0",
        "file 'overlay-000.png'",
        "duration 0.780000",
        "file 'overlay-001.png'",
        "duration 1.720000",
        "file 'overlay-000.png'",
        "duration 0.870000",
        "file 'overlay-000.png'",
    ]


def test_the_first_picture_of_the_overlay_list_shows_from_the_first_frame() -> None:
    late_start = [TimedOverlay("overlay-000.png", 0.4), TimedOverlay("overlay-001.png", 1.0)]

    assert write_overlay_list(late_start, clip_seconds=2.0).splitlines()[1:3] == [
        "file 'overlay-000.png'",
        "duration 1.000000",
    ]


def test_no_overlays_give_no_list() -> None:
    assert write_overlay_list([], clip_seconds=2.0) == ""
