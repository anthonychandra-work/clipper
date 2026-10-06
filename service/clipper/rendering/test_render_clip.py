import itertools
import os
import threading
from pathlib import Path

import numpy as np
import pytest
from PIL import Image

from ..media import MediaTools, MediaWorkStoppedError
from ..review import (
    CaptionStyle,
    ClipPoint,
    ClipReview,
    Decision,
    Framing,
    Look,
    ReviewSources,
    StandingClip,
    read_standing_review,
)
from ..review.conftest import CutTalk
from .draw_overlays import OverlayLook, draw_overlay
from .find_faces import Face, FaceFinder
from .overlay_timeline import Overlay
from .render_clip import ClipNotKeptError, ClipRender, RenderWork, SourceGoneError, render_clip
from .test_encode_clip import Pixels, probe_clip, read_frame

NAMED_COLOURS = {
    "cyan": (0, 191, 191),
    "green": (0, 191, 0),
    "magenta": (191, 0, 191),
    "yellow": (191, 191, 0),
    "red": (191, 0, 0),
    "blue": (0, 0, 191),
    "white": (255, 255, 255),
    "grey": (191, 191, 191),
    "black": (0, 0, 0),
}
MIDDLE_OF_THE_BARS = ["cyan", "green", "magenta"]
BARS_ROW_SHARE = 0.30
BARS_COLUMN_SHARES = (0.05, 0.5, 0.95)
SOLID = 255
COLOUR_SLACK = 48
MOST_OF_THE_PICTURE = 0.9
FIRST_SENTENCES_OF_C01 = (4, 12)
EVIDENCE_NAMES = {
    Framing.FOLLOW_SPEAKER: "framing-follow-speaker.jpg",
    Framing.STACK_TWO: "framing-stack-two.jpg",
    Framing.WHOLE_FRAME: "framing-whole-frame.jpg",
}
DIFFERENT_PICTURES = 10.0


def keep_first_clip(
    cut: CutTalk, sources: ReviewSources, sentences: tuple[int, int] | None = None
) -> None:
    first, last = sentences or find_cut_sentences(cut)
    kept = ClipReview(start=ClipPoint(first), end=ClipPoint(last), decision=Decision.KEEP)
    sources.reviews.save_review(cut.project.id, cut.candidates[0].id, kept)


def find_cut_sentences(cut: CutTalk) -> tuple[int, int]:
    candidate = cut.candidates[0]
    first = next(s.number for s in cut.sentences if s.start == candidate.start_seconds)
    last = next(s.number for s in cut.sentences if s.end == candidate.end_seconds)
    return first, last


def render_first_clip(cut: CutTalk, work: RenderWork) -> Path:
    candidate = cut.candidates[0]
    render_clip(ClipRender(cut.project, candidate.id, threading.Event(), ignore_percent), work)
    return work.sources.data_folder.export_file(cut.project.id, candidate.rank, candidate.id)


def ignore_percent(percent: float) -> None:
    del percent


def read_first_clip(cut: CutTalk, sources: ReviewSources) -> StandingClip:
    return read_standing_review(cut.project, sources).clips[0]


def find_caption_words(clip: StandingClip, at_seconds: float) -> list[str]:
    shown = [caption for caption in clip.captions if caption.start_seconds <= at_seconds][-1]
    return [word.text for word in shown.words]


def draw_caption_at(clip: StandingClip, at_seconds: float, look: OverlayLook) -> Image.Image:
    shown = [caption for caption in clip.captions if caption.start_seconds <= at_seconds][-1]
    return draw_overlay(Overlay(words=shown.words), look)


def draw_hook_title(clip: StandingClip, look: OverlayLook) -> Image.Image:
    return draw_overlay(Overlay(hook_title=clip.candidate.hook_title), look)


def shows_overlay(frame: Pixels, overlay: Image.Image) -> bool:
    drawn = np.asarray(overlay).astype(int)
    solid = drawn[:, :, 3] == SOLID
    difference = np.abs(frame[solid].astype(int) - drawn[solid][:, :3]).max(axis=1)
    return bool((difference <= COLOUR_SLACK).mean() >= MOST_OF_THE_PICTURE)


