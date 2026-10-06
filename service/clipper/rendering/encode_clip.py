import threading
from collections.abc import Callable

from ..media import MediaTools, RisingPercent, run_media_tool
from .picture_filters import (
    CLIP_OUTPUT,
    OVERLAYS_FILE,
    PLACES_FILE,
    write_filter_graph,
    write_overlay_list,
    write_place_commands,
)
from .render_plan import FRAMES_PER_SECOND, RenderPlan

PARTIAL_NAME = "clip.partial.mp4"

QUIET_OPTIONS = ("-hide_banner", "-loglevel", "error", "-nostdin", "-y")
OVERLAY_LIST_OPTIONS = ("-f", "concat", "-safe", "0", "-i", OVERLAYS_FILE)
PICTURE_OPTIONS = ("-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p", "-crf", "20")
FRAME_RATE_OPTIONS = ("-r", str(FRAMES_PER_SECOND))
SOUND_OPTIONS = ("-map", "0:a:0", "-c:a", "aac", "-ar", "48000", "-ac", "2", "-b:a", "160k")
FILE_OPTIONS = ("-movflags", "+faststart", "-progress", "pipe:1", "-nostats")


def encode_clip(
    plan: RenderPlan, tools: MediaTools, stop: threading.Event, on_percent: Callable[[float], None]
) -> None:
    partial = plan.work_dir / PARTIAL_NAME
    progress = RisingPercent(plan.seconds, on_percent)
    write_work_files(plan)
    try:
        # Started in the work folder, ffmpeg reads its files by name and no path needs escaping.
        run_media_tool(
            describe_encoding(plan, tools), stop, progress.read_progress_line, plan.work_dir
        )
        partial.replace(plan.target)
    finally:
        partial.unlink(missing_ok=True)


def write_work_files(plan: RenderPlan) -> None:
    texts = {
        PLACES_FILE: write_place_commands(plan.layout),
        OVERLAYS_FILE: write_overlay_list(plan.overlays, plan.seconds),
    }
    for name, text in texts.items():
        if text:
            (plan.work_dir / name).write_text(text, encoding="utf-8")


def describe_encoding(plan: RenderPlan, tools: MediaTools) -> list[str]:
    length = ["-t", f"{plan.seconds:.3f}"]
    stretch = ["-ss", f"{plan.start_seconds:.3f}", *length, "-i", str(plan.source.absolute())]
    overlays = OVERLAY_LIST_OPTIONS if plan.overlays else ()
    picture = ["-filter_complex", write_filter_graph(plan.layout, plan.overlays)]
    encoding = [*PICTURE_OPTIONS, *FRAME_RATE_OPTIONS, *SOUND_OPTIONS, *length, *FILE_OPTIONS]
    read = [str(tools.ffmpeg.absolute()), *QUIET_OPTIONS, *stretch, *overlays]
    return [*read, *picture, "-map", CLIP_OUTPUT, *encoding, PARTIAL_NAME]
