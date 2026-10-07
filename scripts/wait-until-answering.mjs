import { setTimeout as delay } from 'node:timers/promises';

const POLL_MS = 200;
const START_TIMEOUT_MS = 120_000;

export async function waitUntilAnswering(address) {
  const deadline = Date.now() + START_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (await isAnswering(address)) return;
    await delay(POLL_MS);
  }
  throw new Error(`Nothing answered at ${address} within ${START_TIMEOUT_MS / 1000} seconds.`);
}

async function isAnswering(address) {
  try {
    const response = await fetch(address);
    return response.ok;
  } catch {
    return false;
  }
}
