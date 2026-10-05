import threading

import pytest

from ..settings import ClaudeModel, ClipsPerVideo
from ..transcription import Transcript
from .ask_claude import ClaudeAccess
from .choose_candidates import PlacedClip, choose_candidates
from .clip_limits import count_clips
from .clip_proposal import ProposedClip
from .conftest import TEST_KEY, RecordedClaude
from .cut_clips import cut_clips
from .place_quote import Placement, place_quote
from .selection_records import ClipFlag, HookType, PlatformText, Subscores
from .selection_task import ClipSeconds, PassContext
from .split_sentences import split_sentences
from .split_windows import split_windows
from .transcript_part import write_transcript_part

STANDARD = ClipSeconds(min=25, max=60)
MOST_OF_A_SUBSCORE = 25
TEXT = {"title": "The oven broke", "description": "What a bad morning taught a baker."}
SIX_PARTS_BEST_FIRST = [
    (11.94, 44.7, 88),
    (86.54, 119.72, 84),
    (45.22, 86.54, 82),
    (120.16, 161.46, 82),
    (161.8, 192.96, 75),
    (193.4, 222.92, 55),
]


def split_total(total: int) -> dict[str, int]:
    scores: dict[str, int] = {}
    left = total
    for name in ("hook", "arc", "value", "share"):
        scores[name] = min(MOST_OF_A_SUBSCORE, left)
        left -= scores[name]
    return scores


def make_clip(start: float, end: float, total: int = 80, **changes: object) -> PlacedClip:
    fields = {
        "openingWords": "I want to tell you",
        "closingWords": "is silence.",
        "scores": split_total(total),
        "reason": "A whole story.",
        "title": f"A clip from {start}",
        "hookTitle": "The oven broke",
        "hookType": "story",
        "flag": None,
        "platforms": {"tiktok": TEXT, "reels": TEXT, "shorts": TEXT},
    }
    proposal = ProposedClip.model_validate({**fields, **changes})
    return PlacedClip(proposal, Placement(1, 2, start_seconds=start, end_seconds=end))


def test_a_clip_shorter_or_longer_than_the_preset_is_dropped() -> None:
    clips = [make_clip(0, 24.99), make_clip(100, 130), make_clip(200, 260.01)]

    candidates = choose_candidates(clips, STANDARD, most_kept=12)

    assert [(c.start_seconds, c.end_seconds) for c in candidates] == [(100, 130)]


@pytest.mark.parametrize(("start", "end"), [(100, 125), (100, 160), (10.02, 35.02), (10.02, 70.02)])
def test_a_clip_exactly_on_an_edge_of_the_preset_is_kept(start: float, end: float) -> None:
    candidates = choose_candidates([make_clip(start, end)], STANDARD, most_kept=12)

    assert [(c.start_seconds, c.end_seconds) for c in candidates] == [(start, end)]


def test_no_clip_is_lengthened_or_shortened_to_fit_the_preset() -> None:
    clips = [make_clip(0, 24.5), make_clip(100, 161), make_clip(300, 331.37)]

    candidates = choose_candidates(clips, STANDARD, most_kept=12)

    assert [(c.start_seconds, c.end_seconds) for c in candidates] == [(300, 331.37)]


def test_candidates_are_ranked_by_total_and_of_equal_totals_the_earlier_one_first() -> None:
    clips = [
        make_clip(300, 330, total=70),
        make_clip(200, 230, total=82),
        make_clip(0, 30, total=70),
        make_clip(100, 130, total=82),
        make_clip(400, 430, total=95),
    ]

    candidates = choose_candidates(clips, STANDARD, most_kept=12)

    assert [(c.rank, c.start_seconds, c.total) for c in candidates] == [
        (1, 400, 95),
        (2, 100, 82),
        (3, 200, 82),
        (4, 0, 70),
        (5, 300, 70),
    ]
    assert [c.id for c in candidates] == ["c01", "c02", "c03", "c04", "c05"]


def test_of_two_clips_that_overlap_by_more_than_half_of_the_shorter_the_lower_ranked_goes() -> None:
    better, worse = make_clip(100, 140, total=88), make_clip(119.99, 150, total=80)

    candidates = choose_candidates([worse, better], STANDARD, most_kept=12)

    assert [(c.start_seconds, c.total) for c in candidates] == [(100, 88)]


def test_a_pair_that_overlaps_by_exactly_half_of_the_shorter_is_kept() -> None:
    longer, shorter = make_clip(100, 140, total=88), make_clip(125, 155, total=80)

    candidates = choose_candidates([longer, shorter], STANDARD, most_kept=12)

    assert [(c.start_seconds, c.end_seconds) for c in candidates] == [(100, 140), (125, 155)]


def test_a_short_clip_inside_a_longer_one_overlaps_it_wholly() -> None:
    longer, inside = make_clip(100, 160, total=70), make_clip(110, 136, total=90)

    candidates = choose_candidates([longer, inside], STANDARD, most_kept=12)

    assert [(c.start_seconds, c.total) for c in candidates] == [(110, 90)]


