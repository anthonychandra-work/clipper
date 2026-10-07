import pytest

from ..settings import ClaudeModel
from .model_traits import FALLBACK_BETA, describe_model


@pytest.mark.parametrize("model", [ClaudeModel.FABLE, ClaudeModel.OPUS, ClaudeModel.SONNET])
def test_the_three_newer_models_take_an_effort_setting_and_the_fallback(model: ClaudeModel) -> None:
    traits = describe_model(model)

    assert (traits.takes_effort, traits.takes_fallback) == (True, True)


def test_haiku_takes_neither_an_effort_setting_nor_the_fallback() -> None:
    traits = describe_model(ClaudeModel.HAIKU)

    assert (traits.takes_effort, traits.takes_fallback) == (False, False)


def test_every_model_settings_offers_has_its_traits() -> None:
    assert all(describe_model(model) is not None for model in ClaudeModel)


def test_the_fallback_is_asked_for_in_its_default_form_under_its_own_beta() -> None:
    assert FALLBACK_BETA == "server-side-fallback-2026-07-01"
