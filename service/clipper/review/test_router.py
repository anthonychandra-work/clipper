from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from ..main import create_app
from ..settings import StartupSettings
from ..storage import DataFolder
from .clip_points import REFUSED_CHANGE
from .conftest import CutTalk
from .test_describe_review import CLIP_FIELDS, STARTING_LOOK_JSON

LINK_DRAFT = {
    "sourceKind": "link",
    "link": "https://video.example/talk",
    "platforms": ["reels"],
}
PREVIEW_BYTES = bytes(range(256)) * 40
JPEG_BYTES = b"\xff\xd8\xff\xe0 a frame"
NO_PREVIEW = "This project has no preview copy on this Mac."
PLAIN_LOOK_JSON: dict[str, object] = {
    "captionStyle": "plain",
    "framing": "whole-frame",
    "showHookTitle": False,
    "showSafeZones": True,
}

type Json = dict[str, object]


@pytest.fixture
def client(tmp_path: Path) -> TestClient:
    return TestClient(create_app(StartupSettings(data_dir=tmp_path / "data")))


def add_project(client: TestClient) -> str:
    project_id: str = client.post("/api/projects", json=LINK_DRAFT).json()["id"]
    return project_id


def add_project_with_preview(client: TestClient, tmp_path: Path) -> str:
    project_id = add_project(client)
    project_dir = tmp_path / "data" / "projects" / project_id
    project_dir.mkdir()
    (project_dir / "preview.mp4").write_bytes(PREVIEW_BYTES)
    return project_id


def test_the_preview_copy_is_answered_whole_as_an_mp4_video(
    client: TestClient, tmp_path: Path
) -> None:
    project_id = add_project_with_preview(client, tmp_path)

    response = client.get(f"/api/projects/{project_id}/preview")

    assert response.status_code == 200
    assert response.headers["content-type"] == "video/mp4"
    assert response.headers["accept-ranges"] == "bytes"
    assert response.content == PREVIEW_BYTES


def test_a_byte_range_is_answered_206_with_that_range_and_the_whole_size(
    client: TestClient, tmp_path: Path
) -> None:
    project_id = add_project_with_preview(client, tmp_path)

    response = client.get(f"/api/projects/{project_id}/preview", headers={"Range": "bytes=300-811"})

    assert response.status_code == 206
    assert response.headers["content-range"] == f"bytes 300-811/{len(PREVIEW_BYTES)}"
    assert response.headers["content-type"] == "video/mp4"
    assert response.content == PREVIEW_BYTES[300:812]


def test_a_range_left_open_runs_to_the_end_of_the_file(client: TestClient, tmp_path: Path) -> None:
    project_id = add_project_with_preview(client, tmp_path)
    size = len(PREVIEW_BYTES)

    response = client.get(f"/api/projects/{project_id}/preview", headers={"Range": "bytes=10000-"})

    assert response.status_code == 206
    assert response.headers["content-range"] == f"bytes 10000-{size - 1}/{size}"
    assert response.content == PREVIEW_BYTES[10000:]


def test_a_range_past_the_end_is_answered_416(client: TestClient, tmp_path: Path) -> None:
    project_id = add_project_with_preview(client, tmp_path)
    past_the_end = f"bytes={len(PREVIEW_BYTES) + 10}-{len(PREVIEW_BYTES) + 20}"

    response = client.get(f"/api/projects/{project_id}/preview", headers={"Range": past_the_end})

    assert response.status_code == 416
    assert response.headers["content-range"] == f"bytes */{len(PREVIEW_BYTES)}"


def test_an_unknown_project_answers_with_the_404_of_the_other_project_addresses(
    client: TestClient,
) -> None:
    response = client.get("/api/projects/missing/preview")

    assert response.status_code == 404
    assert response.json() == client.get("/api/projects/missing").json()
    assert response.json() == {
        "problem": {"section": None, "message": "This project does not exist."}
    }


def test_a_project_without_a_preview_copy_answers_404_and_says_so(client: TestClient) -> None:
    project_id = add_project(client)

    response = client.get(f"/api/projects/{project_id}/preview")

    assert response.status_code == 404
    assert response.json() == {"problem": {"section": None, "message": NO_PREVIEW}}


def read_review(client: TestClient, cut_talk: CutTalk) -> Json:
    response = client.get(f"/api/projects/{cut_talk.project.id}/review")
    assert response.status_code == 200
    review: Json = response.json()
    return review


def read_clips(client: TestClient, cut_talk: CutTalk) -> list[Json]:
    return [as_dict(clip) for clip in as_list(read_review(client, cut_talk)["clips"])]


def as_list(value: object) -> list[object]:
    assert isinstance(value, list)
    return value


def as_dict(value: object) -> Json:
    assert isinstance(value, dict)
    return value