def test_clips_that_only_touch_do_not_overlap() -> None:
    candidates = choose_candidates(
        [make_clip(100, 130), make_clip(130, 160)], STANDARD, most_kept=12
    )

    assert len(candidates) == 2


def test_a_dropped_clip_does_not_drop_the_one_that_overlapped_only_it() -> None:
    best = make_clip(100, 140, total=90)
    dropped = make_clip(118, 158, total=80)
    last = make_clip(150, 190, total=70)

    candidates = choose_candidates([last, dropped, best], STANDARD, most_kept=12)

    assert [(c.rank, c.start_seconds) for c in candidates] == [(1, 100), (2, 150)]


def test_thirteen_clips_on_auto_become_twelve() -> None:
    clips = [make_clip(100.0 * at, 100.0 * at + 30, total=60 + at) for at in range(13)]
    most_kept = count_clips(ClipsPerVideo.AUTO, 30 * 60).kept

    candidates = choose_candidates(clips, STANDARD, most_kept)

    assert [c.rank for c in candidates] == list(range(1, 13))
    assert [c.total for c in candidates] == list(range(72, 60, -1))


def test_a_fixed_target_of_4_keeps_the_best_four() -> None:
    clips = [make_clip(100.0 * at, 100.0 * at + 30, total=60 + at) for at in range(13)]
    most_kept = count_clips(ClipsPerVideo.FOUR, 30 * 60).kept

    candidates = choose_candidates(clips, STANDARD, most_kept)

    assert [(c.rank, c.total) for c in candidates] == [(1, 72), (2, 71), (3, 70), (4, 69)]


def test_a_clip_dropped_for_its_overlap_does_not_take_a_place_among_those_kept() -> None:
    clips = [
        make_clip(0, 30, total=90),
        make_clip(5, 35, total=89),
        make_clip(100, 130, total=70),
        make_clip(200, 230, total=60),
    ]

    candidates = choose_candidates(clips, STANDARD, most_kept=3)

    assert [c.total for c in candidates] == [90, 70, 60]


def test_no_clip_gives_no_candidate() -> None:
    assert choose_candidates([], STANDARD, most_kept=12) == []
    assert choose_candidates([make_clip(0, 5)], STANDARD, most_kept=12) == []


def test_a_candidate_carries_the_fields_of_its_clip_and_the_total_of_its_subscores() -> None:
    flag = {"kind": "needs-context", "note": "Opens on “also”."}
    clip = make_clip(120.16, 161.46, total=82, hookType="confession", flag=flag)

    (candidate,) = choose_candidates([clip], STANDARD, most_kept=12)

    assert candidate.scores == Subscores(hook=25, arc=25, value=25, share=7)
    assert candidate.total == 82
    assert (candidate.reason, candidate.title) == ("A whole story.", "A clip from 120.16")
    assert (candidate.hook_title, candidate.hook_type) == ("The oven broke", HookType.CONFESSION)
    assert (candidate.flag, candidate.flag_note) == (ClipFlag.NEEDS_CONTEXT, "Opens on “also”.")
    assert candidate.platforms.shorts == PlatformText(TEXT["title"], TEXT["description"])
    assert candidate.is_replay_peak is False


def test_a_candidate_without_a_flag_carries_none() -> None:
    (candidate,) = choose_candidates([make_clip(0, 30)], STANDARD, most_kept=12)

    assert (candidate.flag, candidate.flag_note) == (None, None)


def test_the_placed_clips_of_the_three_recorded_replies_give_the_six_parts_of_the_talk(
    recorded_claude: RecordedClaude, talk_transcript: Transcript
) -> None:
    sentences = split_sentences(talk_transcript.words)
    context = PassContext(
        access=ClaudeAccess(key=TEST_KEY, address=recorded_claude.at("talk")),
        model=ClaudeModel.OPUS,
        transcript_part=write_transcript_part(sentences),
        clip_seconds=STANDARD,
        language="en",
        brief="",
        stop=threading.Event(),
    )
    placed_clips: list[PlacedClip] = []
    for window in split_windows(sentences)[:3]:
        for clip in cut_clips(window, 2, context):
            placement = place_quote(clip.opening_words, clip.closing_words, window, sentences)
            if placement is not None:
                placed_clips.append(PlacedClip(clip, placement))

    candidates = choose_candidates(placed_clips, STANDARD, most_kept=12)

    assert len(placed_clips) == 8
    assert [(c.start_seconds, c.end_seconds, c.total) for c in candidates] == SIX_PARTS_BEST_FIRST
    assert [c.rank for c in candidates] == [1, 2, 3, 4, 5, 6]
    assert [c.flag for c in candidates] == [
        None,
        None,
        None,
        ClipFlag.NEEDS_CONTEXT,
        None,
        ClipFlag.NOT_RECOMMENDED,
    ]
