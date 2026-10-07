from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, field_validator
from pydantic.alias_generators import to_camel

from .selection_records import ClipFlag, HookType, PlatformTexts

MOST_HOOK_TITLE_WORDS = 10

Subscore = Annotated[int, Field(ge=0, le=25)]


class ReplyModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class ProposedScores(ReplyModel):
    hook: Subscore
    arc: Subscore
    value: Subscore
    share: Subscore


class ProposedFlag(ReplyModel):
    kind: ClipFlag
    note: str


class ProposedClip(ReplyModel):
    opening_words: str
    closing_words: str
    scores: ProposedScores
    reason: str
    title: str
    hook_title: str
    hook_type: HookType
    flag: ProposedFlag | None
    platforms: PlatformTexts

    @field_validator("hook_title")
    @classmethod
    def refuse_a_long_hook_title(cls, hook_title: str) -> str:
        if not 1 <= len(hook_title.split()) <= MOST_HOOK_TITLE_WORDS:
            raise ValueError(f"A hook title has 1 to {MOST_HOOK_TITLE_WORDS} words.")
        return hook_title


class ProposedClips(ReplyModel):
    clips: list[ProposedClip]
