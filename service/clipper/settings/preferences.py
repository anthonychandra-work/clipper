from enum import StrEnum

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from ..projects import ClipLength


class ClaudeModel(StrEnum):
    FABLE = "claude-fable-5-1"
    OPUS = "claude-opus-5-5"
    SONNET = "claude-sonnet-5-5"
    HAIKU = "claude-haiku-4-5"


class WhisperModel(StrEnum):
    LARGE_V3_TURBO = "large-v3-turbo"
    MEDIUM = "medium"
    SMALL = "small"


class ClipsPerVideo(StrEnum):
    AUTO = "auto"
    FOUR = "4"
    EIGHT = "8"
    TWELVE = "12"


class SourceRetention(StrEnum):
    THREE_DAYS = "3"
    SEVEN_DAYS = "7"
    THIRTY_DAYS = "30"
    NEVER = "never"


class Preferences(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    scoring_model: ClaudeModel = ClaudeModel.SONNET
    cutting_model: ClaudeModel = ClaudeModel.OPUS
    whisper_model: WhisperModel = WhisperModel.LARGE_V3_TURBO
    default_length: ClipLength = ClipLength.STANDARD
    clips_per_video: ClipsPerVideo = ClipsPerVideo.AUTO
    source_retention: SourceRetention = SourceRetention.SEVEN_DAYS


class PreferenceChanges(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="forbid")

    scoring_model: ClaudeModel | None = None
    cutting_model: ClaudeModel | None = None
    whisper_model: WhisperModel | None = None
    default_length: ClipLength | None = None
    clips_per_video: ClipsPerVideo | None = None
    source_retention: SourceRetention | None = None
