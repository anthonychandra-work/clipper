from collections.abc import Sequence
from dataclasses import dataclass

from ..selection import Candidate, Sentence

SENTENCES_BEYOND_THE_CUT = 3


@dataclass(frozen=True)
class TrimReach:
    cut_start: int
    cut_end: int
    first: int
    last: int

    def holds(self, sentence: int) -> bool:
        return self.first <= sentence <= self.last


def find_trim_reach(candidate: Candidate, sentences: Sequence[Sentence]) -> TrimReach:
    cut_start = min(sentences, key=lambda sentence: abs(sentence.start - candidate.start_seconds))
    cut_end = min(sentences, key=lambda sentence: abs(sentence.end - candidate.end_seconds))
    return TrimReach(
        cut_start=cut_start.number,
        cut_end=cut_end.number,
        first=max(sentences[0].number, cut_start.number - SENTENCES_BEYOND_THE_CUT),
        last=min(sentences[-1].number, cut_end.number + SENTENCES_BEYOND_THE_CUT),
    )


def list_reach(reach: TrimReach, sentences: Sequence[Sentence]) -> list[Sentence]:
    return [sentence for sentence in sentences if reach.holds(sentence.number)]
