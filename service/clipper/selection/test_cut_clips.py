import threading
from copy import deepcopy

import pytest
from pydantic import ValidationError

from ..conftest import CLOSED_LOCAL_PORT
from ..settings import ClaudeModel
from ..transcription import Transcript
from .ask_claude import ClaudeAccess
from .clip_proposal import ProposedClip, ProposedClips
from .conftest import TEST_KEY, RecordedClaude
from .cut_clips import CUT_INSTRUCTIONS, CutTask, cut_clips, write_cut_question
from .place_quote import place_quote
from .selection_records import ClipFlag, HookType, PlatformText
from .selection_task import ClipSeconds, PassContext
from .split_sentences import Sentence, split_sentences
from .split_windows import Window, split_windows
from .transcript_part import write_transcript_part

BRIEF = "Advice a shop owner can use."
TEXT = {"title": "The oven broke", "description": "What a bad morning taught a baker."}
CLIP = {
    "openingWords": "I want to tell you about the worst day",
    "closingWords": "What they do not forgive is silence.",
    "scores": {"hook": 23, "arc": 23, "value": 20, "share": 22},
    "reason": "A whole story that ends on a line worth quoting.",
    "title": "The worst day my bakery ever had",
    "hookTitle": "The oven broke before sunrise",
    "hookType": "story",
    "flag": None,
    "platforms": {"tiktok": TEXT, "reels": TEXT, "shorts": TEXT},
}
PLACED_BY_WINDOW = {
    "w01": [(4, 12, 11.94, 44.7), (13, 22, 45.22, 86.54), (5, 12, 16.3, 44.7)],
    "w02": [(23, 30, 86.54, 119.72), (31, 40, 120.16, 161.46), None],
    "w03": [(41, 47, 161.8, 192.96), (48, 51, 193.4, 222.92), (41, 51, 161.8, 222.92)],
}


def describe_context(address: str, transcript_part: str) -> PassContext:
    return PassContext(
        access=ClaudeAccess(key=TEST_KEY, address=address),
        model=ClaudeModel.OPUS,
        transcript_part=transcript_part,
        clip_seconds=ClipSeconds(min=25, max=60),
        language="en",
        brief=BRIEF,
        stop=threading.Event(),
    )


def lay_out_the_talk(talk_transcript: Transcript) -> tuple[list[Sentence], dict[str, Window]]:
    sentences = split_sentences(talk_transcript.words)
    return sentences, {window.id: window for window in split_windows(sentences)}


def change_clip(**changes: object) -> dict[str, object]:
    return {"clips": [{**deepcopy(CLIP), **changes}]}


def place(
    clip: ProposedClip, window: Window, sentences: list[Sentence]
) -> tuple[object, ...] | None:
    placed = place_quote(clip.opening_words, clip.closing_words, window, sentences)
    if placed is None:
        return None
    return (placed.first_sentence, placed.last_sentence, placed.start_seconds, placed.end_seconds)


def test_the_instructions_carry_the_rules_of_a_clip() -> None:
    instructions = " ".join(CUT_INSTRUCTIONS.split())

    assert "opens on its hook" in instructions
    assert "makes sense to someone who has seen nothing else of this video" in instructions
    assert "completes its setup and its payoff" in instructions
    assert "starts on the first word of a sentence and ends on the last word of a sentence" in (
        instructions
    )
    assert "A clip may end after the window does." in instructions


def test_the_instructions_leave_out_intros_outros_sponsor_reads_and_housekeeping() -> None:
    assert "Leave out intros, outros, sponsor reads and housekeeping." in CUT_INSTRUCTIONS


def test_the_instructions_prefer_25_to_50_seconds_for_the_standard_preset_and_forbid_padding() -> (
    None
):
    instructions = " ".join(CUT_INSTRUCTIONS.split())

    assert "When the limits are 25 and 60 seconds, a clip of 25 to 50 seconds is preferred." in (
        instructions
    )
    assert "Never pad a clip" in instructions
    assert "a clip outside these limits is thrown away" in instructions


def test_the_instructions_ask_for_quoted_words_and_for_no_time() -> None:
    instructions = " ".join(CUT_INSTRUCTIONS.split())

    assert "quoted exactly as the transcript has them" in instructions
    assert "Give no time and no sentence number." in instructions


def test_the_instructions_ask_for_a_short_hook_title_and_for_the_language_of_the_transcript() -> (
    None
):
    instructions = " ".join(CUT_INSTRUCTIONS.split())

    assert "hookTitle: at most ten words" in instructions
    assert "It names something the clip really holds." in instructions
    assert "Write every title, hook title and description in the language of the transcript." in (
        instructions
    )


def test_the_cut_task_names_itself_its_window_the_number_asked_for_and_what_both_passes_share(
    talk_transcript: Transcript,
) -> None:
    sentences, windows = lay_out_the_talk(talk_transcript)
    context = describe_context(CLOSED_LOCAL_PORT, write_transcript_part(sentences))

    question = write_cut_question(windows["w02"], 2, context)

    assert question.task == (
        '{"task":"cut","window":{"id":"w02","firstSentence":17,"lastSentence":38},'
        '"clipCount":2,"clipSeconds":{"min":25,"max":60},"language":"en",'
        '"brief":"Advice a shop owner can use."}'
    )
    assert (question.model, question.effort) == (ClaudeModel.OPUS, "high")
    assert (question.system, question.transcript_part) == (
        CUT_INSTRUCTIONS,
        context.transcript_part,
    )
    assert question.reply_model is ProposedClips


