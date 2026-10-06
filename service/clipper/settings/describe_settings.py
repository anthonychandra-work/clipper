from collections.abc import Callable
from dataclasses import dataclass

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from ..learning import HistoryStore
from ..storage import DiskSpace
from .api_key_store import ApiKeyStore, show_ending
from .describe_machine import describe_phone_address
from .preference_store import PreferenceStore
from .preferences import Preferences

DISK_DECIMALS = 1


@dataclass(frozen=True)
class SettingsDependencies:
    store: PreferenceStore
    api_key_store: ApiKeyStore
    history: HistoryStore
    read_disk_space: Callable[[], DiskSpace]
    web_port: int


class RejectionsResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)

    cut_off: int
    not_interesting: int
    needs_context: int
    repeat: int


class SettingsResponse(Preferences):
    free_disk_gb: float
    total_disk_gb: float
    phone_address: str
    has_api_key: bool
    api_key_ending: str | None
    rejections: RejectionsResponse


def describe_settings(preferences: Preferences, settings: SettingsDependencies) -> SettingsResponse:
    disk = settings.read_disk_space()
    saved_key = settings.api_key_store.read()
    return SettingsResponse(
        **preferences.model_dump(),
        free_disk_gb=round(disk.free_gb(), DISK_DECIMALS),
        total_disk_gb=round(disk.total_gb(), DISK_DECIMALS),
        phone_address=describe_phone_address(settings.web_port),
        has_api_key=saved_key is not None,
        api_key_ending=show_ending(saved_key),
        rejections=RejectionsResponse.model_validate(settings.history.count_rejections()),
    )
