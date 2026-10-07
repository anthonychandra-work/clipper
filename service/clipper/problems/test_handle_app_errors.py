from fastapi import FastAPI
from fastapi.testclient import TestClient

from .app_error import AppError, ConflictError, NotFoundError, RefusedError
from .handle_app_errors import handle_app_errors


def raise_from_route(error: Exception) -> TestClient:
    app = FastAPI()
    handle_app_errors(app)

    @app.get("/fail")
    def fail() -> None:
        raise error

    return TestClient(app, raise_server_exceptions=False)


def test_a_refusal_answers_422_with_its_section_and_message() -> None:
    client = raise_from_route(RefusedError("Choose a video file first.", section="source"))

    response = client.get("/fail")

    assert response.status_code == 422
    assert response.json() == {
        "problem": {"section": "source", "message": "Choose a video file first."}
    }


def test_a_missing_thing_answers_404() -> None:
    client = raise_from_route(NotFoundError("This project does not exist."))

    response = client.get("/fail")

    assert response.status_code == 404
    assert response.json() == {
        "problem": {"section": None, "message": "This project does not exist."}
    }


def test_a_conflict_answers_409() -> None:
    response = raise_from_route(ConflictError("This project is not uploading.")).get("/fail")

    assert response.status_code == 409


def test_an_error_without_a_kind_answers_500_with_its_message() -> None:
    response = raise_from_route(AppError("Something went wrong.")).get("/fail")

    assert response.status_code == 500
    assert response.json()["problem"]["message"] == "Something went wrong."


def test_an_error_outside_the_hierarchy_is_left_to_the_server() -> None:
    response = raise_from_route(ValueError("not ours")).get("/fail")

    assert response.status_code == 500
    assert response.text == "Internal Server Error"
