from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from .app_error import AppError


def handle_app_errors(app: FastAPI) -> None:
    app.add_exception_handler(AppError, respond_with_problem)


async def respond_with_problem(request: Request, error: Exception) -> JSONResponse:
    if not isinstance(error, AppError):
        raise error
    return JSONResponse(status_code=error.status_code, content=error.describe())
