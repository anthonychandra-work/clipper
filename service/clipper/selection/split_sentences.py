import re
from collections.abc import Sequence
from dataclasses import dataclass

from ..transcription import TranscriptWord

SENTENCE_END = re.compile(r"[.?!…。？！]+[\"'”’»)\]]*$")
LONGEST_SENTENCE_SECONDS = 30.0


@dataclass(frozen=True)
class Sentence:
    number: int
    words: tuple[TranscriptWord, ...]

    @property
    def start(self) -> float:
        return self.words[0].start

    @property
    def end(self) -> float:
        return self.words[-1].end

    @property
    def text(self) -> str:
        return "".join(word.text for word in self.words).strip()


def split_sentences(words: Sequence[TranscriptWord]) -> list[Sentence]:
    parts = [part for spoken in split_at_end_marks(words) for part in split_at_pauses(spoken)]
    return [Sentence(number, tuple(part)) for number, part in enumerate(parts, start=1)]


def split_at_end_marks(words: Sequence[TranscriptWord]) -> list[list[TranscriptWord]]:
    sentences: list[list[TranscriptWord]] = [[]]
    for word in words:
        sentences[-1].append(word)
        if SENTENCE_END.search(word.text.strip()):
            sentences.append([])
    return [sentence for sentence in sentences if sentence]


def split_at_pauses(words: list[TranscriptWord]) -> list[list[TranscriptWord]]:
    waiting = [words]
    short_enough: list[list[TranscriptWord]] = []
    while waiting:
        part = waiting.pop()
        if len(part) > 1 and part[-1].end - part[0].start > LONGEST_SENTENCE_SECONDS:
            after_pause = find_longest_pause(part)
            waiting += [part[after_pause:], part[:after_pause]]
        else:
            short_enough.append(part)
    return short_enough


def find_longest_pause(words: list[TranscriptWord]) -> int:
    middle = (words[0].start + words[-1].end) / 2

    def weigh(after_pause: int) -> tuple[float, float]:
        pause = words[after_pause].start - words[after_pause - 1].end
        return pause, -abs(words[after_pause].start - middle)

    return max(range(1, len(words)), key=weigh)
