from collections.abc import Callable, Coroutine
from dataclasses import dataclass
from typing import Annotated

from fastapi import APIRouter, Depends, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.routing import APIRoute
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from ..problems import RefusedError
from ..storage import DiskSpace
from .api_key_store import ApiKeyStore, show_ending
from .describe_machine import describe_phone_address
from .preference_store import PreferenceStore
from .preferences import PreferenceChanges, Preferences

DISK_DECIMALS = 1
UNREADABLE_CHANGE = "Clipper could not read this change to Settings. Reload the page and try again."


class RouteThatRepeatsNothing(APIRoute):
    def get_route_handler(self) -> Callable[[Request], Coroutine[object, object, Response]]:
        handle = super().get_route_handler()

        async def handle_without_echo(request: Request) -> Response:
            try:
                return await handle(request)
            except RequestValidationError:
                # FastAPI's own 422 repeats the body it was sent, and that body may hold the key.
                raise RefusedError(UNREADABLE_CHANGE) from None

        return handle_without_echo


router = APIRouter(prefix="/api/settings", route_class=RouteThatRepeatsNothing)


@dataclass(frozen=True)
class SettingsDependencies:
    store: PreferenceStore
    api_key_store: ApiKeyStore
    read_disk_space: Callable[[], DiskSpace]
    web_port: int


class SettingsResponse(Preferences):
    free_disk_gb: float
    total_disk_gb: float
    phone_address: str
    has_api_key: bool
    api_key_ending: str | None


class ApiKeyRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="forbid")

    api_key: str


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


@router.put("/api-key")
def save_api_key(sent: ApiKeyRequest, settings: Settings) -> SettingsResponse:
    settings.api_key_store.save(sent.api_key)
    return describe_settings(settings.store.read(), settings)


@router.delete("/api-key")
def remove_api_key(settings: Settings) -> SettingsResponse:
    settings.api_key_store.remove()
    return describe_settings(settings.store.read(), settings)


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
    )
