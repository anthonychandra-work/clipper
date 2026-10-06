from collections.abc import Mapping, Sequence

from .render_plan import (
    FRAME_HEIGHT,
    FRAME_WIDTH,
    FRAMES_PER_SECOND,
    Layout,
    PicturePart,
    Place,
    SpeakerLayout,
    StackedLayout,
    TimedOverlay,
    WholePictureLayout,
)

PLACES_FILE = "places.cmd"
OVERLAYS_FILE = "overlays.ffconcat"
ONE_PART = "part"
UPPER_PART = "upper"
LOWER_PART = "lower"

THIRTY_A_SECOND = f"[0:v]fps={FRAMES_PER_SECOND}"
FOLLOWING_THE_PLACES = f"sendcmd=f={PLACES_FILE}"
WHOLE_FRAME = f"{FRAME_WIDTH}:{FRAME_HEIGHT}"
HALF_FRAME = f"{FRAME_WIDTH}:{FRAME_HEIGHT // 2}"
# The copy behind is blurred at a quarter of the frame, where the preview's blur measures 13.5 px.
GROUND_SIZE = f"{FRAME_WIDTH // 4}:{FRAME_HEIGHT // 4}"
GROUND_BLUR = 13.5
WHOLE_PICTURE_CHAINS = (
    f"{THIRTY_A_SECOND},split[behind][whole]",
    f"[behind]scale={GROUND_SIZE}:force_original_aspect_ratio=increase,"
    f"crop@ground={GROUND_SIZE},gblur=sigma={GROUND_BLUR},scale={WHOLE_FRAME}[ground]",
    f"[whole]scale={WHOLE_FRAME}:force_original_aspect_ratio=decrease:force_divisible_by=2[shown]",
    "[ground][shown]overlay=x=(W-w)/2:y=(H-h)/2,setsar=1[picture]",
)
WITH_OVERLAYS = "[picture][1:v]overlay=format=auto[clip]"
WITHOUT_OVERLAYS = "[picture]null[clip]"
CLIP_OUTPUT = "[clip]"

HALF_A_FRAME = 0.5
ONE_FRAME_SECONDS = 1 / FRAMES_PER_SECOND
OVERLAY_LIST_HEAD = "ffconcat version 1.0\n"


def write_filter_graph(layout: Layout, overlays: Sequence[TimedOverlay]) -> str:
    laid_over = WITH_OVERLAYS if overlays else WITHOUT_OVERLAYS
    return ";".join([*write_picture_chains(layout), laid_over])


def write_picture_chains(layout: Layout) -> list[str]:
    match layout:
        case SpeakerLayout(part):
            followed = f"{THIRTY_A_SECOND},{FOLLOWING_THE_PLACES},{write_crop(ONE_PART, part)}"
            return [f"{followed},scale={WHOLE_FRAME},setsar=1[picture]"]
        case StackedLayout(upper, lower):
            return [
                f"{THIRTY_A_SECOND},{FOLLOWING_THE_PLACES},split[above][below]",
                f"[above]{write_crop(UPPER_PART, upper)},scale={HALF_FRAME}[upper]",
                f"[below]{write_crop(LOWER_PART, lower)},scale={HALF_FRAME}[lower]",
                "[upper][lower]vstack,setsar=1[picture]",
            ]
        case WholePictureLayout():
            return list(WHOLE_PICTURE_CHAINS)


# A command that names plain "crop" reaches every crop of the run, so each crop has its own name.
def write_crop(name: str, part: PicturePart) -> str:
    size = f"w=iw*{part.width:.5f}:h=ih*{part.height:.5f}"
    first = part.places[0]
    return f"crop@{name}={size}:x=iw*{first.left:.5f}:y=ih*{first.top:.5f}"


def write_place_commands(layout: Layout) -> str:
    parts = name_parts(layout)
    frame_count = max((len(part.places) for part in parts.values()), default=0)
    return "".join(write_frame_commands(frame, parts) for frame in range(frame_count))


def name_parts(layout: Layout) -> dict[str, PicturePart]:
    match layout:
        case SpeakerLayout(part):
            return {ONE_PART: part}
        case StackedLayout(upper, lower):
            return {UPPER_PART: upper, LOWER_PART: lower}
        case WholePictureLayout():
            return {}


# A frame's commands start half a frame early, so the frame's own time always lies inside them.
def write_frame_commands(frame: int, parts: Mapping[str, PicturePart]) -> str:
    start_seconds = max(0.0, (frame - HALF_A_FRAME) / FRAMES_PER_SECOND)
    moves = [write_move(name, find_place(part, frame)) for name, part in parts.items()]
    return f"{start_seconds:.4f} {', '.join(moves)};\n"


def find_place(part: PicturePart, frame: int) -> Place:
    return part.places[min(frame, len(part.places) - 1)]


def write_move(name: str, place: Place) -> str:
    return f"crop@{name} x iw*{place.left:.5f}, crop@{name} y ih*{place.top:.5f}"


# The first picture shows from the first frame; the last is named twice, or its length is lost.
def write_overlay_list(overlays: Sequence[TimedOverlay], clip_seconds: float) -> str:
    if not overlays:
        return ""
    starts = [0.0, *(overlay.start_seconds for overlay in overlays[1:])]
    ends = [*starts[1:], clip_seconds]
    shown = [
        f"file '{overlay.picture}'\nduration {max(end - start, ONE_FRAME_SECONDS):.6f}\n"
        for overlay, start, end in zip(overlays, starts, ends, strict=True)
    ]
    return f"{OVERLAY_LIST_HEAD}{''.join(shown)}file '{overlays[-1].picture}'\n"
