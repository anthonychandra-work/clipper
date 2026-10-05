class ClaudeAskError(Exception):
    pass


class UnreadableReplyError(ClaudeAskError):
    def __init__(self, requests_sent: int) -> None:
        super().__init__(f"No reply could be read in {requests_sent} requests.")


class DeclinedReplyError(ClaudeAskError):
    def __init__(self) -> None:
        super().__init__("The model declined to answer.")


class RefusedKeyError(ClaudeAskError):
    def __init__(self) -> None:
        super().__init__("The API did not accept the key.")


class NoAnswerError(ClaudeAskError):
    def __init__(self) -> None:
        super().__init__("Nothing answered at the address of the API.")


class BusyServiceError(ClaudeAskError):
    def __init__(self) -> None:
        super().__init__("The API is rate limited or failing.")


class ClaudeRequestError(ClaudeAskError):
    def __init__(self) -> None:
        super().__init__("The API refused the request.")


class AskStoppedError(ClaudeAskError):
    def __init__(self) -> None:
        super().__init__("The request was stopped.")
