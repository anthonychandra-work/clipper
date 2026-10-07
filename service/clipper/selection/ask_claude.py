import asyncio
import threading
from collections.abc import Callable
from dataclasses import dataclass
from http import HTTPStatus
from typing import Literal

import anthropic
from anthropic.types import TextBlockParam
from pydantic import BaseModel, ValidationError

from ..settings import ClaudeModel
from .claude_errors import (
    AskStoppedError,
    BusyServiceError,
    ClaudeRequestError,
    DeclinedReplyError,
    NoAnswerError,
    RefusedKeyError,
    UnreadableReplyError,
)
from .model_traits import FALLBACK_BETA, describe_model

type Effort = Literal["medium", "high"]

MAX_TOKENS = 32_000
MAX_REQUESTS = 3
STOP_POLL_SECONDS = 0.05
DECLINED = "refusal"
CUT_OFF_AT_THE_TOKEN_LIMIT = "max_tokens"


@dataclass(frozen=True)
class ClaudeAccess:
    key: str
    address: str


@dataclass(frozen=True)
class ClaudeQuestion[ReplyT: BaseModel]:
    model: ClaudeModel
    effort: Effort
    system: str
    transcript_part: str
    task: str
    reply_model: type[ReplyT]
    accepts: Callable[[ReplyT], bool] | None = None


def ask_claude[ReplyT: BaseModel](
    question: ClaudeQuestion[ReplyT], access: ClaudeAccess, stop: threading.Event
) -> ReplyT:
    return asyncio.run(answer_unless_stopped(question, access, stop))


async def answer_unless_stopped[ReplyT: BaseModel](
    question: ClaudeQuestion[ReplyT], access: ClaudeAccess, stop: threading.Event
) -> ReplyT:
    asking = asyncio.create_task(ask_until_readable(question, access))
    while not asking.done():
        if stop.is_set():
            asking.cancel()
            await asyncio.wait([asking])
            raise AskStoppedError()
        await asyncio.wait([asking], timeout=STOP_POLL_SECONDS)
    return asking.result()


async def ask_until_readable[ReplyT: BaseModel](
    question: ClaudeQuestion[ReplyT], access: ClaudeAccess
) -> ReplyT:
    async with anthropic.AsyncAnthropic(api_key=access.key, base_url=access.address) as client:
        for _ in range(MAX_REQUESTS):
            reply = await find_readable_reply(client, question)
            if reply is not None:
                return reply
    raise UnreadableReplyError(MAX_REQUESTS)


async def find_readable_reply[ReplyT: BaseModel](
    client: anthropic.AsyncAnthropic, question: ClaudeQuestion[ReplyT]
) -> ReplyT | None:
    try:
        stop_reason, reply = await send_request(client, question)
    except ValidationError:
        return None
    if stop_reason == DECLINED:
        raise DeclinedReplyError()
    if stop_reason == CUT_OFF_AT_THE_TOKEN_LIMIT or reply is None:
        return None
    return reply if question.accepts is None or question.accepts(reply) else None


async def send_request[ReplyT: BaseModel](
    client: anthropic.AsyncAnthropic, question: ClaudeQuestion[ReplyT]
) -> tuple[str | None, ReplyT | None]:
    try:
        if describe_model(question.model).takes_fallback:
            return await stream_with_fallback(client, question)
        return await stream_without_fallback(client, question)
    except (anthropic.AuthenticationError, anthropic.PermissionDeniedError) as refused:
        raise RefusedKeyError() from refused
    except anthropic.APIConnectionError as unreachable:
        raise NoAnswerError() from unreachable
    except anthropic.RateLimitError as limited:
        raise BusyServiceError() from limited
    except anthropic.APIStatusError as answered:
        if answered.status_code >= HTTPStatus.INTERNAL_SERVER_ERROR:
            raise BusyServiceError() from answered
        raise ClaudeRequestError() from answered
    except anthropic.APIError as failure:
        raise ClaudeRequestError() from failure


async def stream_with_fallback[ReplyT: BaseModel](
    client: anthropic.AsyncAnthropic, question: ClaudeQuestion[ReplyT]
) -> tuple[str | None, ReplyT | None]:
    takes_effort = describe_model(question.model).takes_effort
    async with client.beta.messages.stream(
        model=question.model.value,
        max_tokens=MAX_TOKENS,
        system=question.system,
        messages=[{"role": "user", "content": describe_parts(question)}],
        output_format=question.reply_model,
        output_config={"effort": question.effort} if takes_effort else anthropic.omit,
        fallbacks="default",
        betas=[FALLBACK_BETA],
    ) as stream:
        message = await stream.get_final_message()
    return message.stop_reason, message.parsed_output


async def stream_without_fallback[ReplyT: BaseModel](
    client: anthropic.AsyncAnthropic, question: ClaudeQuestion[ReplyT]
) -> tuple[str | None, ReplyT | None]:
    takes_effort = describe_model(question.model).takes_effort
    async with client.messages.stream(
        model=question.model.value,
        max_tokens=MAX_TOKENS,
        system=question.system,
        messages=[{"role": "user", "content": describe_parts(question)}],
        output_format=question.reply_model,
        output_config={"effort": question.effort} if takes_effort else anthropic.omit,
    ) as stream:
        message = await stream.get_final_message()
    return message.stop_reason, message.parsed_output


def describe_parts[ReplyT: BaseModel](question: ClaudeQuestion[ReplyT]) -> list[TextBlockParam]:
    return [
        {"type": "text", "text": question.transcript_part, "cache_control": {"type": "ephemeral"}},
        {"type": "text", "text": question.task},
    ]
