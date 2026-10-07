import io
import subprocess
import threading
from collections.abc import Callable
from dataclasses import replace
from pathlib import Path

import numpy as np
import numpy.typing as npt
import pytest
from PIL import Image
from pydantic import BaseModel

from ..conftest import VideoRecipe
from ..media import MediaToolFailedError, MediaTools, MediaWorkStoppedError
from .encode_clip import PARTIAL_NAME, encode_clip
from .render_plan import (
    FRAME_HEIGHT,
    FRAME_WIDTH,
    Layout,
    PicturePart,
    Place,
    RenderPlan,
    SpeakerLayout,
    StackedLayout,
    TimedOverlay,
    WholePictureLayout,
)

type Pixels = npt.NDArray[np.uint8]
type Colour = tuple[int, int, int]

QUIET = ("-hide_banner", "-loglevel", "error", "-y")
RED: Colour = (254, 0, 0)
BLUE: Colour = (0, 0, 254)
YELLOW: Colour = (255, 255, 0)
CLEAR = (0, 0, 0, 0)
COLOUR_SLACK = 12
HALVES_SECONDS = 30
UPRIGHT_SHARE_OF_16_BY_9 = (9 / 16) / (16 / 9)
FAR_RIGHT = 1 - UPRIGHT_SHARE_OF_16_BY_9
HALF_WIDE = PicturePart(width=0.5, height=0.79012, places=[Place(0.0, 0.1)])
ON_THE_LEFT = Place(0.0, 0.1)
ON_THE_RIGHT = Place(0.5, 0.1)
WHOLE = WholePictureLayout()
STOP_AFTER_SECONDS = 0.3
FULL_DISK_FFMPEG = """\
#!/bin/sh
echo "Error writing the clip: No space left on device" >&2
exit 1
"""


class ProbedStream(BaseModel):
    codec_type: str
    codec_name: str
    width: int | None = None
    height: int | None = None
    r_frame_rate: str
    avg_frame_rate: str


class ProbedFormat(BaseModel):
    format_name: str
    duration: float


class ClipProbe(BaseModel):
    streams: list[ProbedStream]
    format: ProbedFormat

    def find_stream(self, kind: str) -> ProbedStream:
        (only,) = [stream for stream in self.streams if stream.codec_type == kind]
        return only


def probe_clip(clip: Path, tools: MediaTools) -> ClipProbe:
    asked = ["-v", "error", "-show_streams", "-show_format", "-of", "json"]
    answer = subprocess.run(
        [str(tools.ffprobe), *asked, str(clip)], check=True, capture_output=True, text=True
    )
    return ClipProbe.model_validate_json(answer.stdout)


def read_frame(clip: Path, at_seconds: float, tools: MediaTools) -> Pixels:
    moment = ["-ss", f"{at_seconds:.3f}", "-i", str(clip)]
    as_one_png = ["-frames:v", "1", "-f", "image2pipe", "-c:v", "png", "-"]
    grabbed = subprocess.run(
        [str(tools.ffmpeg), *QUIET, *moment, *as_one_png], check=True, capture_output=True
    )
    return np.asarray(Image.open(io.BytesIO(grabbed.stdout)).convert("RGB"))


def has_colour(region: Pixels, colour: Colour) -> bool:
    mean = region.reshape(-1, 3).mean(axis=0)
    return bool(np.abs(mean - colour).max() <= COLOUR_SLACK)


def halve(frame: Pixels) -> tuple[Pixels, Pixels]:
    middle = frame.shape[0] // 2
    return frame[:middle], frame[middle:]


def follow(places: list[Place]) -> SpeakerLayout:
    return SpeakerLayout(PicturePart(UPRIGHT_SHARE_OF_16_BY_9, 1.0, places))


def stack(upper: Place, lower: Place) -> StackedLayout:
    return StackedLayout(replace(HALF_WIDE, places=[upper]), replace(HALF_WIDE, places=[lower]))


