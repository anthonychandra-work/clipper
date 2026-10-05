import json
import time

import httpx2

from .conftest import TEST_KEY, RecordedClaude

SLOW_ANSWER_SECONDS = 6
SLOW_TIMEOUT_SECONDS = 15
STREAM_EVENTS = [
    "message_start",
    "content_block_start",
    "content_block_delta",
    "content_block_stop",
    "message_delta",
    "message_stop",
]


def describe_question(task: dict[str, object], *, stream: bool = False) -> dict[str, object]:
    parts = [
        {"type": "text", "text": "1 [0.00] Good morning."},
        {"type": "text", "text": json.dumps(task)},
    ]
    return {
        "model": "claude-sonnet-5-5",
        "max_tokens": 32000,
        "stream": stream,
        "messages": [{"role": "user", "content": parts}],
    }


def ask(address: str, task: dict[str, object]) -> httpx2.Response:
    return httpx2.post(
        f"{address}/v1/messages",
        json=describe_question(task),
        headers={"x-api-key": TEST_KEY},
        timeout=SLOW_TIMEOUT_SECONDS,
    )


def test_a_question_is_answered_with_one_message_that_names_its_model(
    recorded_claude: RecordedClaude,
) -> None:
    answer = ask(recorded_claude.at("one-window"), {"task": "score"})

    message = answer.json()
    assert answer.status_code == 200
    assert (message["type"], message["role"], message["model"]) == (
        "message",
        "assistant",
        "claude-sonnet-5-5",
    )
    assert message["stop_reason"] == "end_turn"
    assert json.loads(message["content"][0]["text"]) == {"windows": [{"id": "w01", "score": 62}]}


def test_the_address_of_the_beta_form_is_answered_the_same_way(
    recorded_claude: RecordedClaude,
) -> None:
    address = f"{recorded_claude.at('one-window')}/v1/messages?beta=true"

    answer = httpx2.post(address, json=describe_question({"task": "score"}))

    assert answer.status_code == 200
    assert recorded_claude.list_requests()[0].path == "/v1/messages?beta=true"


def test_a_question_that_asks_for_a_stream_gets_the_events_of_one(
    recorded_claude: RecordedClaude,
) -> None:
    address = f"{recorded_claude.at('one-window')}/v1/messages"

    answer = httpx2.post(address, json=describe_question({"task": "score"}, stream=True))

    lines = answer.text.splitlines()
    events = [
        json.loads(line.removeprefix("data: ")) for line in lines if line.startswith("data: ")
    ]
    assert answer.headers["content-type"] == "text/event-stream"
    assert [line.removeprefix("event: ") for line in lines if line.startswith("event: ")] == (
        STREAM_EVENTS
    )
    assert [event["type"] for event in events] == STREAM_EVENTS
    assert events[0]["message"]["model"] == "claude-sonnet-5-5"
    assert json.loads(events[2]["delta"]["text"]) == {"windows": [{"id": "w01", "score": 62}]}
    assert events[4]["delta"]["stop_reason"] == "end_turn"


def test_a_task_no_recorded_reply_fits_is_answered_404_in_the_form_of_the_api(
    recorded_claude: RecordedClaude,
) -> None:
    for address in (recorded_claude.at("one-window"), recorded_claude.at("no-such-scenario")):
        answer = ask(address, {"task": "cut", "window": {"id": "w01"}})

        assert answer.status_code == 404
        assert answer.json()["type"] == "error"
        assert answer.json()["error"]["type"] == "not_found_error"


def test_scenarios_joined_by_a_plus_are_tried_in_that_order(
    recorded_claude: RecordedClaude,
) -> None:
    joined = recorded_claude.at("one-window+unreadable")

    scored = ask(joined, {"task": "score"}).json()
    cut = ask(joined, {"task": "cut", "window": {"id": "w01"}}).json()

    assert scored["content"][0]["text"].startswith('{"windows"')
    assert cut["content"][0]["text"].startswith("Here is what I found")


def test_a_reply_marked_for_one_use_answers_once_and_then_stands_aside(
    recorded_claude: RecordedClaude,
) -> None:
    joined = recorded_claude.at("unreadable-once+one-window")

    answers = [ask(joined, {"task": "score"}).json() for _ in range(3)]

    assert [answer["stop_reason"] for answer in answers] == ["max_tokens", "end_turn", "end_turn"]


def test_forgetting_the_requests_also_forgets_the_uses(recorded_claude: RecordedClaude) -> None:
    joined = recorded_claude.at("unreadable-once+one-window")
    ask(joined, {"task": "score"})

    recorded_claude.forget_requests()

    assert ask(joined, {"task": "score"}).json()["stop_reason"] == "max_tokens"


def test_a_recorded_error_is_answered_with_its_status(recorded_claude: RecordedClaude) -> None:
    answer = ask(recorded_claude.at("rejected-key"), {"task": "score"})

    assert answer.status_code == 401
    assert answer.json() == {
        "type": "error",
        "error": {"type": "authentication_error", "message": "invalid x-api-key"},
    }


def test_a_declined_reply_carries_its_stop_reason(recorded_claude: RecordedClaude) -> None:
    answer = ask(recorded_claude.at("declined"), {"task": "score"})

    assert (answer.status_code, answer.json()["stop_reason"]) == (200, "refusal")


def test_under_slow_the_answer_comes_six_seconds_late(recorded_claude: RecordedClaude) -> None:
    asked_at = time.monotonic()

    answer = ask(recorded_claude.at("slow/one-window"), {"task": "score"})

    assert answer.status_code == 200
    assert SLOW_ANSWER_SECONDS <= time.monotonic() - asked_at < SLOW_TIMEOUT_SECONDS
    assert recorded_claude.list_requests()[0].scenario == "one-window"


def test_the_requests_are_kept_in_the_order_they_came_and_forgotten_when_asked(
    recorded_claude: RecordedClaude,
) -> None:
    ask(recorded_claude.at("one-window"), {"task": "score"})
    beta = {"anthropic-beta": "server-side-fallback-2026-07-01"}
    httpx2.post(
        f"{recorded_claude.at('unreadable')}/v1/messages?beta=true",
        json=describe_question({"task": "cut", "window": {"id": "w02"}}),
        headers=beta,
    )

    first, second = recorded_claude.list_requests()

    assert (first.scenario, first.path, first.beta, first.has_key) == (
        "one-window",
        "/v1/messages",
        None,
        True,
    )
    assert (second.scenario, second.path, second.beta, second.has_key) == (
        "unreadable",
        "/v1/messages?beta=true",
        "server-side-fallback-2026-07-01",
        False,
    )
    assert first.body["model"] == "claude-sonnet-5-5"
    assert second.read_task() == {"task": "cut", "window": {"id": "w02"}}
    recorded_claude.forget_requests()
    assert recorded_claude.list_requests() == []


def test_neither_an_answer_nor_a_kept_request_holds_the_key(
    recorded_claude: RecordedClaude,
) -> None:
    answers = [
        ask(recorded_claude.at(scenario), {"task": "score"})
        for scenario in ("one-window", "rejected-key", "no-such-scenario")
    ]

    kept = httpx2.get(f"{recorded_claude.address}/requests")

    assert len(kept.json()) == 3
    assert all(request["hasKey"] is True for request in kept.json())
    assert TEST_KEY not in kept.text
    assert all(TEST_KEY not in answer.text for answer in answers)
    assert all(TEST_KEY not in str(answer.headers) for answer in answers)
