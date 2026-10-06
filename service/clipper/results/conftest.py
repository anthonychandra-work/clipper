import pytest

from ..rendering.conftest import ExportedTalk
from ..rendering.conftest import exported_talk as exported_talk
from ..review.conftest import cut_talk as cut_talk
from ..review.conftest import cut_the_talk as cut_the_talk
from ..review.conftest import recorded_claude_address as recorded_claude_address
from ..review.conftest import sources as sources
from ..review.conftest import talk_candidates as talk_candidates
from ..review.conftest import talk_sentences as talk_sentences
from ..review.conftest import talk_transcript as talk_transcript
from ..storage import Database
from .describe_results import ResultsSources
from .results_store import ResultsStore

THREE_EXPORTED = ((1, "c01"), (2, "c02"), (3, "c03"))


@pytest.fixture
def three_exported(exported_talk: ExportedTalk) -> ExportedTalk:
    for rank, clip_id in THREE_EXPORTED:
        exported_talk.export_kept(rank, clip_id)
    return exported_talk


@pytest.fixture
def results_sources(exported_talk: ExportedTalk, database: Database) -> ResultsSources:
    return ResultsSources(exported_talk.sources, ResultsStore(database))
