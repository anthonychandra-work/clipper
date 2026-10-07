import ipaddress
import socket

import pytest

from .describe_machine import describe_phone_address, find_network_address


def test_the_network_address_is_an_address_of_this_mac() -> None:
    address = ipaddress.ip_address(find_network_address())

    assert address.version == 4
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as listener:
        listener.bind((str(address), 0))


def test_the_phone_address_is_the_network_address_with_the_web_port() -> None:
    assert describe_phone_address(3000) == f"http://{find_network_address()}:3000"


def test_without_a_network_the_address_falls_back_to_this_mac(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def refuse_to_route(self: socket.socket, address: tuple[str, int]) -> None:
        raise OSError("Network is unreachable")

    monkeypatch.setattr(socket.socket, "connect", refuse_to_route)

    assert describe_phone_address(3100) == "http://127.0.0.1:3100"
