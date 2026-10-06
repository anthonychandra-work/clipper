import shutil
from dataclasses import replace
from pathlib import Path

import pytest

from ..media import MediaTools
from ..review import ReviewSources
from ..review.conftest import CutTalk
from ..review.conftest import cut_talk as cut_talk
from ..review.conftest import cut_the_talk as cut_the_talk
from ..review.conftest import sources as sources
from ..review.conftest import talk_candidates as talk_candidates
from ..review.conftest import talk_sentences as talk_sentences
from ..review.conftest import talk_transcript as talk_transcript
from ..storage import SOURCE_STEM
from .render_clip import RenderWork

OPENING_SENTENCES = 3


@pytest.fixture(scope="session")
def portrait_video(fixtures_dir: Path) -> Path:
    return fixtures_dir / "portrait.mp4"


@pytest.fixture
def render_work(sources: ReviewSources, media_tools: MediaTools) -> RenderWork:
    return RenderWork(sources, media_tools)


def place_source(video: Path, cut: CutTalk, sources: ReviewSources) -> Path:
    project_dir = sources.data_folder.project_dir(cut.project.id)
    return Path(shutil.copyfile(video, project_dir / f"{SOURCE_STEM}.mp4"))


@pytest.fixture
def talk_with_source(cut_talk: CutTalk, sources: ReviewSources, talk_video: Path) -> CutTalk:
    place_source(talk_video, cut_talk, sources)
    return cut_talk


# The portrait video speaks the talk's first twelve seconds, which hold its three opening sentences.
@pytest.fixture
def portrait_clip(cut_talk: CutTalk, sources: ReviewSources, portrait_video: Path) -> CutTalk:
    opening = replace(
        cut_talk.candidates[0],
        start_seconds=cut_talk.sentences[0].start,
        end_seconds=cut_talk.sentences[OPENING_SENTENCES - 1].end,
    )
    sources.selection.replace_candidates(cut_talk.project.id, [opening], [])
    place_source(portrait_video, cut_talk, sources)
    return replace(cut_talk, candidates=[opening])
