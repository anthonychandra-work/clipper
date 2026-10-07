import json
import os
import time
from collections.abc import Callable
from dataclasses import dataclass, field
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from ..main import create_app
from ..media import MediaTools
from ..projects import ProjectRepository, ProjectStatus
from ..review import (
    CaptionStyle,
    Framing,
    ReviewSources,
    ReviewStore,
    StandingClip,
    read_standing_review,
)
from ..selection import SelectionStore
from ..selection.conftest import TEST_KEY, RecordedClaude
from ..selection.test_whole_app import (
    describe_settings,
    place_the_test_model,
    upload_with_the_brief,
    wait_for_status,
)
from ..settings import StartupSettings
from ..storage import DataFolder, open_data_folder, open_database
from .draw_overlays import OverlayLook
from .render_records import RenderState
from .render_store import RenderStore
from .test_encode_clip import ClipProbe, Pixels, probe_clip, read_frame
from .test_render_clip import (
    MIDDLE_OF_THE_BARS,
    draw_caption_at,
    draw_hook_title,
    name_bars,
    save_evidence,
    shows_overlay,
)

WAIT_SECONDS = 90
KEYWORDS_ON_THE_SPEAKER = OverlayLook(CaptionStyle.KEYWORD, Framing.FOLLOW_SPEAKER)
EVIDENCE_FILE = "talk-exports.json"

type Json = dict[str, object]


@dataclass
class ExportedRun:
    project_id: str
    first_clip: StandingClip
    percents_seen: dict[str, list[float]] = field(default_factory=dict)
    exports: dict[str, Json] = field(default_factory=dict)
    projects: dict[str, Json] = field(default_factory=dict)
    files: dict[str, list[str]] = field(default_factory=dict)
    probes: dict[str, ClipProbe] = field(default_factory=dict)
    frames: dict[float, Pixels] = field(default_factory=dict)
    state_left_by_the_stop: RenderState | None = None


class TalkProject:
    def __init__(self, client: TestClient, project_id: str, data_folder: DataFolder) -> None:
        self._client = client
        self._exports_dir = data_folder.exports_dir(project_id)
        self.address = f"/api/projects/{project_id}"
        self.percents_seen: dict[str, list[float]] = {}

    def keep(self, clip_id: str) -> None:
        self._client.patch(f"{self.address}/clips/{clip_id}", json={"decision": "keep"})

    def send(self, verb: str, part: str) -> Json:
        answer: Json = self._client.request(verb, f"{self.address}{part}").json()
        return answer

    def read_states(self) -> dict[str, str]:
        states: dict[str, str] = {}
        for clip in read_clips(self.send("GET", "/export")):
            render = clip["render"]
            assert isinstance(render, dict)
            states[str(clip["id"])] = render["state"]
            if render["state"] == "rendering":
                self.percents_seen.setdefault(str(clip["id"]), []).append(render["percent"])
        return states

    def wait_until(self, have_arrived: Callable[[dict[str, str]], bool]) -> None:
        deadline = time.monotonic() + WAIT_SECONDS
        while not have_arrived(states := self.read_states()):
            assert time.monotonic() < deadline, f"The renders did not get there: {states}"
            time.sleep(0.05)

    def list_files(self) -> list[str]:
        if not self._exports_dir.is_dir():
            return []
        return sorted(export.name for export in self._exports_dir.iterdir())


def read_clips(export: Json) -> list[Json]:
    clips = export["clips"]
    assert isinstance(clips, list)
    return clips


def read_first_clip(data_folder: DataFolder, project_id: str) -> StandingClip:
    database = open_database(data_folder.database_file)
    sources = ReviewSources(data_folder, SelectionStore(database), ReviewStore(database))
    return read_standing_review(ProjectRepository(database).get(project_id), sources).clips[0]


