from collections.abc import Callable
from dataclasses import dataclass

import pytest

from ..conftest import SCRIPTS_DIR
from ..projects import (
    STEP_ORDER,
    ClipLength,
    CreateProjectRequest,
    Platform,
    Project,
    ProjectQueue,
    ProjectRepository,
    ProjectStatus,
    SourceKind,
    create_project,
)
from ..selection import (
    Candidate,
    ClipFlag,
    HookType,
    PlatformText,
    PlatformTexts,
    SelectionStore,
    Sentence,
    Subscores,
    Window,
    WindowRecord,
    split_sentences,
)
from ..selection.conftest import recorded_claude_address as recorded_claude_address
from ..storage import BYTES_PER_GB, Database, DataFolder, DiskSpace
from ..transcription import Transcript, write_transcript
from .describe_review import ReviewSources
from .review_store import ReviewStore

TALK_TRANSCRIPT_FILE = SCRIPTS_DIR.parent / "fixtures" / "talk-transcript.json"
TALK_SECONDS = 234.94
PLENTY = DiskSpace(free_bytes=50 * BYTES_PER_GB, total_bytes=460 * BYTES_PER_GB)
NEEDS_CONTEXT_NOTE = (
    "Opens on “also” and never says what the business is, so a viewer who starts here lacks "
    "the setting."
)
NOT_RECOMMENDED_NOTE = (
    "Common advice with no story behind it, and its one long sentence runs seventeen seconds."
)
TEXTS = PlatformTexts(
    tiktok=PlatformText("The oven broke", "What a bad morning taught a baker. #bakery"),
    reels=PlatformText("Nobody left angry", "Customers forgive bad news. #smallbusiness"),
    shorts=PlatformText("The worst day my bakery had", "Tell them the truth."),
)
TALK_WINDOWS = (
    WindowRecord(Window("w01", 1, 23, 0.0, 89.92), score=72, is_shortlisted=True),
    WindowRecord(Window("w02", 17, 38, 63.84, 151.02), score=81, is_shortlisted=True),
    WindowRecord(Window("w03", 32, 49, 125.3, 199.66), score=64, is_shortlisted=True),
    WindowRecord(Window("w04", 44, 54, 174.24, 234.56), score=23, is_shortlisted=False),
)


@dataclass(frozen=True)
class TalkPart:
    first_sentence: int
    last_sentence: int
    scores: Subscores
    title: str
    hook_title: str
    hook_type: HookType
    flag: ClipFlag | None = None
    flag_note: str | None = None


SIX_PARTS_BEST_FIRST = (
    TalkPart(
        4,
        12,
        Subscores(hook=23, arc=23, value=20, share=22),
        "The worst day my bakery ever had",
        "The oven broke before sunrise",
        HookType.STORY,
    ),
    TalkPart(
        23,
        30,
        Subscores(hook=22, arc=21, value=21, share=20),
        "Hire for the habits you cannot teach",
        "My best baker had never baked",
        HookType.CONTRARIAN,
    ),
    TalkPart(
        13,
        22,
        Subscores(hook=21, arc=20, value=22, share=19),
        "Almost everyone gets price wrong",
        "Stop pricing by the shop across the street",
        HookType.HOT_TAKE,
    ),
    TalkPart(
        31,
        40,
        Subscores(hook=20, arc=22, value=21, share=19),
        "The hotel order that almost ended the business",
        "I let one customer become my boss",
        HookType.CONFESSION,
        ClipFlag.NEEDS_CONTEXT,
        NEEDS_CONTEXT_NOTE,
    ),
    TalkPart(
        41,
        47,
        Subscores(hook=19, arc=18, value=20, share=18),
        "How to know when it is time to grow",
        "Growth should feel boring",
        HookType.HOT_TAKE,
    ),
    TalkPart(
        48,
        51,
        Subscores(hook=12, arc=14, value=17, share=12),
        "The smallest lesson is to write things down",
        "Write things down",
        HookType.NONE,
        ClipFlag.NOT_RECOMMENDED,
        NOT_RECOMMENDED_NOTE,
    ),
)


@dataclass(frozen=True)
class CutTalk:
    project: Project
    candidates: list[Candidate]
    sentences: list[Sentence]


type CutTheTalk = Callable[..., CutTalk]


@pytest.fixture(scope="session")
def talk_transcript() -> Transcript:
    return Transcript.model_validate_json(TALK_TRANSCRIPT_FILE.read_text(encoding="utf-8"))


@pytest.fixture(scope="session")
def talk_sentences(talk_transcript: Transcript) -> list[Sentence]:
    return split_sentences(talk_transcript.words)


def place_part(rank: int, part: TalkPart, sentences: list[Sentence]) -> Candidate:
    return Candidate(
        id=f"c{rank:02d}",
        rank=rank,
        start_seconds=sentences[part.first_sentence - 1].start,
        end_seconds=sentences[part.last_sentence - 1].end,
        scores=part.scores,
        reason=f"Picked as part {rank} of the talk.",
        title=part.title,
        hook_title=part.hook_title,
        hook_type=part.hook_type,
        platforms=TEXTS,
        flag=part.flag,
        flag_note=part.flag_note,
        is_replay_peak=False,
    )


@pytest.fixture
def talk_candidates(talk_sentences: list[Sentence]) -> list[Candidate]:
    ranked = enumerate(SIX_PARTS_BEST_FIRST, start=1)
    return [place_part(rank, part, talk_sentences) for rank, part in ranked]


@pytest.fixture
def cut_the_talk(
    repository: ProjectRepository,
    queue: ProjectQueue,
    database: Database,
    data_folder: DataFolder,
    talk_transcript: Transcript,
    talk_sentences: list[Sentence],
    talk_candidates: list[Candidate],
) -> CutTheTalk:
    def cut(clip_length: ClipLength = ClipLength.STANDARD) -> CutTalk:
        draft = CreateProjectRequest(
            source_kind=SourceKind.LINK,
            link="https://video.example/talk",
            clip_length=clip_length,
            platforms=[Platform.REELS],
        )
        project = create_project(draft, repository, PLENTY)
        project_dir = data_folder.project_dir(project.id)
        project_dir.mkdir()
        write_transcript(project_dir, talk_transcript)
        repository.record_duration(project.id, TALK_SECONDS)
        store = SelectionStore(database)
        store.replace_windows(project.id, TALK_WINDOWS)
        store.replace_candidates(project.id, talk_candidates, [])
        queue.take_oldest_queued()
        for step in STEP_ORDER:
            queue.finish_step(project.id, step)
        queue.rest(project.id, ProjectStatus.READY)
        return CutTalk(repository.get(project.id), talk_candidates, talk_sentences)

    return cut


@pytest.fixture
def cut_talk(cut_the_talk: CutTheTalk) -> CutTalk:
    return cut_the_talk()


@pytest.fixture
def sources(data_folder: DataFolder, database: Database) -> ReviewSources:
    return ReviewSources(data_folder, SelectionStore(database), ReviewStore(database))
