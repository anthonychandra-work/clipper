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


def test_opening_an_existing_folder_keeps_what_it_holds(tmp_path: Path) -> None:
    kept = tmp_path / "kept.txt"
    kept.write_text("still here")

    open_data_folder(tmp_path)

    assert kept.read_text() == "still here"
