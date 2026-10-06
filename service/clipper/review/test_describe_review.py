from dataclasses import replace

import pytest

from ..projects import ClipLength, ProjectRepository
from ..selection import ReplayPeak
from ..storage import DataFolder
from .conftest import NEEDS_CONTEXT_NOTE, CutTalk, CutTheTalk
from .describe_review import ReviewSources, describe_review
from .review_records import (
    CaptionStyle,
    ClipPoint,
    ClipReview,
    Decision,
    Framing,
    Look,
    RejectReason,
)

REVIEW_FIELDS = {"look", "hasPreview", "clipSeconds", "windows", "clips"}
CLIP_FIELDS = {
    "id",
    "rank",
    "startSeconds",
    "endSeconds",
    "scores",
    "total",
    "reason",
    "title",
    "hookTitle",
    "hookType",
    "flag",
    "flagNote",
    "isReplayPeak",
    "decision",
    "rejectReason",
    "startSentence",
    "endSentence",
    "startNudge",
    "endNudge",
    "cutStartSentence",
    "cutEndSentence",
    "sentences",
    "captions",
    "frames",
}
STARTING_LOOK_JSON = {
    "captionStyle": "keyword",
    "framing": "follow-speaker",
    "showHookTitle": True,
    "showSafeZones": False,
}


def read_as_json(cut_talk: CutTalk, sources: ReviewSources) -> dict[str, object]:
    return describe_review(cut_talk.project, sources).model_dump(mode="json", by_alias=True)


def test_the_review_gives_every_part_under_its_name(
    cut_talk: CutTalk, sources: ReviewSources
) -> None:
    review = read_as_json(cut_talk, sources)

    assert set(review) == REVIEW_FIELDS
    assert review["look"] == STARTING_LOOK_JSON
    assert review["hasPreview"] is False
    assert review["clipSeconds"] == {"min": 25, "max": 60, "preferred": {"min": 25, "max": 50}}


def test_the_windows_are_given_as_the_selection_gives_them(
    cut_talk: CutTalk, sources: ReviewSources
) -> None:
    windows = describe_review(cut_talk.project, sources).windows

    assert [window.model_dump(by_alias=True) for window in windows][:2] == [
        {"id": "w01", "startSeconds": 0.0, "endSeconds": 89.92, "score": 72, "isShortlisted": True},
        {
            "id": "w02",
            "startSeconds": 63.84,
            "endSeconds": 151.02,
            "score": 81,
            "isShortlisted": True,
        },
    ]
    assert [(window.id, window.is_shortlisted) for window in windows[2:]] == [
        ("w03", True),
        ("w04", False),
    ]


def test_a_clip_gives_every_field_under_its_name(cut_talk: CutTalk, sources: ReviewSources) -> None:
    clips = describe_review(cut_talk.project, sources).clips
    flagged = clips[3].model_dump(mode="json", by_alias=True)
    kept_apart = {"sentences", "captions", "frames"}

    assert [set(clip.model_dump(by_alias=True)) for clip in clips] == [CLIP_FIELDS] * 6
    assert {name: value for name, value in flagged.items() if name not in kept_apart} == {
        "id": "c04",
        "rank": 4,
        "startSeconds": 120.16,
        "endSeconds": 161.46,
        "scores": {"hook": 20, "arc": 22, "value": 21, "share": 19},
        "total": 82,
        "reason": "Picked as part 4 of the talk.",
        "title": "The hotel order that almost ended the business",
        "hookTitle": "I let one customer become my boss",
        "hookType": "confession",
        "flag": "needs-context",
        "flagNote": NEEDS_CONTEXT_NOTE,
        "isReplayPeak": False,
        "decision": "undecided",
        "rejectReason": None,
        "startSentence": 31,
        "endSentence": 40,
        "startNudge": 0,
        "endNudge": 0,
        "cutStartSentence": 31,
        "cutEndSentence": 40,
    }


