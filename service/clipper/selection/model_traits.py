from dataclasses import dataclass

from ..settings import ClaudeModel

FALLBACK_BETA = "server-side-fallback-2026-07-01"


@dataclass(frozen=True)
class ModelTraits:
    takes_effort: bool
    takes_fallback: bool


WITH_EFFORT_AND_FALLBACK = ModelTraits(takes_effort=True, takes_fallback=True)
WITH_NEITHER = ModelTraits(takes_effort=False, takes_fallback=False)

TRAITS_BY_MODEL = {
    ClaudeModel.FABLE: WITH_EFFORT_AND_FALLBACK,
    ClaudeModel.OPUS: WITH_EFFORT_AND_FALLBACK,
    ClaudeModel.SONNET: WITH_EFFORT_AND_FALLBACK,
    ClaudeModel.HAIKU: WITH_NEITHER,
}


def describe_model(model: ClaudeModel) -> ModelTraits:
    return TRAITS_BY_MODEL[model]