def plan_render(source: Path, folder: Path, layout: Layout) -> RenderPlan:
    work_dir = folder / "work"
    work_dir.mkdir(exist_ok=True)
    return RenderPlan(
        source=source,
        start_seconds=0.5,
        seconds=2.0,
        work_dir=work_dir,
        target=folder / "clip.mp4",
        layout=layout,
        overlays=[],
    )


def render(plan: RenderPlan, tools: MediaTools) -> Path:
    encode_clip(plan, tools, threading.Event(), ignore_percent)
    return plan.target


def ignore_percent(percent: float) -> None:
    del percent


def list_overlay_for_the_second_second(work_dir: Path) -> list[TimedOverlay]:
    size = (FRAME_WIDTH, FRAME_HEIGHT)
    Image.new("RGBA", size, CLEAR).save(work_dir / "clear.png")
    Image.new("RGBA", size, (*YELLOW, 255)).save(work_dir / "solid.png")
    return [
        TimedOverlay("clear.png", 0.0),
        TimedOverlay("solid.png", 1.0),
        TimedOverlay("clear.png", 2.0),
    ]


@pytest.fixture(scope="module")
def halves_video(media_tools: MediaTools, tmp_path_factory: pytest.TempPathFactory) -> Path:
    video = tmp_path_factory.mktemp("halves") / "halves.mp4"
    halves = [
        ["-f", "lavfi", "-i", f"color={colour}:size=160x180:rate=30:duration={HALVES_SECONDS}"]
        for colour in ("red", "blue")
    ]
    tone = ["-f", "lavfi", "-i", f"sine=frequency=440:duration={HALVES_SECONDS}"]
    side_by_side = [
        "-filter_complex",
        "[0:v][1:v]hstack",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
    ]
    inputs = [*halves[0], *halves[1], *tone]
    built = [str(media_tools.ffmpeg), *QUIET, *inputs, *side_by_side, "-pix_fmt", "yuv420p"]
    subprocess.run([*built, "-c:a", "aac", str(video)], check=True)
    return video


@pytest.fixture(scope="module")
def sideways_video(halves_video: Path, media_tools: MediaTools) -> Path:
    video = halves_video.with_name("sideways.mp4")
    turned = ["-display_rotation", "90", "-i", str(halves_video), "-c", "copy", str(video)]
    subprocess.run([str(media_tools.ffmpeg), *QUIET, *turned], check=True)
    return video


@pytest.mark.parametrize("seconds", [2.0, 3.37])
@pytest.mark.parametrize(
    "layout", [follow([Place(0.0, 0.0)]), stack(ON_THE_LEFT, ON_THE_RIGHT), WHOLE]
)
def test_a_clip_of_each_layout_is_1080_by_1920_at_30_frames_in_h264_with_aac_and_as_long_as_planned(
    layout: Layout, seconds: float, halves_video: Path, media_tools: MediaTools, tmp_path: Path
) -> None:
    plan = replace(plan_render(halves_video, tmp_path, layout), seconds=seconds)

    probe = probe_clip(render(plan, media_tools), media_tools)

    picture, sound = probe.find_stream("video"), probe.find_stream("audio")
    assert (picture.codec_name, picture.width, picture.height) == ("h264", 1080, 1920)
    assert (picture.r_frame_rate, picture.avg_frame_rate) == ("30/1", "30/1")
    assert sound.codec_name == "aac"
    assert "mp4" in probe.format.format_name.split(",")
    assert probe.format.duration == pytest.approx(seconds, abs=0.1)


@pytest.mark.parametrize("frames_per_second", [25, 60])
def test_a_source_at_another_frame_rate_is_rendered_at_30_frames_a_second(
    frames_per_second: int,
    build_video: Callable[[VideoRecipe], Path],
    media_tools: MediaTools,
    tmp_path: Path,
) -> None:
    source = build_video(VideoRecipe("source.mp4", seconds=4, frames_per_second=frames_per_second))
    plan = plan_render(source, tmp_path, follow([Place(0.3, 0.0)]))

    picture = probe_clip(render(plan, media_tools), media_tools).find_stream("video")

    assert (picture.r_frame_rate, picture.avg_frame_rate) == ("30/1", "30/1")