def test_the_clips_come_in_the_order_of_their_ranks_on_the_sentences_selection_cut(
    cut_talk: CutTalk, sources: ReviewSources
) -> None:
    clips = describe_review(cut_talk.project, sources).clips

    assert [(clip.id, clip.rank, clip.total) for clip in clips] == [
        ("c01", 1, 88),
        ("c02", 2, 84),
        ("c03", 3, 82),
        ("c04", 4, 82),
        ("c05", 5, 75),
        ("c06", 6, 55),
    ]
    assert [(clip.start_sentence, clip.end_sentence) for clip in clips] == [
        (4, 12),
        (23, 30),
        (13, 22),
        (31, 40),
        (41, 47),
        (48, 51),
    ]
    assert [clip.flag for clip in clips] == [
        None,
        None,
        None,
        "needs-context",
        None,
        "not-recommended",
    ]


def test_a_clip_lists_the_sentences_its_points_can_reach_with_their_times_and_text(
    cut_talk: CutTalk, sources: ReviewSources
) -> None:
    first, _, _, _, _, last = describe_review(cut_talk.project, sources).clips

    assert [sentence.number for sentence in first.sentences] == list(range(1, 16))
    assert [sentence.number for sentence in last.sentences] == list(range(45, 55))
    assert first.sentences[3].model_dump(by_alias=True) == {
        "number": 4,
        "startSeconds": 11.94,
        "endSeconds": 16.12,
        "text": "I want to tell you about the worst day my bakery ever had.",
    }


def test_the_captions_of_a_clip_hold_its_words_in_each_of_the_three_styles(
    cut_talk: CutTalk, sources: ReviewSources
) -> None:
    captions = describe_review(cut_talk.project, sources).clips[0].captions

    assert [word.text for word in captions.keyword[0].words] == ["I", "want", "to"]
    assert [word.text for word in captions.word_by_word[0].words] == ["I"]
    assert [word.text for word in captions.plain[0].words] == [
        "I",
        "want",
        "to",
        "tell",
        "you",
        "about",
    ]
    assert (captions.keyword[0].start_seconds, captions.plain[0].start_seconds) == (0.0, 0.0)
    assert captions.keyword[3].model_dump(by_alias=True) == {
        "startSeconds": captions.keyword[3].start_seconds,
        "words": [
            {"text": "my", "isHighlighted": False},
            {"text": "bakery", "isHighlighted": True},
            {"text": "ever", "isHighlighted": False},
        ],
    }
    assert [word.text for word in captions.keyword[-1].words][-1] == "silence"


def test_a_stored_review_gives_the_decision_the_title_and_the_times_as_they_stand(
    cut_talk: CutTalk, sources: ReviewSources
) -> None:
    moved = ClipReview(
        start=ClipPoint(3, -2),
        end=ClipPoint(13, 5),
        decision=Decision.REJECT,
        reject_reason=RejectReason.CUT_OFF,
        title="The morning the oven broke",
    )
    sources.reviews.save_review(cut_talk.project.id, "c01", moved)

    clip = describe_review(cut_talk.project, sources).clips[0]

    assert (clip.decision, clip.reject_reason) == ("reject", "cut-off")
    assert clip.title == "The morning the oven broke"
    assert (clip.start_sentence, clip.start_nudge, clip.end_sentence, clip.end_nudge) == (
        3,
        -2,
        13,
        5,
    )
    assert (clip.start_seconds, clip.end_seconds) == (5.32, 51.3)
    assert (clip.cut_start_sentence, clip.cut_end_sentence) == (4, 12)
    assert clip.captions.keyword[0].start_seconds == 0.4
    assert [word.text for word in clip.captions.plain[0].words][:3] == ["The", "coffee", "is"]


def test_a_review_without_an_edited_title_gives_the_title_of_the_selection(
    cut_talk: CutTalk, sources: ReviewSources
) -> None:
    kept = ClipReview(start=ClipPoint(23), end=ClipPoint(30), decision=Decision.KEEP)
    sources.reviews.save_review(cut_talk.project.id, "c02", kept)

    clip = describe_review(cut_talk.project, sources).clips[1]

    assert (clip.decision, clip.reject_reason) == ("keep", None)
    assert clip.title == "Hire for the habits you cannot teach"


