import { createServer } from 'node:http';
import { resolve } from 'node:path';
import process from 'node:process';
import { text } from 'node:stream/consumers';
import { setTimeout as delay } from 'node:timers/promises';

import { openRecordedReplies } from './recorded-replies.mjs';
import { describeMessage, listStreamEvents } from './shape-claude-answer.mjs';

const LOOPBACK = '127.0.0.1';
const MESSAGES_ROUTE = /^(\/slow)?\/([^/]+)\/v1\/messages$/;
const KEPT_REQUESTS_PATH = '/requests';
const SLOW_ANSWER_MS = 6000;
const NO_FITTING_REPLY = describeProblem('not_found_error', 'No recorded reply fits this request.');
const NOT_A_QUESTION = describeProblem('invalid_request_error', 'The request body is not a JSON object.');
const EXIT_USAGE = 2;

const replies = openRecordedReplies(resolve(process.argv[2] ?? explainUsage()));
const keptRequests = [];

const server = createServer((request, response) => {
  answer(request, response).catch((failure) => sendJson(response, 500, describeProblem('api_error', failure.message)));
});
server.listen(0, LOOPBACK, () => {
  process.stdout.write(`Recorded replies are served at http://${LOOPBACK}:${server.address().port}\n`);
});

function explainUsage() {
  process.stderr.write('Name the folder of scenarios: node scripts/serve-recorded-claude.mjs <folder>\n');
  process.exit(EXIT_USAGE);
}

async function answer(request, response) {
  const address = new URL(request.url, `http://${LOOPBACK}`);
  if (address.pathname === KEPT_REQUESTS_PATH) return answerAboutKeptRequests(request, response);
  const route = MESSAGES_ROUTE.exec(address.pathname);
  if (!route || request.method !== 'POST') return sendJson(response, 404, NO_FITTING_REPLY);
  const question = { isSlow: route[1] !== undefined, scenario: route[2], path: `/v1/messages${address.search}` };
  return answerQuestion(request, response, question);
}

function answerAboutKeptRequests(request, response) {
  if (request.method !== 'DELETE') return sendJson(response, 200, keptRequests);
  keptRequests.length = 0;
  replies.forgetUses();
  return response.writeHead(204).end();
}

async function answerQuestion(request, response, question) {
  const body = readJsonObject(await text(request));
  if (body === null) return sendJson(response, 400, NOT_A_QUESTION);
  keptRequests.push({
    scenario: question.scenario,
    path: question.path,
    beta: request.headers['anthropic-beta'] ?? null,
    body,
    hasKey: Boolean(request.headers['x-api-key']),
  });
  const recorded = replies.take(question.scenario.split('+'), readTask(body));
  if (question.isSlow) await delay(SLOW_ANSWER_MS);
  if (response.destroyed) return undefined;
  if (recorded === null) return sendJson(response, 404, NO_FITTING_REPLY);
  if (recorded.status !== undefined) return sendJson(response, recorded.status, recorded.reply);
  const message = describeMessage(recorded.reply, body.model);
  return body.stream ? sendEvents(response, listStreamEvents(message)) : sendJson(response, 200, message);
}

function readTask(body) {
  const lastPart = body.messages?.at(0)?.content?.at?.(-1);
  return readJsonObject(lastPart?.text ?? '');
}

function readJsonObject(written) {
  try {
    const read = JSON.parse(written);
    return typeof read === 'object' && read !== null ? read : null;
  } catch {
    return null;
  }
}

function describeProblem(type, message) {
  return { type: 'error', error: { type, message } };
}

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json' }).end(JSON.stringify(body));
}

function sendEvents(response, events) {
  response.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' });
  for (const event of events) response.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
  response.end();
}
