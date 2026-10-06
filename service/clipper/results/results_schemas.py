from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StrictInt
from pydantic.alias_generators import to_camel

MOST_VIEWS = 9_999_999_999


class ResultsModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="forbid")


class ResultClipResponse(ResultsModel):
    id: str
    rank: int
    title: str
    views: int | None


class ResultsResponse(ResultsModel):
    clips: list[ResultClipResponse]


class ViewsBody(ResultsModel):
    views: Annotated[StrictInt, Field(ge=1, le=MOST_VIEWS)] | None
