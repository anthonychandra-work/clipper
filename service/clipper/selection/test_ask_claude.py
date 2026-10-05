import json
import logging
import threading
import time
from collections.abc import Callable, Iterator
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import pytest
from pydantic import BaseModel, Field

from ..conftest import CLOSED_LOCAL_PORT
from ..settings import ClaudeModel
from .ask_claude import ClaudeAccess, ClaudeQuestion, Effort, ask_claude
from .claude_errors import (
    AskStoppedError,
    BusyServiceError,
    ClaudeAskError,
    ClaudeRequestError,
    DeclinedReplyError,
    NoAnswerError,
    RefusedKeyError,
    UnreadableReplyError,
)
from .conftest import TEST_KEY, KeptRequest, RecordedClaude

SYSTEM_TEXT = "Score each window from 0 to 100."
TRANSCRIPT_PART = "1 [0.00] Good morning.\n2 [1.20] Nobody tells you this about bread."
TASK = json.dumps({"task": "score", "windows": [{"id": "w01"}]})
NOT_ALLOWED = ("temperature", "top_p", "top_k", "tools", "tool_choice", "thinking")
FALLBACK_BETA = "server-side-fallback-2026-07-01"
KEY_OF_THE_SHELL = "sk-ant-shell-9c1d"
TOKEN_OF_THE_SHELL = "token-of-the-shell"
WITH_FALLBACK = [ClaudeModel.FABLE, ClaudeModel.OPUS, ClaudeModel.SONNET]


class ScoredWindow(BaseModel):
    id: str
    score: int = Field(ge=0, le=100)


class WindowScores(BaseModel):
    windows: list[ScoredWindow]


class AnswerWithAStatus(BaseHTTPRequestHandler):
    status = 500
    seen_headers: list[dict[str, str]]

    def do_POST(self) -> None:
        self.rfile.read(int(self.headers["Content-Length"]))
        self.seen_headers.append({name.lower(): value for name, value in self.headers.items()})
        problem = {"type": "error", "error": {"type": "api_error", "message": "made up"}}
        body = json.dumps(problem).encode()
        self.send_response(self.status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format: str, *args: object) -> None:
        del format, args


@pytest.fixture
def serve_status() -> Iterator[Callable[[int], tuple[str, list[dict[str, str]]]]]:
    servers: list[ThreadingHTTPServer] = []

    def serve(status: int) -> tuple[str, list[dict[str, str]]]:
        seen: list[dict[str, str]] = []
        handler = type("Handler", (AnswerWithAStatus,), {"status": status, "seen_headers": seen})
        server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        servers.append(server)
        return f"http://127.0.0.1:{server.server_port}", seen

    yield serve
    for server in servers:
        server.shutdown()
        server.server_close()


def describe_question(
    model: ClaudeModel = ClaudeModel.SONNET, effort: Effort = "medium"
) -> ClaudeQuestion[WindowScores]:
    return ClaudeQuestion(
        model=model,
        effort=effort,
        system=SYSTEM_TEXT,
        transcript_part=TRANSCRIPT_PART,
        task=TASK,
        reply_model=WindowScores,
    )


def ask(address: str, question: ClaudeQuestion[WindowScores] | None = None) -> WindowScores:
    access = ClaudeAccess(key=TEST_KEY, address=address)
    return ask_claude(question or describe_question(), access, threading.Event())


def assert_follows_the_request_rules(request: KeptRequest, model: ClaudeModel) -> None:
    output_format = request.read_output_config()["format"]
    assert isinstance(output_format, dict)
    assert request.has_key is True
    assert request.body["model"] == model.value
    assert request.body["max_tokens"] == 32000
    assert request.body["stream"] is True
    assert request.body["system"] == SYSTEM_TEXT
    assert request.parts == [
        {"type": "text", "text": TRANSCRIPT_PART, "cache_control": {"type": "ephemeral"}},
        {"type": "text", "text": TASK},
    ]
    assert output_format["type"] == "json_schema"
    assert "windows" in output_format["schema"]["properties"]
    assert [name for name in NOT_ALLOWED if name in request.body] == []


@pytest.mark.parametrize("model", WITH_FALLBACK)
def test_a_request_to_a_newer_model_carries_the_effort_and_asks_for_the_fallback(
    recorded_claude: RecordedClaude, model: ClaudeModel
) -> None:
    ask(recorded_claude.at("one-window"), describe_question(model, effort="high"))

    (request,) = recorded_claude.list_requests()
    assert_follows_the_request_rules(request, model)
    assert request.path == "/v1/messages?beta=true"
    assert request.beta == FALLBACK_BETA
    assert request.body["fallbacks"] == "default"
    assert request.read_output_config()["effort"] == "high"


def test_a_request_to_haiku_carries_no_effort_and_asks_for_no_fallback(
    recorded_claude: RecordedClaude,
) -> None:
    ask(recorded_claude.at("one-window"), describe_question(ClaudeModel.HAIKU, effort="high"))

    (request,) = recorded_claude.list_requests()
    assert_follows_the_request_rules(request, ClaudeModel.HAIKU)
    assert request.path == "/v1/messages"
    assert request.beta is None
    assert "fallbacks" not in request.body
    assert "effort" not in request.read_output_config()


def test_the_effort_sent_is_the_effort_asked_for(recorded_claude: RecordedClaude) -> None:
    ask(recorded_claude.at("one-window"), describe_question(effort="medium"))

    (request,) = recorded_claude.list_requests()
    assert request.read_output_config()["effort"] == "medium"


