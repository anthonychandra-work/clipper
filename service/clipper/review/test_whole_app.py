from dataclasses import dataclass
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from ..main import create_app
from ..projects import ProjectStatus
from ..selection.conftest import TEST_KEY, RecordedClaude
from ..selection.test_whole_app import (
    describe_settings,
    place_the_test_model,
    upload_with_the_brief,
    wait_for_status,
)
from ..storage import open_data_folder
from .test_describe_review import CLIP_FIELDS

JPEG_START = b"\xff\xd8\xff"

type Json = dict[str, object]


@dataclass(frozen=True)
class FrameAnswer:
    address: str
    status: int
    media_type: str
    start: bytes


@dataclass(frozen=True)
class ReviewedRun:
    project_id: str
    review: Json
    frames: list[FrameAnswer]
    ranged_preview: tuple[int, str]
    kept_clip: Json
    project_after_keep: Json


def read_clips(review: Json) -> list[Json]:
    clips = review["clips"]
    assert isinstance(clips, list)
    return clips


def ask_for_frames(client: TestClient, review: Json) -> list[FrameAnswer]:
    answers: list[FrameAnswer] = []
    for clip in read_clips(review):
        frames = clip["frames"]
        assert isinstance(frames, list)
        for address in frames:
            answer = client.get(str(address))
            media_type = answer.headers.get("content-type", "")
            answers.append(
                FrameAnswer(str(address), answer.status_code, media_type, answer.content[:3])
            )
    return answers


@pytest.fixture(scope="module")
def reviewed_run(
    tmp_path_factory: pytest.TempPathFactory, talk_video: Path, recorded_claude_address: str
) -> ReviewedRun:
    run_dir = tmp_path_factory.mktemp("whole-review")
    data_folder = open_data_folder(run_dir / "data")
    place_the_test_model(data_folder)
    stand_in = RecordedClaude(recorded_claude_address)
    settings = describe_settings(
        data_folder, run_dir / "keys" / "anthropic-api-key", stand_in.at("talk")
    )
    with TestClient(create_app(settings)) as client:
        client.put("/api/settings/api-key", json={"apiKey": TEST_KEY})
        project_id = upload_with_the_brief(client, talk_video)
        wait_for_status(client, project_id, ProjectStatus.READY)
        address = f"/api/projects/{project_id}"
        review: Json = client.get(f"{address}/review").json()
        frames = ask_for_frames(client, review)
        ranged = client.get(f"{address}/preview", headers={"Range": "bytes=0-99"})
        kept: Json = client.patch(f"{address}/clips/c01", json={"decision": "keep"}).json()
        project: Json = client.get(address).json()
    ranged_preview = (ranged.status_code, ranged.headers["content-type"])
    return ReviewedRun(project_id, review, frames, ranged_preview, kept, project)


def test_the_review_of_the_uploaded_talk_has_six_clips_with_every_field(
    reviewed_run: ReviewedRun,
) -> None:
    clips = read_clips(reviewed_run.review)

    assert [clip["id"] for clip in clips] == ["c01", "c02", "c03", "c04", "c05", "c06"]
    assert [set(clip) for clip in clips] == [CLIP_FIELDS] * 6
    assert [(clip["startSentence"], clip["endSentence"]) for clip in clips] == [
        (4, 12),
        (23, 30),
        (13, 22),
        (31, 40),
        (41, 47),
        (48, 51),
    ]
    assert reviewed_run.review["hasPreview"] is True
    assert reviewed_run.review["clipSeconds"] == {
        "min": 25,
        "max": 60,
        "preferred": {"min": 25, "max": 50},
    }


def test_each_clip_of_the_uploaded_talk_has_twelve_frame_addresses_and_each_answers_a_jpeg(
    reviewed_run: ReviewedRun,
) -> None:
    project_id = reviewed_run.project_id
    expected = [
        f"/api/projects/{project_id}/clips/c{clip:02d}/frames/{frame}"
        for clip in range(1, 7)
        for frame in range(1, 13)
    ]

    assert [frame.address for frame in reviewed_run.frames] == expected
    assert {frame.status for frame in reviewed_run.frames} == {200}
    assert {frame.media_type for frame in reviewed_run.frames} == {"image/jpeg"}
    assert {frame.start for frame in reviewed_run.frames} == {JPEG_START}


def test_the_preview_copy_of_the_uploaded_talk_answers_a_byte_range(
    reviewed_run: ReviewedRun,
) -> None:
    assert reviewed_run.ranged_preview == (206, "video/mp4")


def test_a_clip_kept_through_the_app_is_counted_by_the_project(reviewed_run: ReviewedRun) -> None:
    project = reviewed_run.project_after_keep

    assert (reviewed_run.kept_clip["id"], reviewed_run.kept_clip["decision"]) == ("c01", "keep")
    assert (project["candidateCount"], project["keptCount"], project["rejectedCount"]) == (6, 1, 0)
