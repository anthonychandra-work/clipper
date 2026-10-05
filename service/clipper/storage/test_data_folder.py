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
