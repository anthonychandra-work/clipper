import math
from collections.abc import Sequence

from pydantic import BaseModel

from .run_transcriber import HeardSound, HeardWord

HUNDREDTHS = 100


class TranscriptWord(BaseModel):
    text: str
    start: float
    end: float


class Transcript(BaseModel):
    language: str
    model: str
    words: list[TranscriptWord]


class NoSpeechError(Exception):
    def __init__(self) -> None:
        super().__init__("The transcriber returned no word.")


def build_transcript(heard: HeardSound, model_name: str, duration_seconds: float) -> Transcript:
    if heard.language is None or not heard.words:
        raise NoSpeechError()
    words = put_in_order(heard.words, duration_seconds)
    return Transcript(language=heard.language, model=model_name, words=words)


def put_in_order(heard: Sequence[HeardWord], duration_seconds: float) -> list[TranscriptWord]:
    latest = math.floor(duration_seconds * HUNDREDTHS) / HUNDREDTHS
    words: list[TranscriptWord] = []
    earliest = 0.0
    for word in heard:
        start = min(max(round_to_hundredths(word.start), earliest), latest)
        end = min(max(round_to_hundredths(word.end), start), latest)
        words.append(TranscriptWord(text=word.text, start=start, end=end))
        earliest = end
    return words


def round_to_hundredths(seconds: float) -> float:
    return round(seconds * HUNDREDTHS) / HUNDREDTHS
