import time
from dataclasses import dataclass
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from ..main import create_app
from ..projects import ProjectStatus
from ..selection.conftest import SEEDED_NOTE, TEST_KEY, KeptRequest, RecordedClaude
from ..selection.test_whole_app import (
    describe_settings,
    place_the_test_model,
    upload_with_the_brief,
    wait_for_status,
)
from ..storage import open_data_folder

WAIT_SECONDS = 90
KEPT_AND_RENDERED = ("c01", "c02", "c03")
REJECTED = {"c05": "not-interesting", "c06": "cut-off"}
SEEDED_VIEWS = {"c01": 1200, "c02": 5400, "c03": 48000}
ONE_SCORE_AND_THREE_CUTS = ["score", "cut w01", "cut w02", "cut w03"]
NO_REJECTIONS = {"cutOff": 0, "notInteresting": 0, "needsContext": 0, "repeat": 0}

type Json = dict[str, object]


@dataclass(frozen=True)
class SeededTalk:
    results: Json
    project: Json
    rejections: Json


@dataclass(frozen=True)
class LearningRun:
    seeded: SeededTalk
    rejections_after_the_delete: Json
    requests_with_the_history: list[KeptRequest]
    rejections_once_forgotten: Json
    requests_once_forgotten: list[KeptRequest]


def wait_for_three_exports(client: TestClient, address: str) -> None:
    deadline = time.monotonic() + WAIT_SECONDS
    while True:
        clips = client.get(f"{address}/export").json()["clips"]
        if [clip["render"]["state"] for clip in clips] == ["done"] * len(KEPT_AND_RENDERED):
            return
        assert time.monotonic() < deadline, f"The renders did not finish: {clips}"
        time.sleep(0.05)


def make_the_seeded_set(client: TestClient, project_id: str) -> SeededTalk:
    address = f"/api/projects/{project_id}"
    for clip_id in KEPT_AND_RENDERED:
        client.patch(f"{address}/clips/{clip_id}", json={"decision": "keep"})
    client.post(f"{address}/renders")
    wait_for_three_exports(client, address)
    for clip_id, reason in REJECTED.items():
        rejection = {"decision": "reject", "rejectReason": reason}
        client.patch(f"{address}/clips/{clip_id}", json=rejection)
    for clip_id, views in SEEDED_VIEWS.items():
        client.put(f"{address}/clips/{clip_id}/views", json={"views": views})
    return SeededTalk(
        results=client.get(f"{address}/results").json(),
        project=client.get(address).json(),
        rejections=client.get("/api/settings").json()["rejections"],
    )


def cut_a_talk(client: TestClient, talk_video: Path, stand_in: RecordedClaude) -> list[KeptRequest]:
    stand_in.forget_requests()
    project_id = upload_with_the_brief(client, talk_video)
    wait_for_status(client, project_id, ProjectStatus.READY)
    return stand_in.list_requests()


def name_request(request: KeptRequest) -> str:
    task = request.read_task()
    window = task.get("window")
    return f"cut {window['id']}" if isinstance(window, dict) else str(task["task"])


@pytest.fixture(scope="module")
def learning_run(
    tmp_path_factory: pytest.TempPathFactory, talk_video: Path, recorded_claude_address: str
) -> LearningRun:
    run_dir = tmp_path_factory.mktemp("whole-learning")
    data_folder = open_data_folder(run_dir / "data")
    place_the_test_model(data_folder)
    stand_in = RecordedClaude(recorded_claude_address)
    key_file = run_dir / "keys" / "anthropic-api-key"
    settings = describe_settings(data_folder, key_file, stand_in.at("talk"))
    with TestClient(create_app(settings)) as client:
        client.put("/api/settings/api-key", json={"apiKey": TEST_KEY})
        first_talk = upload_with_the_brief(client, talk_video)
        wait_for_status(client, first_talk, ProjectStatus.READY)
        seeded = make_the_seeded_set(client, first_talk)
        client.delete(f"/api/projects/{first_talk}")
        rejections_after_the_delete = client.get("/api/settings").json()["rejections"]
        requests_with_the_history = cut_a_talk(client, talk_video, stand_in)
        rejections_once_forgotten = client.delete("/api/settings/history").json()["rejections"]
        requests_once_forgotten = cut_a_talk(client, talk_video, stand_in)
    return LearningRun(
        seeded,
        rejections_after_the_delete,
        requests_with_the_history,
        rejections_once_forgotten,
        requests_once_forgotten,
    )


def test_the_results_give_the_three_rendered_clips_with_their_views_and_the_project_counts_3(
    learning_run: LearningRun,
) -> None:
    seeded = learning_run.seeded

    assert seeded.results == {
        "clips": [
            {"id": "c01", "rank": 1, "title": "The worst day my bakery ever had", "views": 1200},
            {
                "id": "c02",
                "rank": 2,
                "title": "Hire for the habits you cannot teach",
                "views": 5400,
            },
            {"id": "c03", "rank": 3, "title": "Almost everyone gets price wrong", "views": 48000},
        ]
    }
    assert (seeded.project["status"], seeded.project["loggedCount"]) == ("exported", 3)
    assert (seeded.project["exportedCount"], seeded.project["rejectedCount"]) == (3, 2)


def test_the_settings_give_one_rejection_each_for_two_reasons_also_after_the_talk_is_deleted(
    learning_run: LearningRun,
) -> None:
    learned = {"cutOff": 1, "notInteresting": 1, "needsContext": 0, "repeat": 0}

    assert learning_run.seeded.rejections == learned
    assert learning_run.rejections_after_the_delete == learned


def test_the_four_requests_of_the_talk_made_after_the_seeded_set_carry_the_two_lines_of_the_note(
    learning_run: LearningRun,
) -> None:
    requests = learning_run.requests_with_the_history

    assert [name_request(request) for request in requests] == ONE_SCORE_AND_THREE_CUTS
    assert [request.read_task()["note"] for request in requests] == [SEEDED_NOTE] * 4
    assert SEEDED_NOTE.splitlines() == [
        "Of the last 5 clips this user decided on, 2 were rejected: 1 cut off mid-thought, 1 not "
        "interesting, 0 needing earlier context, 0 repeating another clip.",
        "Of 3 posted clips with views logged, the best third opened with these hooks: hot-take 1, "
        "and lasted 41 seconds. The worst third opened with: story 1, and lasted 33 seconds.",
    ]


def test_after_the_forget_address_the_four_requests_of_a_third_talk_carry_no_note(
    learning_run: LearningRun,
) -> None:
    requests = learning_run.requests_once_forgotten

    assert learning_run.rejections_once_forgotten == NO_REJECTIONS
    assert [name_request(request) for request in requests] == ONE_SCORE_AND_THREE_CUTS
    assert ["note" in request.read_task() for request in requests] == [False] * 4
