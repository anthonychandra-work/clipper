from ..review import Caption, CaptionWord
from .overlay_timeline import Overlay, OverlayChange, time_overlays

HOOK_TITLE = "The oven broke before sunrise"


def caption(start_seconds: float, *texts: str) -> Caption:
    return Caption(start_seconds, tuple(CaptionWord(text, is_highlighted=False) for text in texts))


def show(*texts: str, hook_title: str | None = None) -> Overlay:
    words = tuple(CaptionWord(text, is_highlighted=False) for text in texts)
    return Overlay(words=words, hook_title=hook_title)


def test_a_caption_at_the_first_frame_is_the_first_overlay() -> None:
    captions = [caption(0.0, "so", "i"), caption(0.9, "tell", "you")]

    assert time_overlays(captions, clip_seconds=10.0, hook_title=None) == [
        OverlayChange(0.0, show("so", "i")),
        OverlayChange(0.9, show("tell", "you")),
    ]


def test_nothing_shows_before_a_first_caption_that_starts_half_a_second_in() -> None:
    captions = [caption(0.5, "so", "i"), caption(1.4, "tell", "you")]

    assert time_overlays(captions, clip_seconds=10.0, hook_title=None) == [
        OverlayChange(0.0, Overlay()),
        OverlayChange(0.5, show("so", "i")),
        OverlayChange(1.4, show("tell", "you")),
    ]


def test_a_caption_that_starts_before_the_in_point_shows_from_the_first_frame() -> None:
    captions = [
        caption(-1.2, "long", "before"),
        caption(-0.4, "just", "before"),
        caption(0.6, "in"),
    ]

    assert time_overlays(captions, clip_seconds=10.0, hook_title=None) == [
        OverlayChange(0.0, show("just", "before")),
        OverlayChange(0.6, show("in")),
    ]


def test_a_caption_that_starts_at_or_after_the_out_point_is_left_out() -> None:
    captions = [caption(0.0, "in"), caption(2.0, "at", "the", "end"), caption(2.6, "after")]

    assert time_overlays(captions, clip_seconds=2.0, hook_title=None) == [
        OverlayChange(0.0, show("in"))
    ]


def test_a_clip_without_captions_shows_nothing_from_its_first_frame() -> None:
    assert time_overlays([], clip_seconds=5.0, hook_title=None) == [OverlayChange(0.0, Overlay())]


def test_with_the_switch_off_no_overlay_carries_a_hook_title() -> None:
    captions = [caption(0.5, "so", "i"), caption(3.5, "tell", "you")]

    changes = time_overlays(captions, clip_seconds=10.0, hook_title=None)

    assert [change.overlay.hook_title for change in changes] == [None, None, None]


def test_the_hook_title_shows_over_the_first_three_seconds() -> None:
    captions = [caption(0.5, "so", "i"), caption(3.0, "tell", "you"), caption(4.1, "about")]

    assert time_overlays(captions, clip_seconds=10.0, hook_title=HOOK_TITLE) == [
        OverlayChange(0.0, Overlay(hook_title=HOOK_TITLE)),
        OverlayChange(0.5, show("so", "i", hook_title=HOOK_TITLE)),
        OverlayChange(3.0, show("tell", "you")),
        OverlayChange(4.1, show("about")),
    ]


def test_a_caption_that_spans_the_third_second_shows_with_the_hook_title_and_then_without() -> None:
    captions = [caption(0.0, "so", "i"), caption(2.4, "tell", "you"), caption(3.8, "about")]

    assert time_overlays(captions, clip_seconds=10.0, hook_title=HOOK_TITLE) == [
        OverlayChange(0.0, show("so", "i", hook_title=HOOK_TITLE)),
        OverlayChange(2.4, show("tell", "you", hook_title=HOOK_TITLE)),
        OverlayChange(3.0, show("tell", "you")),
        OverlayChange(3.8, show("about")),
    ]


def test_a_clip_of_two_seconds_keeps_the_hook_title_to_its_end() -> None:
    captions = [caption(0.0, "so", "i"), caption(1.2, "tell", "you")]

    assert time_overlays(captions, clip_seconds=2.0, hook_title=HOOK_TITLE) == [
        OverlayChange(0.0, show("so", "i", hook_title=HOOK_TITLE)),
        OverlayChange(1.2, show("tell", "you", hook_title=HOOK_TITLE)),
    ]


def test_a_clip_of_exactly_three_seconds_never_shows_its_captions_without_the_hook_title() -> None:
    changes = time_overlays([caption(0.0, "so", "i")], clip_seconds=3.0, hook_title=HOOK_TITLE)

    assert changes == [OverlayChange(0.0, show("so", "i", hook_title=HOOK_TITLE))]