def test_a_reply_may_hold_no_clip() -> None:
    assert ProposedClips.model_validate({"clips": []}).clips == []


def test_a_clip_is_read_with_every_field_of_the_reply() -> None:
    (clip,) = ProposedClips.model_validate({"clips": [CLIP]}).clips

    assert clip.opening_words == "I want to tell you about the worst day"
    assert clip.closing_words == "What they do not forgive is silence."
    assert clip.scores.model_dump() == {"hook": 23, "arc": 23, "value": 20, "share": 22}
    assert (clip.title, clip.hook_title) == (CLIP["title"], CLIP["hookTitle"])
    assert (clip.hook_type, clip.flag) == (HookType.STORY, None)
    assert clip.platforms.reels == PlatformText(TEXT["title"], TEXT["description"])


@pytest.mark.parametrize("kind", ["needs-context", "not-recommended"])
def test_a_flag_is_one_of_the_two_with_its_sentence(kind: str) -> None:
    flagged = change_clip(flag={"kind": kind, "note": "Opens on “that”."})

    (clip,) = ProposedClips.model_validate(flagged).clips

    assert clip.flag is not None
    assert (clip.flag.kind, clip.flag.note) == (ClipFlag(kind), "Opens on “that”.")


@pytest.mark.parametrize(
    "hook_type", ["number", "story", "list", "hot-take", "confession", "contrarian", "none"]
)
def test_each_of_the_seven_hook_types_fits_the_reply(hook_type: str) -> None:
    (clip,) = ProposedClips.model_validate(change_clip(hookType=hook_type)).clips

    assert clip.hook_type == HookType(hook_type)


@pytest.mark.parametrize(
    "changes",
    [
        {"scores": {"hook": 26, "arc": 23, "value": 20, "share": 22}},
        {"scores": {"hook": 23, "arc": -1, "value": 20, "share": 22}},
        {"scores": {"hook": 23, "arc": 23, "value": 20.5, "share": 22}},
        {"scores": {"hook": 23, "arc": 23, "value": 20}},
        {"hookTitle": "One two three four five six seven eight nine ten eleven"},
        {"hookTitle": "  "},
        {"hookType": "question"},
        {"flag": {"kind": "too-long", "note": "Runs on."}},
        {"flag": {"kind": "needs-context"}},
        {"platforms": {"tiktok": TEXT, "reels": TEXT}},
        {"closingWords": None},
    ],
)
def test_a_clip_outside_the_limits_of_the_reply_does_not_fit_it(changes: dict[str, object]) -> None:
    with pytest.raises(ValidationError):
        ProposedClips.model_validate(change_clip(**changes))


def test_a_hook_title_of_exactly_ten_words_fits_the_reply() -> None:
    ten_words = "One two three four five six seven eight nine ten"

    (clip,) = ProposedClips.model_validate(change_clip(hookTitle=ten_words)).clips

    assert clip.hook_title == ten_words


@pytest.mark.parametrize("window_id", ["w01", "w02", "w03"])
def test_each_recorded_reply_is_read_and_every_clip_but_the_one_with_an_absent_quote_is_placed(
    recorded_claude: RecordedClaude, talk_transcript: Transcript, window_id: str
) -> None:
    sentences, windows = lay_out_the_talk(talk_transcript)
    context = describe_context(recorded_claude.at("talk"), write_transcript_part(sentences))

    clips = cut_clips(windows[window_id], 2, context)

    (request,) = recorded_claude.list_requests()
    task = CutTask.model_validate(request.read_task())
    assert [place(clip, windows[window_id], sentences) for clip in clips] == (
        PLACED_BY_WINDOW[window_id]
    )
    assert (task.window.id, task.clip_count, task.brief) == (window_id, 2, BRIEF)
    assert request.body["model"] == "claude-opus-5-5"
    assert request.read_output_config()["effort"] == "high"
    assert request.body["system"] == CUT_INSTRUCTIONS


def test_a_clip_whose_opening_words_are_absent_is_not_placed_while_the_others_of_its_reply_are(
    recorded_claude: RecordedClaude, talk_transcript: Transcript
) -> None:
    sentences, windows = lay_out_the_talk(talk_transcript)
    context = describe_context(recorded_claude.at("talk"), write_transcript_part(sentences))

    clips = cut_clips(windows["w02"], 2, context)

    placed = [place(clip, windows["w02"], sentences) for clip in clips]
    assert [clip.opening_words for clip in clips][2] == "The secret to pricing bread is simple."
    assert [found is not None for found in placed] == [True, True, False]


def test_the_recorded_replies_hold_the_flags_the_equal_totals_and_the_clip_that_runs_long(
    recorded_claude: RecordedClaude, talk_transcript: Transcript
) -> None:
    sentences, windows = lay_out_the_talk(talk_transcript)
    context = describe_context(recorded_claude.at("talk"), write_transcript_part(sentences))

    clips = [
        clip for name in ("w01", "w02", "w03") for clip in cut_clips(windows[name], 2, context)
    ]

    totals = [sum(clip.scores.model_dump().values()) for clip in clips]
    flags = [clip.flag.kind if clip.flag else None for clip in clips]
    assert totals == [88, 82, 80, 84, 82, 70, 75, 55, 78]
    assert flags == [None, None, None, None, "needs-context", None, None, "not-recommended", None]
    assert len(recorded_claude.list_requests()) == 3
