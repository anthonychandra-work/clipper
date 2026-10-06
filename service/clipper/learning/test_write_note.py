from .history_records import ClipKey, Outcome, PastDecision
from .write_note import write_note

FIVE_DECISIONS_TWO_REJECTED = (
    "Of the last 5 clips this user decided on, 2 were rejected: 1 cut off mid-thought, 1 not "
    "interesting, 0 needing earlier context, 0 repeating another clip."
)
THREE_POSTED = (
    "Of 3 posted clips with views logged, the best third opened with these hooks: hot-take 1, "
    "and lasted 41 seconds. The worst third opened with: story 1, and lasted 33 seconds."
)
NINE_POSTED = (
    "Of 9 posted clips with views logged, the best third opened with these hooks: story 2, "
    "number 1, and lasted 28 to 41 seconds. The worst third opened with: none 2, list 1, and "
    "lasted 49 to 58 seconds."
)


def keep(number: int) -> PastDecision:
    return PastDecision(ClipKey("a1b2c3", f"c{number:02d}"), is_rejection=False)


def reject(number: int, reason: str | None) -> PastDecision:
    return PastDecision(ClipKey("a1b2c3", f"c{number:02d}"), True, reason)


def post(views: int, hook_type: str, seconds: float) -> Outcome:
    return Outcome(ClipKey("a1b2c3", f"posted-with-{views}"), views, hook_type, seconds)


THE_SEEDED_DECISIONS = [
    reject(6, "cut-off"),
    reject(5, "not-interesting"),
    keep(3),
    keep(2),
    keep(1),
]
THE_SEEDED_OUTCOMES = [
    post(1200, "story", 32.76),
    post(5400, "contrarian", 33.18),
    post(48000, "hot-take", 41.32),
]
NINE_OUTCOMES = [
    post(900, "none", 49.0),
    post(52000, "story", 28.2),
    post(7000, "list", 44.4),
    post(31000, "number", 41.4),
    post(1500, "list", 55.5),
    post(6000, "story", 30.0),
    post(300, "none", 58.3),
    post(5000, "confession", 36.0),
    post(40000, "story", 33.0),
]


def test_no_history_gives_no_note() -> None:
    assert write_note([], []) is None


def test_decisions_that_are_all_keeps_give_no_note() -> None:
    assert write_note([keep(number) for number in range(1, 9)], []) is None


def test_two_rejections_among_five_decisions_name_all_four_reasons_two_of_them_at_0() -> None:
    assert write_note(THE_SEEDED_DECISIONS, []) == FIVE_DECISIONS_TWO_REJECTED


def test_a_rejection_without_a_reason_counts_in_the_total_alone() -> None:
    decisions = [reject(3, None), reject(2, "repeat"), keep(1)]

    assert write_note(decisions, []) == (
        "Of the last 3 clips this user decided on, 2 were rejected: 0 cut off mid-thought, 0 not "
        "interesting, 0 needing earlier context, 1 repeating another clip."
    )


def test_60_decisions_read_the_last_50_and_count_the_50_newest() -> None:
    newest_fifty = [reject(number, "needs-context") for number in range(60, 10, -1)]
    oldest_ten = [reject(number, "cut-off") for number in range(10, 0, -1)]

    assert write_note(newest_fifty + oldest_ten, []) == (
        "Of the last 50 clips this user decided on, 50 were rejected: 0 cut off mid-thought, 0 "
        "not interesting, 50 needing earlier context, 0 repeating another clip."
    )


def test_two_clips_with_views_give_no_second_line() -> None:
    assert write_note([], THE_SEEDED_OUTCOMES[:2]) is None
    assert write_note(THE_SEEDED_DECISIONS, THE_SEEDED_OUTCOMES[:2]) == FIVE_DECISIONS_TWO_REJECTED


def test_three_clips_with_views_give_thirds_of_one_clip_each() -> None:
    assert write_note([], THE_SEEDED_OUTCOMES) == THREE_POSTED


def test_nine_clips_give_thirds_of_three_with_their_hook_types_by_number_and_both_lengths() -> None:
    assert write_note([], NINE_OUTCOMES) == NINE_POSTED


def test_seven_clips_with_views_give_thirds_of_two() -> None:
    seven = [outcome for outcome in NINE_OUTCOMES if outcome.views not in (52000, 300)]

    assert write_note([], seven) == (
        "Of 7 posted clips with views logged, the best third opened with these hooks: story 1, "
        "number 1, and lasted 33 to 41 seconds. The worst third opened with: list 1, none 1, and "
        "lasted 49 to 56 seconds."
    )


def test_a_third_whose_clips_are_equally_long_gives_one_number() -> None:
    six = [
        post(600, "story", 30.2),
        post(500, "story", 29.8),
        post(400, "list", 45.0),
        post(300, "list", 50.0),
        post(200, "none", 52.4),
        post(100, "none", 52.0),
    ]

    assert write_note([], six) == (
        "Of 6 posted clips with views logged, the best third opened with these hooks: story 2, "
        "and lasted 30 seconds. The worst third opened with: none 2, and lasted 52 seconds."
    )


def test_clips_with_equal_views_keep_the_order_they_were_given_in() -> None:
    equal = [post(500, "story", 30.0), post(500, "list", 40.0), post(500, "none", 50.0)]

    assert write_note([], equal) == (
        "Of 3 posted clips with views logged, the best third opened with these hooks: story 1, "
        "and lasted 30 seconds. The worst third opened with: none 1, and lasted 50 seconds."
    )


def test_both_lines_are_joined_by_a_line_break() -> None:
    note = write_note(THE_SEEDED_DECISIONS, THE_SEEDED_OUTCOMES)

    assert note == f"{FIVE_DECISIONS_TWO_REJECTED}\n{THREE_POSTED}"