def change_first_clip(client: TestClient, cut_talk: CutTalk, change: Json) -> tuple[int, Json]:
    answer = client.patch(f"/api/projects/{cut_talk.project.id}/clips/c01", json=change)
    return answer.status_code, as_dict(answer.json())


def test_the_review_of_the_cut_talk_gives_every_field_under_its_name(
    client: TestClient, cut_talk: CutTalk
) -> None:
    review = read_review(client, cut_talk)
    clips = read_clips(client, cut_talk)

    assert set(review) == {"look", "hasPreview", "clipSeconds", "windows", "clips"}
    assert review["look"] == STARTING_LOOK_JSON
    assert review["clipSeconds"] == {"min": 25, "max": 60, "preferred": {"min": 25, "max": 50}}
    assert (review["hasPreview"], len(clips)) == (False, 6)
    assert [set(clip) for clip in clips] == [CLIP_FIELDS] * 6
    assert [clip["id"] for clip in clips] == ["c01", "c02", "c03", "c04", "c05", "c06"]
    assert set(as_dict(clips[0]["captions"])) == {"keyword", "wordByWord", "plain"}
    assert as_list(clips[0]["sentences"])[3] == {
        "number": 4,
        "startSeconds": 11.94,
        "endSeconds": 16.12,
        "text": "I want to tell you about the worst day my bakery ever had.",
    }


def test_an_unknown_project_has_no_review(client: TestClient) -> None:
    response = client.get("/api/projects/missing/review")

    assert response.status_code == 404
    assert response.json() == client.get("/api/projects/missing").json()


def test_a_project_without_candidates_answers_with_no_clips(client: TestClient) -> None:
    project_id = add_project(client)

    response = client.get(f"/api/projects/{project_id}/review")

    assert response.status_code == 200
    assert response.json() == {
        "look": STARTING_LOOK_JSON,
        "hasPreview": False,
        "clipSeconds": {"min": 25, "max": 60, "preferred": {"min": 25, "max": 50}},
        "windows": [],
        "clips": [],
    }


def test_a_change_to_a_clip_answers_with_the_clip_as_the_review_then_gives_it(
    client: TestClient, cut_talk: CutTalk
) -> None:
    change: Json = {"decision": "reject", "rejectReason": "not-interesting", "title": " Too plain "}

    status, clip = change_first_clip(client, cut_talk, change)

    assert status == 200
    assert clip == read_clips(client, cut_talk)[0]
    assert set(clip) == CLIP_FIELDS
    assert (clip["decision"], clip["rejectReason"]) == ("reject", "not-interesting")
    assert clip["title"] == "Too plain"


def test_the_counts_of_the_project_follow_the_decisions_sent_to_its_clips(
    client: TestClient, cut_talk: CutTalk
) -> None:
    address = f"/api/projects/{cut_talk.project.id}"
    counts: list[tuple[int, int]] = []

    for clip_id, decision in [("c01", "keep"), ("c02", "reject"), ("c01", "undecided")]:
        client.patch(f"{address}/clips/{clip_id}", json={"decision": decision})
        project = client.get(address).json()
        counts.append((project["keptCount"], project["rejectedCount"]))

    assert counts == [(1, 0), (1, 1), (0, 1)]


def test_moved_points_are_sent_under_the_names_the_review_gives_them(
    client: TestClient, cut_talk: CutTalk
) -> None:
    moved: Json = {"startSentence": 3, "startNudge": 0, "endSentence": 12, "endNudge": 4}

    status, clip = change_first_clip(client, cut_talk, moved)

    assert status == 200
    assert {name: clip[name] for name in moved} == moved
    assert (clip["startSeconds"], clip["endSeconds"]) == (5.72, 45.5)
    assert (clip["cutStartSentence"], clip["cutEndSentence"]) == (4, 12)


@pytest.mark.parametrize(
    "change",
    [
        {"startSentence": 10, "endSentence": 9},
        {"endSentence": 16},
        {"startSentence": 1, "startNudge": -1},
        {"startNudge": 6},
        {"decision": "maybe"},
        {"decision": "reject", "rejectReason": "boring"},
        {"title": 5},
        {"startNudge": "2"},
        {"startSentence": 4.5},
        {"endNudge": True},
        {"views": 1200},
        ["keep"],
    ],
)
def test_a_change_that_is_not_allowed_is_refused_in_one_sentence_and_stores_nothing(
    change: object, client: TestClient, cut_talk: CutTalk
) -> None:
    before = read_clips(client, cut_talk)[0]

    answer = client.patch(f"/api/projects/{cut_talk.project.id}/clips/c01", json=change)

    assert answer.status_code == 422
    assert answer.json() == {"problem": {"section": None, "message": REFUSED_CHANGE}}
    assert read_clips(client, cut_talk)[0] == before
    assert client.get(f"/api/projects/{cut_talk.project.id}").json()["keptCount"] == 0


