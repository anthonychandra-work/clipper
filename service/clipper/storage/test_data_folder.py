from pathlib import Path

from .data_folder import open_data_folder


def test_opening_creates_the_folder_and_its_parents(tmp_path: Path) -> None:
    root = tmp_path / "nested" / "data"

    data_folder = open_data_folder(root)

    assert root.is_dir()
    assert data_folder.root == root


def test_the_database_file_sits_inside_the_folder(tmp_path: Path) -> None:
    data_folder = open_data_folder(tmp_path / "data")

    assert data_folder.database_file == tmp_path / "data" / "clipper.sqlite3"


def test_each_project_has_a_folder_of_its_own_under_projects(tmp_path: Path) -> None:
    data_folder = open_data_folder(tmp_path / "data")

    assert data_folder.projects_dir.is_dir()
    assert data_folder.project_dir("a1b2c3") == tmp_path / "data" / "projects" / "a1b2c3"


def test_the_preview_copy_of_a_project_is_kept_in_its_folder(tmp_path: Path) -> None:
    data_folder = open_data_folder(tmp_path / "data")

    preview = data_folder.preview_file("a1b2c3")

    assert preview == tmp_path / "data" / "projects" / "a1b2c3" / "preview.mp4"
    assert not preview.exists()


def test_the_replay_graph_of_a_project_is_kept_in_its_folder(tmp_path: Path) -> None:
    data_folder = open_data_folder(tmp_path / "data")

    graph_file = data_folder.replay_graph_file("a1b2c3")

    assert graph_file == tmp_path / "data" / "projects" / "a1b2c3" / "replay-graph.json"
    assert not graph_file.exists()


def test_the_filmstrip_frames_of_a_project_are_kept_under_frames_in_its_folder(
    tmp_path: Path,
) -> None:
    data_folder = open_data_folder(tmp_path / "data")
    project_dir = tmp_path / "data" / "projects" / "a1b2c3"

    assert data_folder.frames_dir("a1b2c3") == project_dir / "frames"
    assert data_folder.frame_file("a1b2c3", "c04", 1) == project_dir / "frames" / "c04-01.jpg"
    assert data_folder.frame_file("a1b2c3", "c12", 12) == project_dir / "frames" / "c12-12.jpg"
    assert not data_folder.frames_dir("a1b2c3").exists()


def test_the_export_of_a_clip_is_kept_under_exports_by_its_rank_and_its_name(
    tmp_path: Path,
) -> None:
    data_folder = open_data_folder(tmp_path / "data")
    project_dir = tmp_path / "data" / "projects" / "a1b2c3"

    assert data_folder.exports_dir("a1b2c3") == project_dir / "exports"
    assert data_folder.export_file("a1b2c3", 1, "c01") == project_dir / "exports" / "01-c01.mp4"
    assert data_folder.export_file("a1b2c3", 12, "c07") == project_dir / "exports" / "12-c07.mp4"
    assert not data_folder.exports_dir("a1b2c3").exists()


def test_the_work_folder_of_a_render_is_the_clip_s_own_and_outside_the_exports(
    tmp_path: Path,
) -> None:
    data_folder = open_data_folder(tmp_path / "data")
    project_dir = tmp_path / "data" / "projects" / "a1b2c3"

    assert data_folder.render_work_dir("a1b2c3", "c01") == project_dir / "rendering-c01"
    assert data_folder.render_work_dir("a1b2c3", "c02") == project_dir / "rendering-c02"
    assert not data_folder.render_work_dir("a1b2c3", "c01").exists()


def test_a_render_s_work_folder_is_not_taken_for_the_source(tmp_path: Path) -> None:
    data_folder = open_data_folder(tmp_path / "data")
    data_folder.render_work_dir("a1b2c3", "c01").mkdir(parents=True)

    assert data_folder.find_source_file("a1b2c3") is None


def test_each_model_has_a_folder_of_its_own_under_models(tmp_path: Path) -> None:
    data_folder = open_data_folder(tmp_path / "data")

    assert data_folder.models_dir == tmp_path / "data" / "models"
    assert data_folder.models_dir.is_dir()
    assert data_folder.model_dir("small") == tmp_path / "data" / "models" / "small"


def test_a_model_is_on_the_mac_when_its_folder_exists(tmp_path: Path) -> None:
    data_folder = open_data_folder(tmp_path / "data")
    data_folder.model_dir("small").mkdir()

    assert data_folder.has_model("small")
    assert not data_folder.has_model("medium")


def test_opening_an_existing_folder_keeps_what_it_holds(tmp_path: Path) -> None:
    kept = tmp_path / "kept.txt"
    kept.write_text("still here")

    open_data_folder(tmp_path)

    assert kept.read_text() == "still here"
