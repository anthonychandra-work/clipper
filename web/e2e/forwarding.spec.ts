import { get } from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';

import { expect, test } from './support';

const LOOPBACK = '127.0.0.1';
const HEALTHY = '200 {"status":"ok"}';
const REQUESTS_IN_A_ROUND = 40;
const PAUSES_MS = [4960, 4965, 4970, 4975, 4980, 4985, 4990, 4995];

interface Answer {
  summary: string;
  connection: string | undefined;
}

// A browser asks for a connection that stays open, and each request here takes a connection of its own.
function askAsBrowser(address: string): Promise<Answer> {
  return new Promise((settle) => {
    const sent = get(address, { agent: false, headers: { Connection: 'keep-alive' } }, (answer) => {
      const parts: Buffer[] = [];
      answer.on('data', (part: Buffer) => parts.push(part));
      answer.on('end', () => {
        const summary = `${answer.statusCode} ${Buffer.concat(parts).toString()}`;
        settle({ summary, connection: answer.headers.connection });
      });
    });
    sent.on('error', (error) => settle({ summary: `no answer, ${error.message}`, connection: undefined }));
  });
}

function askTogether(address: string): Promise<Answer[]> {
  return Promise.all(Array.from({ length: REQUESTS_IN_A_ROUND }, () => askAsBrowser(address)));
}

async function askAfterEachPause(address: string): Promise<string[]> {
  const answers: string[] = [];
  for (const pauseMs of PAUSES_MS) {
    await delay(pauseMs);
    const round = await askTogether(address);
    answers.push(...round.map((answer) => `after ${pauseMs} ms without a request: ${answer.summary}`));
  }
  return answers;
}

function healthAt(port: number): string {
  return `http://${LOOPBACK}:${port}/api/health`;
}

test('the answer to the health address carries Connection: close at the service port and through the web port', async ({
  tool,
}) => {
  const atServicePort = await askAsBrowser(healthAt(tool.settings.servicePort));
  const throughWebPort = await askAsBrowser(healthAt(tool.settings.webPort));

  expect(atServicePort).toEqual({ summary: HEALTHY, connection: 'close' });
  expect(throughWebPort).toEqual({ summary: HEALTHY, connection: 'close' });
});

test('320 requests forwarded in eight rounds of 40, after pauses of 4,960 to 4,995 ms without a request, are each answered 200 with the health', async ({
  tool,
}) => {
  const address = healthAt(tool.settings.webPort);
  // A web app that kept its connections to the service open would hold none before the first pause without this round.
  await askTogether(address);

  const answers = await askAfterEachPause(address);

  expect(answers).toHaveLength(PAUSES_MS.length * REQUESTS_IN_A_ROUND);
  expect(answers.filter((answer) => !answer.endsWith(HEALTHY))).toEqual([]);
});
