import json
from pathlib import Path

from .transcript import Transcript, TranscriptWord
from .transcript_store import read_transcript, write_transcript

SPOKEN = Transcript(
    language="en",
    model="large-v3-turbo",
    words=[
        TranscriptWord(text=" Café", start=0.12, end=0.5),
        TranscriptWord(text=" open.", start=0.5, end=1.04),
    ],
)


def test_a_transcript_read_back_equals_what_was_written(tmp_path: Path) -> None:
    write_transcript(tmp_path, SPOKEN)

    assert read_transcript(tmp_path) == SPOKEN


def test_the_transcript_is_one_file_named_transcript_json(tmp_path: Path) -> None:
    write_transcript(tmp_path, SPOKEN)

    assert [left.name for left in tmp_path.iterdir()] == ["transcript.json"]


def test_the_file_holds_the_language_the_model_and_each_word_with_its_times(tmp_path: Path) -> None:
    write_transcript(tmp_path, SPOKEN)

    assert json.loads((tmp_path / "transcript.json").read_text(encoding="utf-8")) == {
        "language": "en",
        "model": "large-v3-turbo",
        "words": [
            {"text": " Café", "start": 0.12, "end": 0.5},
            {"text": " open.", "start": 0.5, "end": 1.04},
        ],
    }


def test_writing_again_replaces_the_transcript(tmp_path: Path) -> None:
    write_transcript(tmp_path, SPOKEN)
    shorter = SPOKEN.model_copy(update={"words": SPOKEN.words[:1], "model": "small"})

    write_transcript(tmp_path, shorter)

    assert read_transcript(tmp_path) == shorter
    assert [left.name for left in tmp_path.iterdir()] == ["transcript.json"]