def name_bars(frame: Pixels) -> list[str]:
    height, width = frame.shape[:2]
    row = frame[int(BARS_ROW_SHARE * height)]
    return [name_colour(row[int(share * (width - 1))]) for share in BARS_COLUMN_SHARES]


def name_colour(pixel: Pixels) -> str:
    def measure_distance(name: str) -> int:
        parts = zip(pixel, NAMED_COLOURS[name], strict=True)
        return sum((int(seen) - wanted) ** 2 for seen, wanted in parts)

    return min(NAMED_COLOURS, key=measure_distance)


def find_faces_in(frame: Pixels, folder: Path) -> list[Face]:
    picture = folder / "frame.png"
    Image.fromarray(frame).save(picture)
    return FaceFinder().find_faces(picture)


def is_whole(face: Face) -> bool:
    return (
        face.left >= 0
        and face.top >= 0
        and face.left + face.width <= 1
        and (face.top + face.height <= 1)
    )


def save_evidence(name: str, frame: Pixels) -> None:
    folder = os.environ.get("CLIPPER_EVIDENCE_DIR")
    if folder:
        Image.fromarray(frame).save(Path(folder) / name, quality=92)


def test_the_first_clip_of_the_talk_shows_its_hook_title_for_three_seconds_and_its_captions(
    talk_with_source: CutTalk, render_work: RenderWork, media_tools: MediaTools
) -> None:
    keep_first_clip(talk_with_source, render_work.sources)
    look = OverlayLook(CaptionStyle.KEYWORD, Framing.FOLLOW_SPEAKER)

    rendered = render_first_clip(talk_with_source, render_work)

    clip = read_first_clip(talk_with_source, render_work.sources)
    at_1s, at_4s = read_frame(rendered, 1.0, media_tools), read_frame(rendered, 4.0, media_tools)
    assert probe_clip(rendered, media_tools).format.duration == pytest.approx(32.76, abs=0.1)
    assert find_caption_words(clip, 1.0) == ["tell", "you", "about"]
    assert find_caption_words(clip, 4.0) == ["had"]
    assert shows_overlay(at_1s, draw_hook_title(clip, look))
    assert shows_overlay(at_1s, draw_caption_at(clip, 1.0, look))
    assert shows_overlay(at_4s, draw_caption_at(clip, 4.0, look))
    assert not shows_overlay(at_4s, draw_hook_title(clip, look))
    assert not shows_overlay(at_4s, draw_caption_at(clip, 1.0, look))
    assert name_bars(at_1s) == name_bars(at_4s) == MIDDLE_OF_THE_BARS


def test_with_the_switch_off_the_frame_at_one_second_shows_no_hook_title(
    talk_with_source: CutTalk, render_work: RenderWork, media_tools: MediaTools
) -> None:
    sources = render_work.sources
    keep_first_clip(talk_with_source, sources, sentences=(4, 5))
    sources.reviews.save_look(
        talk_with_source.project.id,
        Look(caption_style=CaptionStyle.WORD_BY_WORD, show_hook_title=False),
    )
    look = OverlayLook(CaptionStyle.WORD_BY_WORD, Framing.FOLLOW_SPEAKER)

    rendered = render_first_clip(talk_with_source, render_work)

    clip = read_first_clip(talk_with_source, sources)
    at_1s, at_2s = read_frame(rendered, 1.0, media_tools), read_frame(rendered, 2.0, media_tools)
    assert not shows_overlay(at_1s, draw_hook_title(clip, look))
    assert find_caption_words(clip, 2.0) == ["worst"]
    assert shows_overlay(at_2s, draw_caption_at(clip, 2.0, look))
    assert not shows_overlay(at_1s, draw_caption_at(clip, 2.0, look))


def test_a_clip_moved_by_a_nudge_and_by_a_sentence_is_as_long_as_the_review_says(
    talk_with_source: CutTalk, render_work: RenderWork, media_tools: MediaTools
) -> None:
    sources, project_id = render_work.sources, talk_with_source.project.id
    moved = ClipReview(ClipPoint(5, nudge=-2), ClipPoint(8), decision=Decision.KEEP)
    sources.reviews.save_review(project_id, "c01", moved)
    sources.reviews.save_look(project_id, Look(caption_style=CaptionStyle.PLAIN))
    look = OverlayLook(CaptionStyle.PLAIN, Framing.FOLLOW_SPEAKER)

    rendered = render_first_clip(talk_with_source, render_work)

    clip = read_first_clip(talk_with_source, sources)
    at_2s = read_frame(rendered, 2.0, media_tools)
    assert clip.seconds == pytest.approx(30.84 - 16.3 + 0.4)
    assert probe_clip(rendered, media_tools).format.duration == pytest.approx(clip.seconds, abs=0.1)
    assert find_caption_words(clip, 2.0) == ["It", "was", "a", "Saturday", "and", "winter"]
    assert shows_overlay(at_2s, draw_caption_at(clip, 2.0, look))


