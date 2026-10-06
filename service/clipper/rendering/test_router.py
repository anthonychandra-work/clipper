import time
from pathlib import Path
from urllib.parse import unquote

import httpx2
import pytest
from fastapi.testclient import TestClient

from ..main import create_app
from ..review import ClipPoint, ClipReview, Decision, ReviewSources
from ..review.conftest import CutTalk
from ..settings import StartupSettings
from ..storage import Database
from .find_download import name_download
from .render_store import RenderStore

SOURCE_DELETED = "The source video was deleted to free space. New clips cannot be rendered."
REFUSED = "Clipper could not make this change. Reload the page and try again."
NO_EXPORT = "This clip has no export on this Mac."
NO_PROJECT = "This project does not exist."
SOURCE_GONE = "The source video is no longer on this Mac, so this clip cannot be rendered."
NOT_RENDERED = {"state": "none", "percent": 0.0, "reason": None}
WAITING = {"state": "waiting", "percent": 0.0, "reason": None}
RENDERING = {"state": "rendering", "percent": 0.0, "reason": None}
CLIP_BYTES = b"a finished clip " * 64
WAIT_SECONDS = 10

type Json = dict[str, object]


@pytest.fixture
def client(tmp_path: Path, cut_talk: CutTalk) -> TestClient:
    return TestClient(create_app(StartupSettings(data_dir=tmp_path / "data")))


@pytest.fixture
def renders(database: Database) -> RenderStore:
    return RenderStore(database)


def keep(cut: CutTalk, sources: ReviewSources, clip_id: str, title: str | None = None) -> None:
    sentences = {"c01": (4, 12), "c02": (23, 30)}[clip_id]
    kept = ClipReview(ClipPoint(sentences[0]), ClipPoint(sentences[1]), Decision.KEEP, title=title)
    sources.reviews.save_review(cut.project.id, clip_id, kept)


def finish_first_clip(cut: CutTalk, sources: ReviewSources, renders: RenderStore) -> None:
    renders.queue_clips(cut.project.id, ["c01"])
    taken = renders.take_oldest_waiting()
    assert taken is not None
    renders.mark_done(taken)
    export = sources.data_folder.export_file(cut.project.id, 1, "c01")
    export.parent.mkdir(exist_ok=True)
    export.write_bytes(CLIP_BYTES)


def read_states(export: Json) -> dict[str, object]:
    clips = export["clips"]
    assert isinstance(clips, list)
    return {clip["id"]: clip["render"] for clip in clips}


def read_problem(response: httpx2.Response) -> tuple[int, object]:
    return response.status_code, response.json()["problem"]["message"]


def read_download_name(response: httpx2.Response) -> str:
    kind, _, name = response.headers["content-disposition"].partition("; ")
    assert kind == "attachment"
    if name.startswith("filename*=utf-8''"):
        return unquote(name.removeprefix("filename*=utf-8''"))
    return name.removeprefix('filename="').removesuffix('"')


def test_the_export_of_a_project_is_read_at_its_address(
    client: TestClient, talk_with_source: CutTalk, sources: ReviewSources
) -> None:
    keep(talk_with_source, sources, "c02")

    response = client.get(f"/api/projects/{talk_with_source.project.id}/export")

    export = response.json()
    assert response.status_code == 200
    assert (export["hasSource"], export["platforms"]) == (True, ["reels"])
    assert read_states(export) == {"c02": NOT_RENDERED}


def test_rendering_queues_the_kept_clips_and_answers_with_the_export(
    client: TestClient, talk_with_source: CutTalk, sources: ReviewSources
) -> None:
    keep(talk_with_source, sources, "c02")
    keep(talk_with_source, sources, "c01")

    response = client.post(f"/api/projects/{talk_with_source.project.id}/renders")

    assert response.status_code == 200
    assert read_states(response.json()) == {"c01": WAITING, "c02": WAITING}


def test_one_clip_is_queued_at_its_own_address(
    client: TestClient, talk_with_source: CutTalk, sources: ReviewSources
) -> None:
    keep(talk_with_source, sources, "c01")
    keep(talk_with_source, sources, "c02")

    response = client.post(f"/api/projects/{talk_with_source.project.id}/clips/c02/render")

    assert response.status_code == 200
    assert read_states(response.json()) == {"c01": NOT_RENDERED, "c02": WAITING}


def test_a_cancel_takes_the_waiting_clips_out_and_answers_with_the_export(
    client: TestClient, talk_with_source: CutTalk, sources: ReviewSources
) -> None:
    address = f"/api/projects/{talk_with_source.project.id}/renders"
    keep(talk_with_source, sources, "c01")
    client.post(address)

    response = client.delete(address)

    assert response.status_code == 200
    assert read_states(response.json()) == {"c01": NOT_RENDERED}


def test_queueing_with_the_source_gone_is_refused_with_409(
    client: TestClient, cut_talk: CutTalk, sources: ReviewSources, renders: RenderStore
) -> None:
    address = f"/api/projects/{cut_talk.project.id}"
    keep(cut_talk, sources, "c01")

    refused_all = client.post(f"{address}/renders")
    refused_one = client.post(f"{address}/clips/c01/render")

    assert read_problem(refused_all) == (409, SOURCE_DELETED)
    assert read_problem(refused_one) == (409, SOURCE_DELETED)
    assert renders.list_renders(cut_talk.project.id) == {}


