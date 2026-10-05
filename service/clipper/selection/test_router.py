from dataclasses import replace
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from ..main import create_app
from ..settings import StartupSettings
from ..storage import open_database
from .selection_records import (
    Candidate,
    ClipFlag,
    HookType,
    PlatformText,
    PlatformTexts,
    ReplayPeak,
    Subscores,
    WindowRecord,
)
from .selection_store import SelectionStore
from .split_windows import Window

LINK_DRAFT = {
    "sourceKind": "link",
    "link": "https://video.example/talk",
    "platforms": ["reels"],
}
FIRST_WINDOW = WindowRecord(Window("w01", 1, 23, 0.0, 89.92), score=72, is_shortlisted=True)
SECOND_WINDOW = WindowRecord(Window("w02", 17, 38, 63.84, 151.02), score=81, is_shortlisted=True)
THIRD_WINDOW = WindowRecord(Window("w03", 32, 49, 125.3, 199.66), score=0, is_shortlisted=False)
TEXTS = PlatformTexts(
    tiktok=PlatformText("The oven broke", "What a bad morning taught a baker. #bakery"),
    reels=PlatformText("Nobody left angry", "Customers forgive bad news. #smallbusiness"),
    shorts=PlatformText("The worst day my bakery had", "Tell them the truth."),
)
FLAG_NOTE = "Opens on “also”, and a viewer has not heard what came before."
NOTHING_STORED: dict[str, list[object]] = {"windows": [], "replayPeaks": [], "candidates": []}


def make_candidate(rank: int) -> Candidate:
    return Candidate(
        id=f"c{rank:02d}",
        rank=rank,
        start_seconds=11.94 + rank,
        end_seconds=44.7 + rank,
        scores=Subscores(hook=23, arc=23 - rank, value=20, share=22),
        reason="A whole story that ends on a line worth quoting.",
        title="The worst day my bakery ever had",
        hook_title="The oven broke before sunrise",
        hook_type=HookType.STORY,
        platforms=TEXTS,
        flag=None,
        flag_note=None,
        is_replay_peak=False,
    )


@pytest.fixture
def client(tmp_path: Path) -> TestClient:
    return TestClient(create_app(StartupSettings(data_dir=tmp_path / "data")))


@pytest.fixture
def store(client: TestClient, tmp_path: Path) -> SelectionStore:
    return SelectionStore(open_database(tmp_path / "data" / "clipper.sqlite3"))


def add_project(client: TestClient, clip_length: str = "standard") -> str:
    draft = {**LINK_DRAFT, "clipLength": clip_length}
    project_id: str = client.post("/api/projects", json=draft).json()["id"]
    return project_id


def read_selection(client: TestClient, project_id: str) -> dict[str, list[dict[str, object]]]:
    response = client.get(f"/api/projects/{project_id}/selection")
    assert response.status_code == 200
    selection: dict[str, list[dict[str, object]]] = response.json()
    return selection


def test_a_project_with_nothing_stored_answers_with_its_limits_and_three_empty_lists(
    client: TestClient,
) -> None:
    project_id = add_project(client)

    response = client.get(f"/api/projects/{project_id}/selection")

    assert response.status_code == 200
    assert response.json() == {"clipSeconds": {"min": 25, "max": 60}, **NOTHING_STORED}


@pytest.mark.parametrize(
    ("clip_length", "limits"),
    [
        ("short", {"min": 15, "max": 30}),
        ("standard", {"min": 25, "max": 60}),
        ("long", {"min": 60, "max": 180}),
    ],
)
def test_the_limits_are_those_of_the_clip_length_chosen_for_the_project(
    client: TestClient, clip_length: str, limits: dict[str, int]
) -> None:
    project_id = add_project(client, clip_length)

    selection = client.get(f"/api/projects/{project_id}/selection").json()

    assert selection["clipSeconds"] == limits


def test_an_unknown_project_answers_with_the_404_of_the_other_project_addresses(
    client: TestClient,
) -> None:
    response = client.get("/api/projects/missing/selection")

    assert response.status_code == 404
    assert response.json() == client.get("/api/projects/missing").json()
    assert response.json() == {
        "problem": {"section": None, "message": "This project does not exist."}
    }