def test_the_stacked_framing_on_the_talk_gives_the_speaker_picture(
    talk_with_source: CutTalk, render_work: RenderWork, media_tools: MediaTools
) -> None:
    sources = render_work.sources
    keep_first_clip(talk_with_source, sources, sentences=(4, 4))
    sources.reviews.save_look(talk_with_source.project.id, Look(framing=Framing.STACK_TWO))

    rendered = render_first_clip(talk_with_source, render_work)

    clip = read_first_clip(talk_with_source, sources)
    at_1s = read_frame(rendered, 1.0, media_tools)
    as_speaker = OverlayLook(CaptionStyle.KEYWORD, Framing.FOLLOW_SPEAKER)
    as_stacked = OverlayLook(CaptionStyle.KEYWORD, Framing.STACK_TWO)
    assert name_bars(at_1s) == MIDDLE_OF_THE_BARS
    assert shows_overlay(at_1s, draw_caption_at(clip, 1.0, as_speaker))
    assert not shows_overlay(at_1s, draw_caption_at(clip, 1.0, as_stacked))


def test_one_clip_of_the_portrait_video_gives_a_different_picture_in_each_framing(
    portrait_clip: CutTalk, render_work: RenderWork, media_tools: MediaTools
) -> None:
    keep_first_clip(portrait_clip, render_work.sources)
    frames: dict[Framing, Pixels] = {}

    for framing in Framing:
        render_work.sources.reviews.save_look(portrait_clip.project.id, Look(framing=framing))
        frames[framing] = read_frame(
            render_first_clip(portrait_clip, render_work), 3.0, media_tools
        )
        save_evidence(EVIDENCE_NAMES[framing], frames[framing])

    for first, second in itertools.combinations(Framing, 2):
        difference = np.abs(frames[first].astype(int) - frames[second].astype(int)).mean()
        assert difference >= DIFFERENT_PICTURES


def test_the_speaker_framing_keeps_the_one_face_whole_in_the_middle_of_the_frame(
    portrait_clip: CutTalk, render_work: RenderWork, media_tools: MediaTools, tmp_path: Path
) -> None:
    keep_first_clip(portrait_clip, render_work.sources)

    rendered = render_first_clip(portrait_clip, render_work)

    for at_seconds in (1.0, 3.0, 5.0):
        (face,) = find_faces_in(read_frame(rendered, at_seconds, media_tools), tmp_path)
        assert is_whole(face)
        assert 1 / 3 < face.middle_across < 2 / 3


def test_the_stacked_framing_shows_one_face_in_the_upper_half_and_one_in_the_lower(
    portrait_clip: CutTalk, render_work: RenderWork, media_tools: MediaTools, tmp_path: Path
) -> None:
    keep_first_clip(portrait_clip, render_work.sources)
    render_work.sources.reviews.save_look(portrait_clip.project.id, Look(framing=Framing.STACK_TWO))

    rendered = render_first_clip(portrait_clip, render_work)

    faces = find_faces_in(read_frame(rendered, 3.0, media_tools), tmp_path)
    upper, lower = sorted(faces, key=lambda face: face.middle_down)
    assert is_whole(upper) and is_whole(lower)
    assert upper.middle_down < 0.5 < lower.middle_down
    assert upper.width < lower.width
    assert 1 / 3 < upper.middle_across < 2 / 3
    assert 1 / 3 < lower.middle_across < 2 / 3


