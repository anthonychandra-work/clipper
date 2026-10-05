from http import HTTPStatus

type ProblemBody = dict[str, object]


class AppError(Exception):
    status_code: int = HTTPStatus.INTERNAL_SERVER_ERROR

    def __init__(self, message: str, section: str | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.section = section

    def describe(self) -> ProblemBody:
        return {"problem": {"section": self.section, "message": self.message}}


class NotFoundError(AppError):
    status_code = HTTPStatus.NOT_FOUND


class RefusedError(AppError):
    status_code = HTTPStatus.UNPROCESSABLE_ENTITY


class ConflictError(AppError):
    status_code = HTTPStatus.CONFLICT
