import socket

UNROUTED_ADDRESS = ("192.0.2.1", 9)
LOOPBACK_ADDRESS = "127.0.0.1"


def find_network_address() -> str:
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as probe:
        try:
            probe.connect(UNROUTED_ADDRESS)
        except OSError:
            return LOOPBACK_ADDRESS
        return str(probe.getsockname()[0])


def describe_phone_address(web_port: int) -> str:
    return f"http://{find_network_address()}:{web_port}"