def test_the_full_frame_framing_shows_the_two_faces_side_by_side(
    portrait_clip: CutTalk, render_work: RenderWork, media_tools: MediaTools, tmp_path: Path
) -> None:
    keep_first_clip(portrait_clip, render_work.sources)
    look = Look(framing=Framing.WHOLE_FRAME)
    render_work.sources.reviews.save_look(portrait_clip.project.id, look)

    rendered = render_first_clip(portrait_clip, render_work)

    faces = find_faces_in(read_frame(rendered, 3.0, media_tools), tmp_path)
    on_the_left, on_the_right = sorted(faces, key=lambda face: face.middle_across)
    assert is_whole(on_the_left) and is_whole(on_the_right)
    assert on_the_left.middle_across < 0.5 < on_the_right.middle_across
    assert 0.3 < on_the_left.middle_down < 0.7
    assert 0.3 < on_the_right.middle_down < 0.7


def test_the_progress_counts_the_search_for_faces_as_its_first_tenth_and_ends_at_100(
    portrait_clip: CutTalk, render_work: RenderWork
) -> None:
    keep_first_clip(portrait_clip, render_work.sources, sentences=(1, 1))
    percents: list[float] = []
    render = ClipRender(portrait_clip.project, "c01", threading.Event(), percents.append)

    render_clip(render, render_work)

    searched = [percent for percent in percents if percent <= 10.0]
    assert percents == sorted(percents)
    assert searched[-1] == 10.0
    assert len(searched) == 11
    assert percents[-1] == 100.0


@pytest.mark.parametrize("stopped_from_percent", [0.0, 30.0])
def test_a_stop_leaves_no_file_and_no_work_folder(
    stopped_from_percent: float, talk_with_source: CutTalk, render_work: RenderWork
) -> None:
    keep_first_clip(talk_with_source, render_work.sources)
    project_id = talk_with_source.project.id
    stop = threading.Event()

    def stop_once_there(percent: float) -> None:
        if percent >= stopped_from_percent:
            stop.set()

    with pytest.raises(MediaWorkStoppedError):
        render_clip(ClipRender(talk_with_source.project, "c01", stop, stop_once_there), render_work)

    data_folder = render_work.sources.data_folder
    assert not data_folder.export_file(project_id, 1, "c01").exists()
    assert not data_folder.render_work_dir(project_id, "c01").exists()


def test_what_a_killed_tool_left_in_the_work_folder_is_emptied_first_and_the_folder_removed(
    portrait_clip: CutTalk, render_work: RenderWork
) -> None:
    keep_first_clip(portrait_clip, render_work.sources, sentences=(1, 1))
    work_dir = render_work.sources.data_folder.render_work_dir(portrait_clip.project.id, "c01")
    (work_dir / "moments").mkdir(parents=True)
    (work_dir / "moments" / "00001.jpg").write_bytes(b"left behind")
    (work_dir / "clip.partial.mp4").write_bytes(b"left behind")

    rendered = render_first_clip(portrait_clip, render_work)

    assert rendered.stat().st_size > 10_000
    assert not work_dir.exists()
    assert [left.name for left in rendered.parent.iterdir()] == ["01-c01.mp4"]


def test_a_source_moved_away_fails_as_a_missing_source_and_makes_no_folder(
    talk_with_source: CutTalk, render_work: RenderWork
) -> None:
    keep_first_clip(talk_with_source, render_work.sources)
    data_folder, project_id = render_work.sources.data_folder, talk_with_source.project.id
    source = data_folder.find_source_file(project_id)
    assert source is not None
    source.rename(source.with_name("moved-aside.mp4"))

    with pytest.raises(SourceGoneError) as raised:
        render_first_clip(talk_with_source, render_work)

    assert str(raised.value) == f"Project {project_id} has no source video on this Mac."
    assert not data_folder.render_work_dir(project_id, "c01").exists()
    assert not data_folder.exports_dir(project_id).exists()


@pytest.mark.parametrize("clip_id", ["c02", "c99"])
def test_a_clip_that_is_not_kept_is_not_rendered(
    clip_id: str, talk_with_source: CutTalk, render_work: RenderWork
) -> None:
    keep_first_clip(talk_with_source, render_work.sources)
    render = ClipRender(talk_with_source.project, clip_id, threading.Event(), ignore_percent)

    with pytest.raises(ClipNotKeptError) as raised:
        render_clip(render, render_work)

    assert str(raised.value) == f"Clip {clip_id} is not a kept clip of its project."
