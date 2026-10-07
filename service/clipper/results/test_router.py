from pathlib import Path

import httpx2
import pytest
from fastapi.testclient import TestClient

from ..learning import HistoryStore
from ..main import create_app
from ..rendering.conftest import ExportedTalk
from ..settings import StartupSettings
from ..storage import Database

REFUSED = "Clipper could not make this change. Reload the page and try again."
NO_PROJECT = "This project does not exist."
MOST_VIEWS = 9_999_999_999
THREE_WITHOUT_VIEWS = [
    {"id": "c01", "rank": 1, "title": "The worst day my bakery ever had", "views": None},
    {"id": "c02", "rank": 2, "title": "Hire for the habits you cannot teach", "views": None},
    {"id": "c03", "rank": 3, "title": "Almost everyone gets price wrong", "views": None},
]


@pytest.fixture
def client(tmp_path: Path, three_exported: ExportedTalk) -> TestClient:
    return TestClient(create_app(StartupSettings(data_dir=tmp_path / "data")))


@pytest.fixture
def address(three_exported: ExportedTalk) -> str:
    return f"/api/projects/{three_exported.project_id}"


def read_problem(response: httpx2.Response) -> tuple[int, object]:
    return response.status_code, response.json()["problem"]


def test_the_results_of_a_project_are_read_at_their_address(
    client: TestClient, address: str
) -> None:
    results = client.get(f"{address}/results")

    assert results.status_code == 200
    assert results.json() == {"clips": THREE_WITHOUT_VIEWS}


def test_stored_views_are_answered_with_the_results_and_read_back(
    client: TestClient, address: str
) -> None:
    stored = client.put(f"{address}/clips/c02/views", json={"views": 5400})

    assert stored.status_code == 200
    assert [clip["views"] for clip in stored.json()["clips"]] == [None, 5400, None]
    assert client.get(f"{address}/results").json() == stored.json()
    assert client.get(address).json()["loggedCount"] == 1


@pytest.mark.parametrize("views", [1, MOST_VIEWS])
def test_views_at_both_ends_of_the_range_are_stored(
    client: TestClient, address: str, views: int
) -> None:
    stored = client.put(f"{address}/clips/c01/views", json={"views": views})

    assert (stored.status_code, stored.json()["clips"][0]["views"]) == (200, views)


def test_views_sent_as_none_clear_the_stored_views(client: TestClient, address: str) -> None:
    client.put(f"{address}/clips/c01/views", json={"views": 1200})

    cleared = client.put(f"{address}/clips/c01/views", json={"views": None})

    assert cleared.status_code == 200
    assert cleared.json() == {"clips": THREE_WITHOUT_VIEWS}
    assert client.get(address).json()["loggedCount"] == 0


@pytest.mark.parametrize(
    "body",
    [
        {"views": 0},
        {"views": -5},
        {"views": 1200.5},
        {"views": MOST_VIEWS + 1},
        {"views": "1200"},
        {"views": True},
        {"views": 1200, "posted": "tiktok"},
        {},
        [1200],
    ],
)
def test_views_outside_the_range_or_of_another_form_are_refused_and_store_nothing(
    client: TestClient, address: str, database: Database, body: object
) -> None:
    refused = client.put(f"{address}/clips/c01/views", json=body)

    assert read_problem(refused) == (422, {"section": None, "message": REFUSED})
    assert client.get(f"{address}/results").json() == {"clips": THREE_WITHOUT_VIEWS}
    assert client.get(address).json()["loggedCount"] == 0
    assert HistoryStore(database).list_outcomes() == []


def test_a_body_that_cannot_be_read_is_refused_without_repeating_it(
    client: TestClient, address: str
) -> None:
    refused = client.put(
        f"{address}/clips/c01/views",
        content='{"views": 1200',
        headers={"Content-Type": "application/json"},
    )

    assert read_problem(refused) == (422, {"section": None, "message": REFUSED})
    assert "1200" not in refused.text


@pytest.mark.parametrize("clip_id", ["c04", "c07"])
def test_views_for_a_clip_without_a_finished_file_and_for_an_unknown_clip_are_refused(
    client: TestClient, address: str, clip_id: str
) -> None:
    refused = client.put(f"{address}/clips/{clip_id}/views", json={"views": 1200})

    assert read_problem(refused) == (422, {"section": None, "message": REFUSED})
    assert client.get(f"{address}/results").json() == {"clips": THREE_WITHOUT_VIEWS}


def test_the_results_and_the_views_of_an_unknown_project_are_not_found(client: TestClient) -> None:
    read = client.get("/api/projects/000000000000/results")
    stored = client.put("/api/projects/000000000000/clips/c01/views", json={"views": 1200})

    assert read_problem(read) == (404, {"section": None, "message": NO_PROJECT})
    assert read_problem(stored) == (404, {"section": None, "message": NO_PROJECT})


def test_deleting_the_project_removes_its_views_and_leaves_its_outcomes(
    client: TestClient, address: str, database: Database
) -> None:
    client.put(f"{address}/clips/c01/views", json={"views": 1200})

    deleted = client.delete(address)

    with database.transaction() as connection:
        views_left = connection.execute("SELECT COUNT(*) FROM clip_views").fetchone()[0]
    assert (deleted.status_code, views_left) == (204, 0)
    assert [outcome.views for outcome in HistoryStore(database).list_outcomes()] == [1200]
