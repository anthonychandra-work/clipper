from collections.abc import Callable, Coroutine
from typing import Annotated

from fastapi import APIRouter, Depends, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.routing import APIRoute
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from ..problems import RefusedError
from .describe_settings import SettingsDependencies, SettingsResponse, describe_settings
from .preferences import PreferenceChanges

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


@router.delete("/history")
def forget_history(settings: Settings) -> SettingsResponse:
    settings.history.forget_all()
    return describe_settings(settings.store.read(), settings)
