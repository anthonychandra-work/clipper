import pytest

from .conftest import CutTalk
from .describe_review import ReviewSources, describe_review
from .read_standing_review import read_standing_review
from .review_records import (
    STARTING_LOOK,
    CaptionStyle,
    ClipPoint,
    ClipReview,
    Decision,
    Framing,
    Look,
    RejectReason,
)


def test_every_clip_stands_as_selection_cut_it_until_it_is_reviewed(
    cut_talk: CutTalk, sources: ReviewSources
) -> None:
    standing = read_standing_review(cut_talk.project, sources)

    assert standing.look == STARTING_LOOK
    assert [clip.candidate for clip in standing.clips] == cut_talk.candidates
    assert {clip.decision for clip in standing.clips} == {Decision.UNDECIDED}
    assert standing.clips[0].title == "The worst day my bakery ever had"
    assert (standing.clips[0].times.start_seconds, standing.clips[0].times.end_seconds) == (
        11.94,
        44.7,
    )
    assert [clip.seconds for clip in standing.clips] == [32.76, 33.18, 41.32, 41.3, 31.16, 29.52]


def test_a_clip_stands_with_its_decision_its_typed_title_and_its_moved_points(
    cut_talk: CutTalk, sources: ReviewSources
) -> None:
    moved = ClipReview(
        start=ClipPoint(5, nudge=-2), end=ClipPoint(11), decision=Decision.KEEP, title="Mine"
    )
    rejected = ClipReview(ClipPoint(23), ClipPoint(30), Decision.REJECT, RejectReason.REPEAT)
    sources.reviews.save_review(cut_talk.project.id, "c01", moved)
    sources.reviews.save_review(cut_talk.project.id, "c02", rejected)

    first, second = read_standing_review(cut_talk.project, sources).clips[:2]

    sentences = cut_talk.sentences
    assert (first.decision, first.title) == (Decision.KEEP, "Mine")
    assert first.times.start_seconds == pytest.approx(sentences[4].start - 0.4)
    assert first.times.end_seconds == pytest.approx(sentences[10].end)
    assert first.seconds == pytest.approx(sentences[10].end - sentences[4].start + 0.4)
    assert (second.decision, second.title) == (
        Decision.REJECT,
        "Hire for the habits you cannot teach",
    )


@pytest.mark.parametrize(
    ("style", "first_words"),
    [
        (CaptionStyle.KEYWORD, ["I", "want", "to"]),
        (CaptionStyle.WORD_BY_WORD, ["I"]),
        (CaptionStyle.PLAIN, ["I", "want", "to", "tell", "you", "about"]),
    ],
)
def test_the_captions_of_a_clip_are_grouped_in_the_style_of_the_project_s_look(
    style: CaptionStyle, first_words: list[str], cut_talk: CutTalk, sources: ReviewSources
) -> None:
    look = Look(caption_style=style, framing=Framing.STACK_TWO, show_hook_title=False)
    sources.reviews.save_look(cut_talk.project.id, look)

    standing = read_standing_review(cut_talk.project, sources)

    first_caption = standing.clips[0].captions[0]
    assert standing.look == look
    assert (first_caption.start_seconds, [word.text for word in first_caption.words]) == (
        0.0,
        first_words,
    )


def test_the_captions_are_the_ones_the_review_tab_is_given(
    cut_talk: CutTalk, sources: ReviewSources
) -> None:
    given = describe_review(cut_talk.project, sources).clips[0].captions.keyword

    captions = read_standing_review(cut_talk.project, sources).clips[0].captions

    assert [(caption.start_seconds, len(caption.words)) for caption in captions] == [
        (caption.start_seconds, len(caption.words)) for caption in given
    ]
    assert [word.text for word in captions[1].words] == ["tell", "you", "about"]
    assert captions[1].start_seconds == 0.78


def test_a_project_without_candidates_stands_with_its_look_and_reads_no_transcript(
    cut_talk: CutTalk, sources: ReviewSources
) -> None:
    sources.selection.replace_candidates(cut_talk.project.id, [], [])
    (sources.data_folder.project_dir(cut_talk.project.id) / "transcript.json").unlink()

    standing = read_standing_review(cut_talk.project, sources)

    assert (standing.look, standing.clips) == (STARTING_LOOK, [])