@pytest.mark.parametrize(("left", "colour"), [(0.0, RED), (FAR_RIGHT, BLUE)])
def test_a_part_on_one_side_of_the_picture_fills_the_frame_with_that_side(
    left: float, colour: Colour, halves_video: Path, media_tools: MediaTools, tmp_path: Path
) -> None:
    plan = plan_render(halves_video, tmp_path, follow([Place(left, 0.0)]))

    frame = read_frame(render(plan, media_tools), 1.0, media_tools)

    assert has_colour(frame, colour)


def test_places_that_go_from_left_to_right_show_the_left_first_and_the_right_last(
    halves_video: Path, media_tools: MediaTools, tmp_path: Path
) -> None:
    places = [Place(FAR_RIGHT * frame / 59, 0.0) for frame in range(60)]

    clip = render(plan_render(halves_video, tmp_path, follow(places)), media_tools)

    assert has_colour(read_frame(clip, 0.0, media_tools), RED)
    assert has_colour(read_frame(clip, 1.95, media_tools), BLUE)


@pytest.mark.parametrize(
    ("upper", "lower", "colours"),
    [(ON_THE_LEFT, ON_THE_RIGHT, (RED, BLUE)), (ON_THE_RIGHT, ON_THE_LEFT, (BLUE, RED))],
)
def test_the_stacked_layout_shows_each_part_in_its_half_from_its_own_places(
    upper: Place,
    lower: Place,
    colours: tuple[Colour, Colour],
    halves_video: Path,
    media_tools: MediaTools,
    tmp_path: Path,
) -> None:
    plan = plan_render(halves_video, tmp_path, stack(upper, lower))

    above, below = halve(read_frame(render(plan, media_tools), 1.0, media_tools))

    assert (has_colour(above, colours[0]), has_colour(below, colours[1])) == (True, True)


def test_the_whole_picture_layout_shows_both_sides_in_the_middle_over_a_blurred_copy(
    halves_video: Path, media_tools: MediaTools, tmp_path: Path
) -> None:
    clip = render(plan_render(halves_video, tmp_path, WHOLE), media_tools)

    frame = read_frame(clip, 1.0, media_tools)

    middle_rows, top_rows = frame[900:1020], frame[40:160]
    assert has_colour(middle_rows[:, 60:420], RED)
    assert has_colour(middle_rows[:, 660:1020], BLUE)
    assert not has_colour(top_rows[:, 480:600], RED)
    assert not has_colour(top_rows[:, 480:600], BLUE)


def test_an_overlay_listed_from_one_second_to_two_shows_in_the_frames_between_them_only(
    halves_video: Path, media_tools: MediaTools, tmp_path: Path
) -> None:
    plan = replace(plan_render(halves_video, tmp_path, follow([Place(0.0, 0.0)])), seconds=3.0)
    overlays = list_overlay_for_the_second_second(plan.work_dir)

    clip = render(replace(plan, overlays=overlays), media_tools)

    shown = {at: has_colour(read_frame(clip, at, media_tools), YELLOW) for at in (0.5, 1.5, 2.5)}
    assert shown == {0.5: False, 1.5: True, 2.5: False}
    assert has_colour(read_frame(clip, 0.9, media_tools), RED)
    assert has_colour(read_frame(clip, 1.1, media_tools), YELLOW)
    assert has_colour(read_frame(clip, 2.1, media_tools), RED)