def test_a_window_is_given_with_its_times_its_score_and_its_place_on_the_shortlist(
    client: TestClient, store: SelectionStore
) -> None:
    project_id = add_project(client)
    store.replace_windows(project_id, [FIRST_WINDOW, THIRD_WINDOW])

    windows = read_selection(client, project_id)["windows"]

    assert windows == [
        {"id": "w01", "startSeconds": 0.0, "endSeconds": 89.92, "score": 72, "isShortlisted": True},
        {
            "id": "w03",
            "startSeconds": 125.3,
            "endSeconds": 199.66,
            "score": 0,
            "isShortlisted": False,
        },
    ]


def test_a_replay_peak_is_given_with_its_start_and_its_end(
    client: TestClient, store: SelectionStore
) -> None:
    project_id = add_project(client)
    store.replace_candidates(project_id, [], [ReplayPeak(131.992, 150.848)])

    peaks = read_selection(client, project_id)["replayPeaks"]

    assert peaks == [{"startSeconds": 131.992, "endSeconds": 150.848}]


def test_a_candidate_is_given_with_every_field_under_its_name(
    client: TestClient, store: SelectionStore
) -> None:
    project_id = add_project(client)
    flagged = replace(
        make_candidate(1),
        hook_type=HookType.HOT_TAKE,
        flag=ClipFlag.NEEDS_CONTEXT,
        flag_note=FLAG_NOTE,
        is_replay_peak=True,
    )
    store.replace_candidates(project_id, [flagged], [])

    (candidate,) = read_selection(client, project_id)["candidates"]

    assert candidate == {
        "id": "c01",
        "rank": 1,
        "startSeconds": 12.94,
        "endSeconds": 45.7,
        "scores": {"hook": 23, "arc": 22, "value": 20, "share": 22},
        "total": 87,
        "reason": "A whole story that ends on a line worth quoting.",
        "title": "The worst day my bakery ever had",
        "hookTitle": "The oven broke before sunrise",
        "hookType": "hot-take",
        "platforms": {
            "tiktok": {
                "title": "The oven broke",
                "description": "What a bad morning taught a baker. #bakery",
            },
            "reels": {
                "title": "Nobody left angry",
                "description": "Customers forgive bad news. #smallbusiness",
            },
            "shorts": {
                "title": "The worst day my bakery had",
                "description": "Tell them the truth.",
            },
        },
        "flag": "needs-context",
        "flagNote": FLAG_NOTE,
        "isReplayPeak": True,
    }


def test_a_candidate_without_a_flag_gives_none_and_no_note(
    client: TestClient, store: SelectionStore
) -> None:
    project_id = add_project(client)
    weak = replace(make_candidate(2), flag=ClipFlag.NOT_RECOMMENDED, flag_note="No payoff.")
    store.replace_candidates(project_id, [make_candidate(1), weak], [])

    plain, flagged = read_selection(client, project_id)["candidates"]

    assert (plain["flag"], plain["flagNote"], plain["isReplayPeak"]) == (None, None, False)
    assert (flagged["flag"], flagged["flagNote"]) == ("not-recommended", "No payoff.")
    assert (plain["hookType"], plain["total"]) == ("story", 87)


def test_windows_and_peaks_come_in_the_order_of_their_starts_and_candidates_in_that_of_their_ranks(
    client: TestClient, store: SelectionStore
) -> None:
    project_id = add_project(client)
    store.replace_windows(project_id, [THIRD_WINDOW, FIRST_WINDOW, SECOND_WINDOW])
    store.replace_candidates(
        project_id,
        [make_candidate(rank) for rank in (3, 1, 2)],
        [ReplayPeak(141.42, 162.63), ReplayPeak(47.14, 49.5)],
    )

    selection = read_selection(client, project_id)

    assert [window["id"] for window in selection["windows"]] == ["w01", "w02", "w03"]
    assert [peak["startSeconds"] for peak in selection["replayPeaks"]] == [47.14, 141.42]
    assert [candidate["rank"] for candidate in selection["candidates"]] == [1, 2, 3]
    assert [candidate["id"] for candidate in selection["candidates"]] == ["c01", "c02", "c03"]


def test_the_selection_of_one_project_holds_nothing_of_another(
    client: TestClient, store: SelectionStore
) -> None:
    selected, untouched = add_project(client), add_project(client)
    store.replace_windows(selected, [FIRST_WINDOW])
    store.replace_candidates(selected, [make_candidate(1)], [ReplayPeak(47.14, 49.5)])

    selection = client.get(f"/api/projects/{untouched}/selection").json()

    assert selection == {"clipSeconds": {"min": 25, "max": 60}, **NOTHING_STORED}
    assert client.get(f"/api/projects/{selected}").json()["candidateCount"] == 1