def test_the_twelve_places_for_frames_hold_the_address_of_each_frame_that_is_on_disk(
    cut_talk: CutTalk, sources: ReviewSources, data_folder: DataFolder
) -> None:
    project_id = cut_talk.project.id
    data_folder.frames_dir(project_id).mkdir()
    for number in (1, 2, 12):
        data_folder.frame_file(project_id, "c02", number).write_bytes(b"\xff\xd8\xff")

    first, second, *_ = describe_review(cut_talk.project, sources).clips

    assert first.frames == [None] * 12
    assert second.frames == [
        f"/api/projects/{project_id}/clips/c02/frames/1",
        f"/api/projects/{project_id}/clips/c02/frames/2",
        *[None] * 9,
        f"/api/projects/{project_id}/clips/c02/frames/12",
    ]


@pytest.mark.parametrize(
    ("clip_length", "limits"),
    [
        (ClipLength.SHORT, {"min": 15, "max": 30, "preferred": None}),
        (ClipLength.STANDARD, {"min": 25, "max": 60, "preferred": {"min": 25, "max": 50}}),
        (ClipLength.LONG, {"min": 60, "max": 180, "preferred": None}),
    ],
)
def test_each_preset_gives_its_limits_and_only_the_25_to_60_one_a_preferred_band(
    clip_length: ClipLength,
    limits: dict[str, object],
    cut_the_talk: CutTheTalk,
    sources: ReviewSources,
) -> None:
    review = describe_review(cut_the_talk(clip_length).project, sources)

    assert review.clip_seconds.model_dump() == limits


def test_the_look_of_the_project_is_given_as_stored(
    cut_talk: CutTalk, sources: ReviewSources
) -> None:
    stored = Look(CaptionStyle.WORD_BY_WORD, Framing.STACK_TWO, False, True)
    sources.reviews.save_look(cut_talk.project.id, stored)

    look = describe_review(cut_talk.project, sources).look

    assert look.model_dump(mode="json", by_alias=True) == {
        "captionStyle": "word-by-word",
        "framing": "stack-two",
        "showHookTitle": False,
        "showSafeZones": True,
    }


def test_a_clip_under_a_replay_peak_carries_the_marker(
    cut_talk: CutTalk, sources: ReviewSources
) -> None:
    marked = [replace(cut_talk.candidates[0], is_replay_peak=True), *cut_talk.candidates[1:]]
    sources.selection.replace_candidates(cut_talk.project.id, marked, [ReplayPeak(20.0, 30.0)])

    clips = describe_review(cut_talk.project, sources).clips

    assert [clip.is_replay_peak for clip in clips] == [True, False, False, False, False, False]


def test_with_the_preview_copy_on_the_mac_the_review_says_so(
    cut_talk: CutTalk, sources: ReviewSources, data_folder: DataFolder
) -> None:
    data_folder.preview_file(cut_talk.project.id).write_bytes(b"a video")

    assert describe_review(cut_talk.project, sources).has_preview is True


def test_a_review_with_the_preview_copy_removed_says_so_and_still_gives_its_clips(
    cut_talk: CutTalk, sources: ReviewSources, data_folder: DataFolder
) -> None:
    preview = data_folder.preview_file(cut_talk.project.id)
    preview.write_bytes(b"a video")
    preview.unlink()

    review = describe_review(cut_talk.project, sources)

    assert review.has_preview is False
    assert [clip.id for clip in review.clips] == ["c01", "c02", "c03", "c04", "c05", "c06"]
    assert len(review.clips[0].captions.keyword) > 0


def test_a_project_without_candidates_answers_with_no_clips_and_reads_no_transcript(
    cut_talk: CutTalk,
    sources: ReviewSources,
    data_folder: DataFolder,
    repository: ProjectRepository,
) -> None:
    sources.selection.replace_candidates(cut_talk.project.id, [], [])
    (data_folder.project_dir(cut_talk.project.id) / "transcript.json").unlink()

    review = describe_review(repository.get(cut_talk.project.id), sources)

    assert review.clips == []
    assert len(review.windows) == 4
    assert review.clip_seconds.max == 60
