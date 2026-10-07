from collections.abc import Sequence
from dataclasses import dataclass, replace

from ..review import Caption, CaptionWord

HOOK_TITLE_SECONDS = 3.0


@dataclass(frozen=True)
class Overlay:
    words: tuple[CaptionWord, ...] = ()
    hook_title: str | None = None


@dataclass(frozen=True)
class OverlayChange:
    start_seconds: float
    overlay: Overlay


def time_overlays(
    captions: Sequence[Caption], clip_seconds: float, hook_title: str | None
) -> list[OverlayChange]:
    changes = time_captions(captions, clip_seconds)
    if hook_title is None:
        return changes
    return show_hook_title(changes, clip_seconds, hook_title)


def time_captions(captions: Sequence[Caption], clip_seconds: float) -> list[OverlayChange]:
    changes = [OverlayChange(0.0, Overlay())]
    for caption in captions:
        if caption.start_seconds >= clip_seconds:
            continue
        start_seconds = max(0.0, caption.start_seconds)
        if changes[-1].start_seconds == start_seconds:
            changes.pop()
        changes.append(OverlayChange(start_seconds, Overlay(words=caption.words)))
    return changes


def show_hook_title(
    changes: Sequence[OverlayChange], clip_seconds: float, hook_title: str
) -> list[OverlayChange]:
    during = [change for change in changes if change.start_seconds < HOOK_TITLE_SECONDS]
    after = [change for change in changes if change.start_seconds >= HOOK_TITLE_SECONDS]
    titled = [
        replace(change, overlay=replace(change.overlay, hook_title=hook_title)) for change in during
    ]
    changes_as_the_title_ends = bool(after) and after[0].start_seconds == HOOK_TITLE_SECONDS
    if clip_seconds <= HOOK_TITLE_SECONDS or changes_as_the_title_ends:
        return [*titled, *after]
    return [*titled, OverlayChange(HOOK_TITLE_SECONDS, during[-1].overlay), *after]
