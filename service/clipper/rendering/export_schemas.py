from typing import Literal

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from ..projects import Platform
from ..review import CaptionStyle, Framing
from .render_records import RenderState

type ShownRenderState = RenderState | Literal["none"]

NEVER_QUEUED: Literal["none"] = "none"


class ExportModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="forbid")


class ExportLookResponse(ExportModel):
    caption_style: CaptionStyle
    framing: Framing
    show_hook_title: bool


class RenderResponse(ExportModel):
    state: ShownRenderState
    percent: float
    reason: str | None


class PlatformTextResponse(ExportModel):
    platform: Platform
    title: str
    description: str


class ExportClipResponse(ExportModel):
    id: str
    rank: int
    title: str
    seconds: float
    file: str
    render: RenderResponse
    download: str | None
    texts: list[PlatformTextResponse]


class ExportResponse(ExportModel):
    look: ExportLookResponse
    has_source: bool
    platforms: list[Platform]
    clips: list[ExportClipResponse]
