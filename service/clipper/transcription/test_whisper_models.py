import pytest

from ..settings import WhisperModel
from .whisper_models import find_published_model

HUGGING_FACE = "https://huggingface.co"
PUBLISHED = [
    (
        WhisperModel.LARGE_V3_TURBO,
        "Whisper large-v3-turbo",
        "mlx-community/whisper-large-v3-turbo/resolve/a4aaeec0636e6fef84abdcbe3544cb2bf7e9f6fb",
        "weights.safetensors",
    ),
    (
        WhisperModel.MEDIUM,
        "Whisper medium",
        "mlx-community/whisper-medium-mlx/resolve/7fc08c4eac4c316526498f147dfdee6f6303f975",
        "weights.npz",
    ),
    (
        WhisperModel.SMALL,
        "Whisper small",
        "mlx-community/whisper-small-mlx/resolve/45f3915923c7a79a5a5b5a7d909d39aeb0e5630e",
        "weights.npz",
    ),
]


def test_every_choice_in_settings_is_a_published_model() -> None:
    assert [choice for choice, *_ in PUBLISHED] == list(WhisperModel)


@pytest.mark.parametrize(("choice", "shown_name", "folder", "weights"), PUBLISHED)
def test_a_model_is_known_by_its_name_its_repository_its_revision_and_its_two_files(
    choice: WhisperModel, shown_name: str, folder: str, weights: str
) -> None:
    model = find_published_model(choice)

    assert model.shown_name == shown_name
    assert model.list_addresses(HUGGING_FACE) == {
        "config.json": f"{HUGGING_FACE}/{folder}/config.json",
        weights: f"{HUGGING_FACE}/{folder}/{weights}",
    }


def test_another_source_replaces_hugging_face_in_every_address() -> None:
    addresses = find_published_model(WhisperModel.SMALL).list_addresses("http://127.0.0.1:4000/")

    assert list(addresses.values()) == [
        "http://127.0.0.1:4000/mlx-community/whisper-small-mlx/resolve/"
        "45f3915923c7a79a5a5b5a7d909d39aeb0e5630e/config.json",
        "http://127.0.0.1:4000/mlx-community/whisper-small-mlx/resolve/"
        "45f3915923c7a79a5a5b5a7d909d39aeb0e5630e/weights.npz",
    ]
