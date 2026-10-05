from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

REPOSITORY_ROOT = Path(__file__).resolve().parents[3]
HOMEBREW_FFMPEG_DIR = Path("/opt/homebrew/opt/ffmpeg-full/bin")
KEY_FILE_IN_HOME = Path("Library") / "Application Support" / "Clipper" / "anthropic-api-key"


class StartupSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="CLIPPER_")

    data_dir: Path = REPOSITORY_ROOT / "data"
    ffmpeg_dir: Path = HOMEBREW_FFMPEG_DIR
    key_file: Path = Path.home() / KEY_FILE_IN_HOME
    web_port: int = 3000
    service_port: int = 8765
