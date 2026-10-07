import shutil
from pathlib import Path

from .read_disk_space import BYTES_PER_GB, DiskSpace, read_disk_space

ONE_GB_SLACK = BYTES_PER_GB


def test_the_measured_space_is_what_the_system_reports(tmp_path: Path) -> None:
    measured = read_disk_space(tmp_path, reported_free_bytes=None)

    system = shutil.disk_usage(tmp_path)
    assert abs(measured.free_bytes - system.free) < ONE_GB_SLACK
    assert measured.total_bytes == system.total


def test_a_reported_figure_replaces_the_measured_free_space(tmp_path: Path) -> None:
    measured = read_disk_space(tmp_path, reported_free_bytes=3 * BYTES_PER_GB)

    assert measured.free_bytes == 3 * BYTES_PER_GB
    assert measured.total_bytes == shutil.disk_usage(tmp_path).total


def test_zero_reported_bytes_is_taken_as_a_full_disk(tmp_path: Path) -> None:
    assert read_disk_space(tmp_path, reported_free_bytes=0).free_bytes == 0


def test_space_is_given_in_gigabytes() -> None:
    space = DiskSpace(free_bytes=int(3.2 * BYTES_PER_GB), total_bytes=460 * BYTES_PER_GB)

    assert round(space.free_gb(), 1) == 3.2
    assert space.total_gb() == 460
