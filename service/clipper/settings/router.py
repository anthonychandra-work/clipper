from collections.abc import Callable
from dataclasses import dataclass
from typing import Annotated

from fastapi import APIRouter, Depends, Request

from ..storage import DiskSpace
from .describe_machine import describe_phone_address
from .preference_store import PreferenceStore
from .preferences import PreferenceChanges, Preferences

DISK_DECIMALS = 1

router = APIRouter(prefix="/api/settings")


@dataclass(frozen=True)
class SettingsDependencies:
    store: PreferenceStore
    read_disk_space: Callable[[], DiskSpace]
    web_port: int


class SettingsResponse(Preferences):
    free_disk_gb: float
    total_disk_gb: float
    phone_address: str


def provide_settings(request: Request) -> SettingsDependencies:
    dependencies = request.app.state.settings
    if not isinstance(dependencies, SettingsDependencies):
        raise RuntimeError("The app was started without the dependencies of its settings routes.")
    return dependencies


Settings = Annotated[SettingsDependencies, Depends(provide_settings)]


@router.get("")
def read_settings(settings: Settings) -> SettingsResponse:
    return describe_settings(settings.store.read(), settings)


@router.patch("")
def change_settings(changes: PreferenceChanges, settings: Settings) -> SettingsResponse:
    return describe_settings(settings.store.save(changes), settings)


def describe_settings(preferences: Preferences, settings: SettingsDependencies) -> SettingsResponse:
    disk = settings.read_disk_space()
    return SettingsResponse(
        **preferences.model_dump(),
        free_disk_gb=round(disk.free_gb(), DISK_DECIMALS),
        total_disk_gb=round(disk.total_gb(), DISK_DECIMALS),
        phone_address=describe_phone_address(settings.web_port),
    )
