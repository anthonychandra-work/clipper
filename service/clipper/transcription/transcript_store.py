from pathlib import Path

from .transcript import Transcript

TRANSCRIPT_NAME = "transcript.json"
PARTIAL_NAME = "transcript.partial.json"
ENCODING = "utf-8"


def write_transcript(project_dir: Path, transcript: Transcript) -> None:
    partial = project_dir / PARTIAL_NAME
    try:
        partial.write_text(transcript.model_dump_json(), encoding=ENCODING)
        partial.replace(project_dir / TRANSCRIPT_NAME)
    finally:
        partial.unlink(missing_ok=True)


def read_transcript(project_dir: Path) -> Transcript:
    stored = (project_dir / TRANSCRIPT_NAME).read_text(encoding=ENCODING)
    return Transcript.model_validate_json(stored)
