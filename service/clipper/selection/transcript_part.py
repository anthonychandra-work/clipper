from collections.abc import Sequence

from .split_sentences import Sentence


def write_transcript_part(sentences: Sequence[Sentence]) -> str:
    return "\n".join(write_line(sentence) for sentence in sentences)


def write_line(sentence: Sentence) -> str:
    text_on_one_line = " ".join(sentence.text.split())
    return f"{sentence.number} [{sentence.start:.2f}] {text_on_one_line}"
