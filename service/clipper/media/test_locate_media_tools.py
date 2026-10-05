from pathlib import Path

import pytest

from .locate_media_tools import MediaToolsMissingError, locate_media_tools

WORKING_TOOL = "#!/bin/sh\nexit 0\n"
BROKEN_TOOL = "#!/bin/sh\nexit 134\n"
HOMEBREW_TOOLS_DIR = Path("/opt/homebrew/opt/ffmpeg-full/bin")


def write_tool(folder: Path, name: str, script: str = WORKING_TOOL) -> Path:
    folder.mkdir(parents=True, exist_ok=True)
    tool = folder / name
    tool.write_text(script)
    tool.chmod(0o755)
    return tool


def test_tools_are_found_in_the_configured_folder(tmp_path: Path) -> None:
    ffmpeg = write_tool(tmp_path / "tools", "ffmpeg")
    ffprobe = write_tool(tmp_path / "tools", "ffprobe")

    tools = locate_media_tools(tmp_path / "tools", search_path="")

    assert tools.ffmpeg == ffmpeg
    assert tools.ffprobe == ffprobe


def test_tools_are_taken_from_the_path_when_the_folder_lacks_them(tmp_path: Path) -> None:
    ffmpeg = write_tool(tmp_path / "on-path", "ffmpeg")
    ffprobe = write_tool(tmp_path / "on-path", "ffprobe")
    empty_folder = tmp_path / "tools"
    empty_folder.mkdir()

    tools = locate_media_tools(empty_folder, search_path=str(tmp_path / "on-path"))

    assert tools.ffmpeg == ffmpeg
    assert tools.ffprobe == ffprobe


def test_a_tool_that_does_not_start_in_the_folder_is_taken_from_the_path(tmp_path: Path) -> None:
    write_tool(tmp_path / "tools", "ffmpeg", BROKEN_TOOL)
    write_tool(tmp_path / "tools", "ffprobe")
    working_ffmpeg = write_tool(tmp_path / "on-path", "ffmpeg")

    tools = locate_media_tools(tmp_path / "tools", search_path=str(tmp_path / "on-path"))

    assert tools.ffmpeg == working_ffmpeg
    assert tools.ffprobe == tmp_path / "tools" / "ffprobe"


def test_a_missing_tool_is_named_with_the_places_searched(tmp_path: Path) -> None:
    write_tool(tmp_path / "tools", "ffmpeg")

    with pytest.raises(MediaToolsMissingError) as raised:
        locate_media_tools(tmp_path / "tools", search_path="/nowhere/bin")

    assert raised.value.missing == ["ffprobe"]
    assert str(raised.value) == (
        f"Clipper cannot start: ffprobe did not run from {tmp_path / 'tools'} "
        "or from the PATH (/nowhere/bin)."
    )


def test_a_broken_tool_is_named(tmp_path: Path) -> None:
    write_tool(tmp_path / "tools", "ffmpeg", BROKEN_TOOL)
    write_tool(tmp_path / "tools", "ffprobe")

    with pytest.raises(MediaToolsMissingError) as raised:
        locate_media_tools(tmp_path / "tools", search_path="")

    assert raised.value.missing == ["ffmpeg"]


def test_both_tools_are_named_when_neither_is_found(tmp_path: Path) -> None:
    with pytest.raises(MediaToolsMissingError) as raised:
        locate_media_tools(tmp_path / "no-tools", search_path="")

    assert "ffmpeg and ffprobe did not run" in str(raised.value)


def test_a_file_that_is_not_a_program_does_not_count_as_a_tool(tmp_path: Path) -> None:
    (tmp_path / "ffmpeg").write_text("not a program")
    write_tool(tmp_path, "ffprobe")

    with pytest.raises(MediaToolsMissingError) as raised:
        locate_media_tools(tmp_path, search_path="")

    assert raised.value.missing == ["ffmpeg"]


def test_the_homebrew_tools_on_this_mac_run() -> None:
    tools = locate_media_tools(HOMEBREW_TOOLS_DIR, search_path="")

    assert tools.ffmpeg == HOMEBREW_TOOLS_DIR / "ffmpeg"
    assert tools.ffprobe == HOMEBREW_TOOLS_DIR / "ffprobe"
