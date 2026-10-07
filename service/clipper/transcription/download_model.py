import http.client
import threading
import urllib.request
from collections.abc import Callable
from dataclasses import dataclass
from http import HTTPStatus
from pathlib import Path

from .whisper_models import PublishedModel

PARTIAL_SUFFIX = ".partial"
STALL_TIMEOUT_SECONDS = 20
CHUNK_BYTES = 256 * 1024
FIRST_BYTE_ONLY = "0-0"


class ModelDownloadError(Exception):
    pass


class ModelDownloadStoppedError(Exception):
    def __init__(self) -> None:
        super().__init__("The model download was stopped.")


@dataclass(frozen=True)
class ModelDownload:
    model: PublishedModel
    source: str
    folder: Path


class RisingBytePercent:
    def __init__(self, total_bytes: int, report: Callable[[float], None]) -> None:
        self._total_bytes = total_bytes
        self._report = report
        self._held_bytes = 0
        self._highest = 0.0

    def add(self, byte_count: int) -> None:
        self._held_bytes += byte_count
        percent = 100.0 * self._held_bytes / self._total_bytes if self._total_bytes else 100.0
        if percent > self._highest:
            self._highest = percent
            self._report(percent)


@dataclass(frozen=True)
class WantedFile:
    address: str
    target: Path
    declared_bytes: int

    def fetch_rest(self, stop: threading.Event, progress: RisingBytePercent) -> None:
        held_bytes = self._keep_what_fits()
        progress.add(held_bytes)
        if held_bytes < self.declared_bytes:
            self._append_from(held_bytes, stop, progress)
        if self._count_held_bytes() != self.declared_bytes:
            raise ModelDownloadError(
                f"{self.target.name} ended short of the {self.declared_bytes} bytes it declared."
            )

    def _keep_what_fits(self) -> int:
        if self._count_held_bytes() > self.declared_bytes:
            self.target.unlink()
        return self._count_held_bytes()

    def _count_held_bytes(self) -> int:
        return self.target.stat().st_size if self.target.exists() else 0

    def _append_from(
        self, first_byte: int, stop: threading.Event, progress: RisingBytePercent
    ) -> None:
        rest = open_range(self.address, f"{first_byte}-")
        with rest as response, self.target.open("ab") as stored:
            while chunk := response.read1(CHUNK_BYTES):
                if stop.is_set():
                    raise ModelDownloadStoppedError()
                stored.write(chunk)
                progress.add(len(chunk))


def download_model(
    download: ModelDownload, stop: threading.Event, on_percent: Callable[[float], None]
) -> None:
    partial = download.folder.with_name(download.folder.name + PARTIAL_SUFFIX)
    partial.mkdir(parents=True, exist_ok=True)
    try:
        wanted = ask_for_sizes(download, partial)
        progress = RisingBytePercent(sum(file.declared_bytes for file in wanted), on_percent)
        for file in wanted:
            if stop.is_set():
                raise ModelDownloadStoppedError()
            file.fetch_rest(stop, progress)
    except (OSError, http.client.HTTPException) as failure:
        raise ModelDownloadError(
            f"{download.model.repository} could not be fetched: {failure}"
        ) from failure
    partial.rename(download.folder)


def ask_for_sizes(download: ModelDownload, partial: Path) -> list[WantedFile]:
    addresses = download.model.list_addresses(download.source)
    return [
        WantedFile(address, partial / name, ask_declared_bytes(address))
        for name, address in addresses.items()
    ]


def ask_declared_bytes(address: str) -> int:
    with open_range(address, FIRST_BYTE_ONLY) as response:
        declared = response.headers.get("Content-Range", "").rpartition("/")[2]
    if not declared.isdigit():
        raise ModelDownloadError(f"{address} did not declare its size.")
    return int(declared)


def open_range(address: str, byte_range: str) -> http.client.HTTPResponse:
    request = urllib.request.Request(address, headers={"Range": f"bytes={byte_range}"})
    response = urllib.request.urlopen(request, timeout=STALL_TIMEOUT_SECONDS)
    if isinstance(response, http.client.HTTPResponse):
        if response.status == HTTPStatus.PARTIAL_CONTENT:
            return response
        response.close()
    raise ModelDownloadError(f"{address} did not answer with the bytes it was asked for.")