def test_a_video_stored_on_its_side_is_rendered_as_it_plays(
    sideways_video: Path, media_tools: MediaTools, tmp_path: Path
) -> None:
    whole_upright_picture = SpeakerLayout(PicturePart(1.0, 1.0, [Place(0.0, 0.0)]))
    plan = plan_render(sideways_video, tmp_path, whole_upright_picture)

    above, below = halve(read_frame(render(plan, media_tools), 1.0, media_tools))

    played = read_frame(sideways_video, 1.0, media_tools)
    assert played.shape[:2] == (320, 180)
    assert has_colour(above, RED) == has_colour(halve(played)[0], RED)
    assert {has_colour(above, RED), has_colour(below, RED)} == {True, False}
    assert {has_colour(above, BLUE), has_colour(below, BLUE)} == {True, False}


def test_a_work_folder_named_with_a_space_a_colon_and_an_apostrophe_renders_the_same(
    halves_video: Path, media_tools: MediaTools, tmp_path: Path
) -> None:
    folder = tmp_path / "it's a clip: one, [two]"
    folder.mkdir()
    places = [Place(FAR_RIGHT * frame / 89, 0.0) for frame in range(90)]
    plan = replace(plan_render(halves_video, folder, follow(places)), seconds=3.0)
    overlays = list_overlay_for_the_second_second(plan.work_dir)

    clip = render(replace(plan, overlays=overlays), media_tools)

    assert has_colour(read_frame(clip, 0.0, media_tools), RED)
    assert has_colour(read_frame(clip, 1.5, media_tools), YELLOW)
    assert has_colour(read_frame(clip, 2.95, media_tools), BLUE)


def test_the_progress_of_a_render_rises_to_100(
    halves_video: Path, media_tools: MediaTools, tmp_path: Path
) -> None:
    percents: list[float] = []
    plan = plan_render(halves_video, tmp_path, follow([Place(0.0, 0.0)]))

    encode_clip(plan, media_tools, threading.Event(), percents.append)

    assert percents == sorted(percents)
    assert percents[-1] == 100.0


def test_a_stop_set_during_the_run_ends_it_as_stopped_and_leaves_no_file(
    halves_video: Path, media_tools: MediaTools, tmp_path: Path
) -> None:
    plan = replace(plan_render(halves_video, tmp_path, WHOLE), seconds=25.0)
    stop = threading.Event()
    threading.Timer(STOP_AFTER_SECONDS, stop.set).start()

    with pytest.raises(MediaWorkStoppedError):
        encode_clip(plan, media_tools, stop, ignore_percent)

    assert not plan.target.exists()
    assert not (plan.work_dir / PARTIAL_NAME).exists()


def test_a_source_that_is_no_video_fails_with_the_words_of_ffmpeg_and_keeps_the_earlier_file(
    media_tools: MediaTools, tmp_path: Path
) -> None:
    notes = tmp_path / "notes.mp4"
    notes.write_text("not a video")
    plan = plan_render(notes, tmp_path, follow([Place(0.0, 0.0)]))
    plan.target.write_bytes(b"the earlier export")

    with pytest.raises(MediaToolFailedError) as raised:
        encode_clip(plan, media_tools, threading.Event(), ignore_percent)

    assert "notes.mp4" in raised.value.details
    assert "Invalid data" in raised.value.details
    assert plan.target.read_bytes() == b"the earlier export"
    assert not (plan.work_dir / PARTIAL_NAME).exists()


def test_a_full_disk_fails_with_the_words_ffmpeg_ended_on(
    halves_video: Path, media_tools: MediaTools, tmp_path: Path
) -> None:
    full_disk_ffmpeg = tmp_path / "ffmpeg"
    full_disk_ffmpeg.write_text(FULL_DISK_FFMPEG)
    full_disk_ffmpeg.chmod(0o755)
    tools = MediaTools(ffmpeg=full_disk_ffmpeg, ffprobe=media_tools.ffprobe)
    plan = plan_render(halves_video, tmp_path, follow([Place(0.0, 0.0)]))

    with pytest.raises(MediaToolFailedError) as raised:
        encode_clip(plan, tools, threading.Event(), ignore_percent)

    assert "No space left on device" in raised.value.details
    assert not plan.target.exists()