def render_two_and_cancel_a_third(talk: TalkProject, run: ExportedRun) -> None:
    talk.keep("c01")
    talk.keep("c02")
    talk.send("POST", "/renders")
    talk.wait_until(lambda states: set(states.values()) == {"done"})
    run.exports["two done"] = talk.send("GET", "/export")
    run.projects["two done"] = talk.send("GET", "")
    talk.keep("c03")
    talk.send("POST", "/clips/c03/render")
    talk.wait_until(lambda states: states["c03"] == "rendering")
    run.exports["cancelled"] = talk.send("DELETE", "/renders")
    run.files["cancelled"] = talk.list_files()
    talk.send("POST", "/clips/c03/render")
    talk.wait_until(lambda states: states["c03"] == "rendering")


def measure_exports(run: ExportedRun, data_folder: DataFolder, tools: MediaTools) -> None:
    for rank, clip_id in enumerate(("c01", "c02", "c03"), start=1):
        export = data_folder.export_file(run.project_id, rank, clip_id)
        run.probes[clip_id] = probe_clip(export, tools)
    first = data_folder.export_file(run.project_id, 1, "c01")
    for at_seconds, name in ((1.0, "talk-c01-at-1s.jpg"), (4.0, "talk-c01-at-4s.jpg")):
        run.frames[at_seconds] = read_frame(first, at_seconds, tools)
        save_evidence(name, run.frames[at_seconds])


def save_exports_as_evidence(run: ExportedRun) -> None:
    folder = os.environ.get("CLIPPER_EVIDENCE_DIR")
    if not folder:
        return
    clips = [
        {**clip, "probe": run.probes[str(clip["id"])].model_dump()}
        for clip in read_clips(run.exports["restarted"])
    ]
    Path(folder, EVIDENCE_FILE).write_text(json.dumps({"clips": clips}, indent=2) + "\n")


def run_the_talk(settings: StartupSettings, talk_video: Path, tools: MediaTools) -> ExportedRun:
    data_folder = open_data_folder(settings.data_dir)
    with TestClient(create_app(settings)) as client:
        client.put("/api/settings/api-key", json={"apiKey": TEST_KEY})
        project_id = upload_with_the_brief(client, talk_video)
        wait_for_status(client, project_id, ProjectStatus.READY)
        talk = TalkProject(client, project_id, data_folder)
        run = ExportedRun(project_id, read_first_clip(data_folder, project_id), talk.percents_seen)
        render_two_and_cancel_a_third(talk, run)
    stored = RenderStore(open_database(data_folder.database_file)).list_renders(project_id)
    run.state_left_by_the_stop = stored["c03"].state
    with TestClient(create_app(settings)) as restarted:
        talk = TalkProject(restarted, project_id, data_folder)
        finish_after_the_restart(talk, run)
        measure_exports(run, data_folder, tools)
        delete_during_a_render(talk, restarted)
    run.files["deleted"] = sorted(left.name for left in data_folder.projects_dir.iterdir())
    save_exports_as_evidence(run)
    return run


def finish_after_the_restart(talk: TalkProject, run: ExportedRun) -> None:
    talk.wait_until(lambda states: set(states.values()) == {"done"})
    run.exports["restarted"] = talk.send("GET", "/export")
    run.projects["restarted"] = talk.send("GET", "")


def delete_during_a_render(talk: TalkProject, client: TestClient) -> None:
    talk.send("POST", "/renders")
    talk.wait_until(lambda states: states["c01"] == "rendering")
    assert client.delete(talk.address).status_code == 204
    assert client.get("/api/projects").json()["projects"] == []


@pytest.fixture(scope="module")
def exported_run(
    tmp_path_factory: pytest.TempPathFactory,
    talk_video: Path,
    recorded_claude_address: str,
    media_tools: MediaTools,
) -> ExportedRun:
    run_dir = tmp_path_factory.mktemp("whole-export")
    data_folder = open_data_folder(run_dir / "data")
    place_the_test_model(data_folder)
    stand_in = RecordedClaude(recorded_claude_address)
    key_file = run_dir / "keys" / "anthropic-api-key"
    settings = describe_settings(data_folder, key_file, stand_in.at("talk"))
    return run_the_talk(settings, talk_video, media_tools)


