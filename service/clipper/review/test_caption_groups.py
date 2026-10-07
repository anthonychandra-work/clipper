from ..selection import Candidate, Sentence, split_sentences
from ..transcription import TranscriptWord
from .caption_groups import Caption, CaptionWord, group_captions
from .review_records import CaptionStyle

KEYWORD, WORD_BY_WORD, PLAIN = CaptionStyle.KEYWORD, CaptionStyle.WORD_BY_WORD, CaptionStyle.PLAIN
SECONDS_PER_WORD = 0.5
SPOKEN = "We raised every single price by twelve percent overnight. Nobody left angry."


def speak(text: str, start: float = 10.0) -> list[Sentence]:
    words = [
        TranscriptWord(
            text=f" {word}",
            start=start + place * SECONDS_PER_WORD,
            end=start + (place + 1) * SECONDS_PER_WORD,
        )
        for place, word in enumerate(text.split())
    ]
    return split_sentences(words)


def read_texts(captions: list[Caption]) -> list[str]:
    return [" ".join(word.text for word in caption.words) for caption in captions]


def read_highlights(captions: list[Caption]) -> list[list[str]]:
    return [[word.text for word in caption.words if word.is_highlighted] for caption in captions]


def test_the_keyword_style_takes_three_words_to_a_caption() -> None:
    captions = group_captions(speak(SPOKEN), KEYWORD, 10.0)

    assert read_texts(captions) == [
        "We raised every",
        "single price by",
        "twelve percent overnight",
        "Nobody left angry",
    ]


def test_the_word_by_word_style_takes_one_word_to_a_caption() -> None:
    captions = group_captions(speak("Nobody left angry. I was sure."), WORD_BY_WORD, 10.0)

    assert read_texts(captions) == ["Nobody", "left", "angry", "I", "was", "sure"]


def test_the_plain_style_takes_six_words_to_a_caption() -> None:
    captions = group_captions(speak(SPOKEN), PLAIN, 10.0)

    assert read_texts(captions) == [
        "We raised every single price by",
        "twelve percent overnight",
        "Nobody left angry",
    ]


def test_the_end_of_a_sentence_closes_a_caption_early() -> None:
    spoken = speak("I said no. Then I said yes and they laughed. Good.")

    assert read_texts(group_captions(spoken, KEYWORD, 10.0)) == [
        "I said no",
        "Then I said",
        "yes and they",
        "laughed",
        "Good",
    ]
    assert read_texts(group_captions(spoken, PLAIN, 10.0)) == [
        "I said no",
        "Then I said yes and they",
        "laughed",
        "Good",
    ]


def test_the_quotation_marks_before_a_word_and_the_punctuation_after_it_are_left_out() -> None:
    spoken = speak("She said, “the oven’s broken!” Really? Yes: “it is…”")

    captions = group_captions(spoken, WORD_BY_WORD, 10.0)

    assert read_texts(captions) == [
        "She",
        "said",
        "the",
        "oven’s",
        "broken",
        "Really",
        "Yes",
        "it",
        "is",
    ]


def test_the_highlighted_word_is_the_longest_of_six_characters_or_more() -> None:
    captions = group_captions(speak("Customers forgive almost anything."), KEYWORD, 10.0)

    assert read_highlights(captions) == [["Customers"], ["anything"]]
    assert captions[0].words == (
        CaptionWord("Customers", is_highlighted=True),
        CaptionWord("forgive", is_highlighted=False),
        CaptionWord("almost", is_highlighted=False),
    )


def test_a_word_with_a_digit_counts_as_strong_however_short() -> None:
    captions = group_captions(speak("It took 12 days. We sold 300 rolls."), KEYWORD, 10.0)

    assert read_highlights(captions) == [["12"], [], ["300"], []]
    assert read_texts(captions) == ["It took 12", "days", "We sold 300", "rolls"]


def test_a_long_word_is_taken_over_a_shorter_one_with_a_digit() -> None:
    captions = group_captions(speak("Exactly 12 customers."), KEYWORD, 10.0)

    assert read_highlights(captions) == [["customers"]]


def test_of_two_words_as_long_the_earlier_is_taken() -> None:
    captions = group_captions(speak("Bakery winter custom."), KEYWORD, 10.0)

    assert read_highlights(captions) == [["Bakery"]]


def test_the_length_of_a_word_is_measured_as_it_is_shown() -> None:
    captions = group_captions(speak("“Truth,” silence wins."), KEYWORD, 10.0)

    assert read_texts(captions) == ["Truth silence wins"]
    assert read_highlights(captions) == [["silence"]]


def test_a_caption_of_short_words_highlights_none() -> None:
    captions = group_captions(speak("I said the oven broke."), KEYWORD, 10.0)

    assert read_highlights(captions) == [[], []]


def test_the_word_by_word_and_plain_styles_highlight_none() -> None:
    spoken = speak(SPOKEN)

    assert read_highlights(group_captions(spoken, WORD_BY_WORD, 10.0)) == [[]] * 12
    assert read_highlights(group_captions(spoken, PLAIN, 10.0)) == [[], [], []]


def test_a_caption_starts_with_its_first_word_counted_from_the_in_point() -> None:
    captions = group_captions(speak(SPOKEN, start=40.0), KEYWORD, 40.0)

    assert [caption.start_seconds for caption in captions] == [0.0, 1.5, 3.0, 4.5]


def test_the_times_move_with_the_nudge_of_the_in_point() -> None:
    spoken = speak(SPOKEN, start=40.0)

    earlier = group_captions(spoken, KEYWORD, 39.4)
    later = group_captions(spoken, KEYWORD, 40.4)

    assert [caption.start_seconds for caption in earlier] == [0.6, 2.1, 3.6, 5.1]
    assert [caption.start_seconds for caption in later] == [-0.4, 1.1, 2.6, 4.1]


def test_the_captions_of_the_first_part_of_the_talk_hold_its_words_in_their_order(
    talk_candidates: list[Candidate], talk_sentences: list[Sentence]
) -> None:
    first_part = talk_sentences[3:12]
    spoken = [word.text.strip().rstrip(".,") for sentence in first_part for word in sentence.words]
    largest = {KEYWORD: 3, WORD_BY_WORD: 1, PLAIN: 6}

    for style, most_words in largest.items():
        captions = group_captions(first_part, style, talk_candidates[0].start_seconds)
        shown = [word.text for caption in captions for word in caption.words]
        starts = [caption.start_seconds for caption in captions]

        assert shown == spoken
        assert max(len(caption.words) for caption in captions) == most_words
        assert (starts[0], starts) == (0.0, sorted(starts))


def test_the_talk_marks_one_word_in_a_keyword_caption_that_has_a_strong_one(
    talk_candidates: list[Candidate], talk_sentences: list[Sentence]
) -> None:
    captions = group_captions(talk_sentences[3:12], KEYWORD, talk_candidates[0].start_seconds)

    opening = captions[:4]

    assert read_texts(opening) == ["I want to", "tell you about", "the worst day", "my bakery ever"]
    assert read_highlights(opening) == [[], [], [], ["bakery"]]
    assert all(len(marked) <= 1 for marked in read_highlights(captions))
