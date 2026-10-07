import shutil
from dataclasses import dataclass
from pathlib import Path

BYTES_PER_GB = 1024**3


@dataclass(frozen=True)
class DiskSpace:
    free_bytes: int
    total_bytes: int

    def free_gb(self) -> float:
        return self.free_bytes / BYTES_PER_GB

    def total_gb(self) -> float:
        return self.total_bytes / BYTES_PER_GB


def read_disk_space(folder: Path, reported_free_bytes: int | None) -> DiskSpace:
    usage = shutil.disk_usage(folder)
    free_bytes = usage.free if reported_free_bytes is None else reported_free_bytes
    return DiskSpace(free_bytes=free_bytes, total_bytes=usage.total)
