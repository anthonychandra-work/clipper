import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path

VERSION_CHECK_TIMEOUT_SECONDS = 15


@dataclass(frozen=True)
class MediaTools:
    ffmpeg: Path
    ffprobe: Path


class MediaToolsMissingError(Exception):
    def __init__(self, missing: list[str], tools_dir: Path, search_path: str) -> None:
        tools = " and ".join(missing)
        places = f"{tools_dir} or from the PATH ({search_path})"
        super().__init__(f"Clipper cannot start: {tools} did not run from {places}.")
        self.missing = missing


def locate_media_tools(tools_dir: Path, search_path: str) -> MediaTools:
    ffmpeg = find_working_tool("ffmpeg", tools_dir, search_path)
    ffprobe = find_working_tool("ffprobe", tools_dir, search_path)
    if ffmpeg is None or ffprobe is None:
        found = {"ffmpeg": ffmpeg, "ffprobe": ffprobe}
        missing = [name for name, location in found.items() if location is None]
        raise MediaToolsMissingError(missing, tools_dir, search_path)
    return MediaTools(ffmpeg=ffmpeg, ffprobe=ffprobe)


def find_working_tool(name: str, tools_dir: Path, search_path: str) -> Path | None:
    on_path = shutil.which(name, path=search_path)
    candidates = [tools_dir / name, *([Path(on_path)] if on_path else [])]
    return next((candidate for candidate in candidates if runs(candidate)), None)


def runs(tool: Path) -> bool:
    try:
        check = subprocess.run(
            [str(tool), "-version"], capture_output=True, timeout=VERSION_CHECK_TIMEOUT_SECONDS
        )
    except (OSError, subprocess.TimeoutExpired):
        return False
    return check.returncode == 0