@pytest.mark.parametrize("clip_id", ["c02", "c99"])
def test_queueing_a_clip_that_is_not_kept_is_refused_in_one_sentence(
    clip_id: str, client: TestClient, talk_with_source: CutTalk, sources: ReviewSources
) -> None:
    keep(talk_with_source, sources, "c01")

    refused = client.post(f"/api/projects/{talk_with_source.project.id}/clips/{clip_id}/render")

    assert read_problem(refused) == (422, REFUSED)


@pytest.mark.parametrize(
    ("verb", "address"),
    [
        ("GET", "/export"),
        ("POST", "/renders"),
        ("DELETE", "/renders"),
        ("POST", "/clips/c01/render"),
        ("GET", "/clips/c01/export"),
    ],
)
def test_every_address_of_an_unknown_project_answers_404(
    verb: str, address: str, client: TestClient
) -> None:
    assert read_problem(client.request(verb, f"/api/projects/missing{address}")) == (
        404,
        NO_PROJECT,
    )


def test_a_finished_clip_is_answered_as_an_mp4_attachment_under_its_rank_and_title(
    client: TestClient, talk_with_source: CutTalk, sources: ReviewSources, renders: RenderStore
) -> None:
    keep(talk_with_source, sources, "c01")
    finish_first_clip(talk_with_source, sources, renders)
    project_id = talk_with_source.project.id

    export = client.get(f"/api/projects/{project_id}/export").json()
    response = client.get(export["clips"][0]["download"])

    assert export["clips"][0]["download"] == f"/api/projects/{project_id}/clips/c01/export"
    assert (response.status_code, response.headers["content-type"]) == (200, "video/mp4")
    assert read_download_name(response) == "01 The worst day my bakery ever had.mp4"
    assert response.content == CLIP_BYTES


@pytest.mark.parametrize(
    ("title", "name"),
    [
        ("Mine / theirs: part 1?", "01 Mine theirs part 1.mp4"),
        ("パン屋の最悪の日", "01 パン屋の最悪の日.mp4"),
        ("Prices… and “quotes”.", "01 Prices… and “quotes”.mp4"),
    ],
)
def test_the_name_of_the_attachment_leaves_out_what_a_file_name_cannot_hold(
    title: str,
    name: str,
    client: TestClient,
    talk_with_source: CutTalk,
    sources: ReviewSources,
    renders: RenderStore,
) -> None:
    keep(talk_with_source, sources, "c01", title=title)
    finish_first_clip(talk_with_source, sources, renders)

    response = client.get(f"/api/projects/{talk_with_source.project.id}/clips/c01/export")

    assert response.status_code == 200
    assert read_download_name(response) == name


@pytest.mark.parametrize(
    ("rank", "title", "name"),
    [
        (3, "  Spaced   out  ", "03 Spaced out.mp4"),
        (12, '<>:"/\\|?*', "12.mp4"),
        (1, "a\tb", "01 ab.mp4"),
    ],
)
def test_a_download_is_named_by_its_rank_and_what_is_left_of_its_title(
    rank: int, title: str, name: str
) -> None:
    assert name_download(rank, title) == name


@pytest.mark.parametrize("clip_id", ["c01", "c02", "c99"])
def test_a_clip_without_a_finished_file_answers_404(
    clip_id: str,
    client: TestClient,
    talk_with_source: CutTalk,
    sources: ReviewSources,
    renders: RenderStore,
) -> None:
    keep(talk_with_source, sources, "c01")
    keep(talk_with_source, sources, "c02")
    renders.queue_clips(talk_with_source.project.id, ["c01"])

    response = client.get(f"/api/projects/{talk_with_source.project.id}/clips/{clip_id}/export")

    assert read_problem(response) == (404, NO_EXPORT)


def test_a_finished_clip_that_is_no_longer_kept_still_downloads(
    client: TestClient, talk_with_source: CutTalk, sources: ReviewSources, renders: RenderStore
) -> None:
    keep(talk_with_source, sources, "c01")
    finish_first_clip(talk_with_source, sources, renders)
    undecided = ClipReview(ClipPoint(4), ClipPoint(12), Decision.UNDECIDED)
    sources.reviews.save_review(talk_with_source.project.id, "c01", undecided)

    response = client.get(f"/api/projects/{talk_with_source.project.id}/clips/c01/export")

    assert (response.status_code, response.content) == (200, CLIP_BYTES)


def test_a_render_a_killed_tool_left_rendering_is_taken_up_again_when_the_app_starts(
    client: TestClient, cut_talk: CutTalk, sources: ReviewSources, renders: RenderStore
) -> None:
    address = f"/api/projects/{cut_talk.project.id}/export"
    keep(cut_talk, sources, "c01")
    renders.queue_clips(cut_talk.project.id, ["c01"])
    renders.take_oldest_waiting()
    deadline = time.monotonic() + WAIT_SECONDS

    with client as started:
        while read_states(started.get(address).json())["c01"] == RENDERING:
            assert time.monotonic() < deadline, "The interrupted render was not taken up."
            time.sleep(0.02)
        taken_up = read_states(started.get(address).json())["c01"]

    assert taken_up == {"state": "failed", "percent": 0.0, "reason": SOURCE_GONE}