def test_a_refused_change_that_also_names_a_decision_stores_none_of_it(
    client: TestClient, cut_talk: CutTalk
) -> None:
    mixed: Json = {"decision": "keep", "title": "New", "endSentence": 30}

    status, problem = change_first_clip(client, cut_talk, mixed)

    stored = read_clips(client, cut_talk)[0]
    assert (status, problem) == (422, {"problem": {"section": None, "message": REFUSED_CHANGE}})
    assert (stored["decision"], stored["title"]) == (
        "undecided",
        "The worst day my bakery ever had",
    )


def test_an_unknown_clip_answers_404_and_says_so(client: TestClient, cut_talk: CutTalk) -> None:
    answer = client.patch(
        f"/api/projects/{cut_talk.project.id}/clips/c07", json={"decision": "keep"}
    )

    assert answer.status_code == 404
    assert answer.json() == {"problem": {"section": None, "message": "This clip does not exist."}}


def test_a_clip_of_an_unknown_project_answers_the_404_of_the_project(client: TestClient) -> None:
    answer = client.patch("/api/projects/missing/clips/c01", json={"decision": "keep"})

    assert answer.status_code == 404
    assert answer.json() == client.get("/api/projects/missing").json()


def test_storing_the_look_answers_with_it_and_the_next_request_reads_it(
    client: TestClient, cut_talk: CutTalk
) -> None:
    answer = client.put(f"/api/projects/{cut_talk.project.id}/look", json=PLAIN_LOOK_JSON)

    assert answer.status_code == 200
    assert answer.json() == PLAIN_LOOK_JSON
    assert read_review(client, cut_talk)["look"] == PLAIN_LOOK_JSON


@pytest.mark.parametrize(
    "look",
    [
        {**PLAIN_LOOK_JSON, "captionStyle": "karaoke"},
        {**PLAIN_LOOK_JSON, "framing": "wide"},
        {**PLAIN_LOOK_JSON, "showHookTitle": "yes"},
        {**PLAIN_LOOK_JSON, "showSafeZones": 1},
        {**PLAIN_LOOK_JSON, "music": "on"},
        {"captionStyle": "plain"},
    ],
)
def test_a_look_with_an_unknown_value_is_refused_the_same_way_and_is_not_stored(
    look: Json, client: TestClient, cut_talk: CutTalk
) -> None:
    answer = client.put(f"/api/projects/{cut_talk.project.id}/look", json=look)

    assert answer.status_code == 422
    assert answer.json() == {"problem": {"section": None, "message": REFUSED_CHANGE}}
    assert read_review(client, cut_talk)["look"] == STARTING_LOOK_JSON


def test_the_look_of_an_unknown_project_answers_404(client: TestClient) -> None:
    answer = client.put("/api/projects/missing/look", json=PLAIN_LOOK_JSON)

    assert answer.status_code == 404


def test_the_address_of_a_frame_answers_the_jpeg_that_is_on_disk(
    client: TestClient, cut_talk: CutTalk, data_folder: DataFolder
) -> None:
    project_id = cut_talk.project.id
    data_folder.frames_dir(project_id).mkdir()
    data_folder.frame_file(project_id, "c02", 7).write_bytes(JPEG_BYTES)

    address = as_list(read_clips(client, cut_talk)[1]["frames"])[6]
    answer = client.get(str(address))

    assert address == f"/api/projects/{project_id}/clips/c02/frames/7"
    assert answer.status_code == 200
    assert answer.headers["content-type"] == "image/jpeg"
    assert answer.content == JPEG_BYTES


@pytest.mark.parametrize("frame", ["c02/frames/8", "c02/frames/13", "c09/frames/1", "c02/frames/0"])
def test_a_frame_that_is_not_on_disk_answers_404(
    frame: str, client: TestClient, cut_talk: CutTalk, data_folder: DataFolder
) -> None:
    data_folder.frames_dir(cut_talk.project.id).mkdir()
    data_folder.frame_file(cut_talk.project.id, "c02", 7).write_bytes(JPEG_BYTES)

    answer = client.get(f"/api/projects/{cut_talk.project.id}/clips/{frame}")

    assert answer.status_code == 404
    assert answer.json() == {
        "problem": {"section": None, "message": "This clip has no such frame on this Mac."}
    }


def test_a_review_with_the_preview_copy_removed_says_so_and_still_gives_its_clips(
    client: TestClient, cut_talk: CutTalk, data_folder: DataFolder
) -> None:
    preview = data_folder.preview_file(cut_talk.project.id)
    preview.write_bytes(PREVIEW_BYTES)
    with_preview = read_review(client, cut_talk)["hasPreview"]

    preview.unlink()

    assert with_preview is True
    assert read_review(client, cut_talk)["hasPreview"] is False
    assert len(read_clips(client, cut_talk)) == 6
    assert change_first_clip(client, cut_talk, {"decision": "keep"})[1]["decision"] == "keep"