def test_two_kept_clips_of_the_uploaded_talk_end_done_with_rising_percents_on_the_way(
    exported_run: ExportedRun,
) -> None:
    clips = read_clips(exported_run.exports["two done"])
    project_id = exported_run.project_id

    assert [(clip["id"], clip["file"]) for clip in clips] == [
        ("c01", "exports/01-c01.mp4"),
        ("c02", "exports/02-c02.mp4"),
    ]
    assert [clip["render"] for clip in clips] == [
        {"state": "done", "percent": 100.0, "reason": None}
    ] * 2
    assert [clip["download"] for clip in clips] == [
        f"/api/projects/{project_id}/clips/c01/export",
        f"/api/projects/{project_id}/clips/c02/export",
    ]
    for clip_id in ("c01", "c02"):
        seen = exported_run.percents_seen[clip_id]
        assert seen == sorted(seen)
        assert 0 < seen[-1] < 100


def test_the_project_reads_exported_with_a_count_of_two(exported_run: ExportedRun) -> None:
    project = exported_run.projects["two done"]

    assert (project["status"], project["exportedCount"], project["keptCount"]) == ("exported", 2, 2)


def test_each_rendered_file_is_1080_by_1920_at_30_frames_in_h264_with_aac_and_as_long_as_its_clip(
    exported_run: ExportedRun,
) -> None:
    seconds = {
        clip["id"]: clip["seconds"] for clip in read_clips(exported_run.exports["restarted"])
    }

    assert seconds == {"c01": 32.76, "c02": 33.18, "c03": 41.32}
    for clip_id, probe in exported_run.probes.items():
        picture, sound = probe.find_stream("video"), probe.find_stream("audio")
        assert (picture.codec_name, picture.width, picture.height) == ("h264", 1080, 1920)
        assert (picture.r_frame_rate, picture.avg_frame_rate) == ("30/1", "30/1")
        assert sound.codec_name == "aac"
        assert "mp4" in probe.format.format_name.split(",")
        assert probe.format.duration == pytest.approx(seconds[clip_id], abs=0.1)


def test_the_first_clip_shows_its_hook_title_at_one_second_and_only_its_caption_at_four(
    exported_run: ExportedRun,
) -> None:
    clip, look = exported_run.first_clip, KEYWORDS_ON_THE_SPEAKER
    at_1s, at_4s = exported_run.frames[1.0], exported_run.frames[4.0]

    assert shows_overlay(at_1s, draw_hook_title(clip, look))
    assert shows_overlay(at_1s, draw_caption_at(clip, 1.0, look))
    assert shows_overlay(at_4s, draw_caption_at(clip, 4.0, look))
    assert not shows_overlay(at_4s, draw_hook_title(clip, look))
    assert name_bars(at_1s) == name_bars(at_4s) == MIDDLE_OF_THE_BARS


def test_a_cancel_during_the_render_of_a_third_clip_leaves_the_two_files_and_no_third(
    exported_run: ExportedRun,
) -> None:
    clips = read_clips(exported_run.exports["cancelled"])

    assert exported_run.files["cancelled"] == ["01-c01.mp4", "02-c02.mp4"]
    assert {clip["id"]: clip["render"] for clip in clips} == {
        "c01": {"state": "done", "percent": 100.0, "reason": None},
        "c02": {"state": "done", "percent": 100.0, "reason": None},
        "c03": {"state": "none", "percent": 0.0, "reason": None},
    }


def test_an_app_stopped_during_a_render_finishes_it_after_the_next_start(
    exported_run: ExportedRun,
) -> None:
    restarted = read_clips(exported_run.exports["restarted"])
    project = exported_run.projects["restarted"]

    assert exported_run.state_left_by_the_stop is RenderState.WAITING
    assert [clip["render"] for clip in restarted] == [
        {"state": "done", "percent": 100.0, "reason": None}
    ] * 3
    assert (project["status"], project["exportedCount"]) == ("exported", 3)


def test_deleting_the_project_during_a_render_removes_its_exports_and_leaves_no_folder(
    exported_run: ExportedRun,
) -> None:
    assert exported_run.files["deleted"] == []
