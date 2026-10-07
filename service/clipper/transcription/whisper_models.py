from dataclasses import dataclass

from ..settings import WhisperModel

CONFIG_FILE = "config.json"


@dataclass(frozen=True)
class PublishedModel:
    shown_name: str
    repository: str
    revision: str
    file_names: tuple[str, str]

    def list_addresses(self, source: str) -> dict[str, str]:
        folder = f"{source.rstrip('/')}/{self.repository}/resolve/{self.revision}"
        return {name: f"{folder}/{name}" for name in self.file_names}


PUBLISHED_MODELS = {
    WhisperModel.LARGE_V3_TURBO: PublishedModel(
        shown_name="Whisper large-v3-turbo",
        repository="mlx-community/whisper-large-v3-turbo",
        revision="a4aaeec0636e6fef84abdcbe3544cb2bf7e9f6fb",
        file_names=(CONFIG_FILE, "weights.safetensors"),
    ),
    WhisperModel.MEDIUM: PublishedModel(
        shown_name="Whisper medium",
        repository="mlx-community/whisper-medium-mlx",
        revision="7fc08c4eac4c316526498f147dfdee6f6303f975",
        file_names=(CONFIG_FILE, "weights.npz"),
    ),
    WhisperModel.SMALL: PublishedModel(
        shown_name="Whisper small",
        repository="mlx-community/whisper-small-mlx",
        revision="45f3915923c7a79a5a5b5a7d909d39aeb0e5630e",
        file_names=(CONFIG_FILE, "weights.npz"),
    ),
}


def find_published_model(choice: WhisperModel) -> PublishedModel:
    return PUBLISHED_MODELS[choice]
