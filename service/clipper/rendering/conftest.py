import shutil
from dataclasses import replace
from pathlib import Path

import pytest

from ..media import MediaTools
from ..projects import Project, ProjectRepository
from ..review import ClipPoint, ClipReview, Decision, ReviewSources
from ..review.conftest import CutTalk
from ..review.conftest import cut_talk as cut_talk
from ..review.conftest import cut_the_talk as cut_the_talk
from ..review.conftest import recorded_claude_address as recorded_claude_address
from ..review.conftest import sources as sources
from ..review.conftest import talk_candidates as talk_candidates
from ..review.conftest import talk_sentences as talk_sentences
from ..review.conftest import talk_transcript as talk_transcript
from ..storage import SOURCE_STEM, Database
from .describe_export import ExportSources
from .render_clip import RenderWork
from .render_store import RenderStore

OPENING_SENTENCES = 3
SENTENCES_OF_THE_PARTS = {"c01": (4, 12), "c02": (23, 30), "c03": (13, 22), "c05": (41, 47)}


def keep_part(clip_id: str) -> ClipReview:
    first_sentence, last_sentence = SENTENCES_OF_THE_PARTS[clip_id]
    return ClipReview(ClipPoint(first_sentence), ClipPoint(last_sentence), Decision.KEEP)


class ExportedTalk:
    def __init__(self, cut: CutTalk, sources: ExportSources, repository: ProjectRepository) -> None:
        self.project_id = cut.project.id
        self.sources = sources
        self._repository = repository

    def read_project(self) -> Project:
        return self._repository.get(self.project_id)

    def store(self, clip_id: str, review: ClipReview) -> None:
        self.sources.review.reviews.save_review(self.project_id, clip_id, review)

    def export_kept(self, rank: int, clip_id: str) -> None:
        self.store(clip_id, keep_part(clip_id))
        self.sources.renders.queue_clips(self.project_id, [clip_id])
        taken = self.sources.renders.take_oldest_waiting()
        assert taken is not None
        self.sources.renders.mark_done(taken)
        self.write_export(rank, clip_id)

    def write_export(self, rank: int, clip_id: str) -> None:
        export = self.sources.review.data_folder.export_file(self.project_id, rank, clip_id)
        export.parent.mkdir(exist_ok=True)
        export.write_bytes(b"a finished clip")


@pytest.fixture
def exported_talk(
    cut_talk: CutTalk, sources: ReviewSources, database: Database, repository: ProjectRepository
) -> ExportedTalk:
    return ExportedTalk(cut_talk, ExportSources(sources, RenderStore(database)), repository)


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
