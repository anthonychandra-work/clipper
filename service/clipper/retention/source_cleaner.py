import logging
import threading
import time
from collections.abc import Callable

from .remove_old_sources import SECONDS_PER_DAY, RetentionSources, remove_old_sources

CLEANUP_INTERVAL_SECONDS = 3600.0
CLEANER_THREAD = "clipper-source-cleaner"

log = logging.getLogger("clipper.retention")

type Clock = Callable[[], float]


def run_clock_ahead(days: int) -> Clock:
    return lambda: time.time() + days * SECONDS_PER_DAY


class SourceCleaner:
    def __init__(
        self,
        sources: RetentionSources,
        clock: Clock,
        interval_seconds: float = CLEANUP_INTERVAL_SECONDS,
    ) -> None:
        self._sources = sources
        self._clock = clock
        self._interval_seconds = interval_seconds
        self._stopped = threading.Event()
        self._thread = threading.Thread(
            target=self._clean_on_time, name=CLEANER_THREAD, daemon=True
        )

    def start(self) -> None:
        self.clean()
        self._thread.start()

    def stop(self) -> None:
        self._stopped.set()
        if self._thread.is_alive():
            self._thread.join()

    def clean(self) -> None:
        try:
            remove_old_sources(self._clock(), self._sources)
        except OSError:
            # The tool keeps running, and the next pass tries the same sources again.
            log.exception("The sources of old projects could not be removed.")

    def _clean_on_time(self) -> None:
        while not self._stopped.wait(self._interval_seconds):
            self.clean()