def test_a_good_reply_is_returned_as_the_model_of_the_reply(
    recorded_claude: RecordedClaude,
) -> None:
    reply = ask(recorded_claude.at("one-window"))

    assert reply == WindowScores(windows=[ScoredWindow(id="w01", score=62)])
    assert len(recorded_claude.list_requests()) == 1


def test_an_unreadable_reply_is_asked_for_three_times_in_all_and_then_raises(
    recorded_claude: RecordedClaude,
) -> None:
    with pytest.raises(UnreadableReplyError):
        ask(recorded_claude.at("unreadable"))

    assert len(recorded_claude.list_requests()) == 3


def test_a_reply_unreadable_once_is_asked_for_twice_and_read(
    recorded_claude: RecordedClaude,
) -> None:
    reply = ask(recorded_claude.at("unreadable-once+one-window"))

    assert reply.windows[0].score == 62
    assert len(recorded_claude.list_requests()) == 2


def test_a_reply_the_check_of_the_caller_refuses_counts_as_unreadable(
    recorded_claude: RecordedClaude,
) -> None:
    checked: list[WindowScores] = []

    def refuse(reply: WindowScores) -> bool:
        checked.append(reply)
        return False

    question = ClaudeQuestion(
        model=ClaudeModel.SONNET,
        effort="medium",
        system=SYSTEM_TEXT,
        transcript_part=TRANSCRIPT_PART,
        task=TASK,
        reply_model=WindowScores,
        accepts=refuse,
    )

    with pytest.raises(UnreadableReplyError):
        ask(recorded_claude.at("one-window"), question)

    assert len(checked) == 3
    assert len(recorded_claude.list_requests()) == 3


def test_a_declined_reply_raises_after_one_request_although_its_text_can_be_read(
    recorded_claude: RecordedClaude,
) -> None:
    with pytest.raises(DeclinedReplyError):
        ask(recorded_claude.at("declined"))

    assert len(recorded_claude.list_requests()) == 1


def test_a_refused_key_raises_its_own_error(recorded_claude: RecordedClaude) -> None:
    with pytest.raises(RefusedKeyError):
        ask(recorded_claude.at("rejected-key"))

    assert len(recorded_claude.list_requests()) == 1


def test_a_closed_port_raises_the_error_of_no_answer() -> None:
    with pytest.raises(NoAnswerError):
        ask(CLOSED_LOCAL_PORT)


@pytest.mark.parametrize("status", [429, 500, 529])
def test_a_busy_or_failing_service_raises_its_own_error(
    serve_status: Callable[[int], tuple[str, list[dict[str, str]]]], status: int
) -> None:
    address, _ = serve_status(status)

    with pytest.raises(BusyServiceError):
        ask(address)


def test_a_request_the_api_refuses_for_another_reason_raises_the_last_named_error(
    recorded_claude: RecordedClaude,
) -> None:
    with pytest.raises(ClaudeRequestError):
        ask(recorded_claude.at("no-such-scenario"))


def test_a_stop_set_after_one_second_ends_a_slow_request_in_under_two(
    recorded_claude: RecordedClaude,
) -> None:
    stop = threading.Event()
    threads_before = threading.active_count()
    timer = threading.Timer(1, stop.set)
    timer.start()
    asked_at = time.monotonic()

    with pytest.raises(AskStoppedError):
        ask_claude(
            describe_question(), ClaudeAccess(TEST_KEY, recorded_claude.at("slow/one-window")), stop
        )

    timer.join()
    assert 1 <= time.monotonic() - asked_at < 2
    assert threading.active_count() == threads_before


def test_a_key_a_token_and_an_address_of_the_shell_are_not_used(
    serve_status: Callable[[int], tuple[str, list[dict[str, str]]]],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("ANTHROPIC_API_KEY", KEY_OF_THE_SHELL)
    monkeypatch.setenv("ANTHROPIC_AUTH_TOKEN", TOKEN_OF_THE_SHELL)
    monkeypatch.setenv("ANTHROPIC_BASE_URL", CLOSED_LOCAL_PORT)
    address, seen_headers = serve_status(401)

    with pytest.raises(RefusedKeyError):
        ask(address)

    (headers,) = seen_headers
    assert headers["x-api-key"] == TEST_KEY
    assert "authorization" not in headers
    assert KEY_OF_THE_SHELL not in str(headers)
    assert TOKEN_OF_THE_SHELL not in str(headers)


def test_with_every_logger_at_debug_no_record_and_no_error_holds_the_key(
    recorded_claude: RecordedClaude, caplog: pytest.LogCaptureFixture
) -> None:
    caplog.set_level(logging.DEBUG)
    failures: list[BaseException] = []

    ask(recorded_claude.at("one-window"))
    for scenario in ("rejected-key", "unreadable", "declined", "no-such-scenario"):
        with pytest.raises(ClaudeAskError) as raised:
            ask(recorded_claude.at(scenario))
        failures += [raised.value, *([raised.value.__cause__] if raised.value.__cause__ else [])]

    logged = [f"{record.getMessage()} {record.args!r}" for record in caplog.records]
    assert any("claude-sonnet-5-5" in line for line in logged)
    assert [line for line in logged if TEST_KEY in line] == []
    assert [failure for failure in failures if TEST_KEY in f"{failure} {failure!r}"] == []
