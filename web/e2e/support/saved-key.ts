import type { APIRequestContext } from '@playwright/test';

const KEY_ADDRESS = '/api/settings/api-key';

export const TEST_KEY = 'sk-ant-test-4f2a';

export async function saveTestKey(request: APIRequestContext): Promise<void> {
  const answer = await request.put(KEY_ADDRESS, { data: { apiKey: TEST_KEY } });
  if (!answer.ok()) throw new Error(`The test key was not saved: ${answer.status()} ${await answer.text()}`);
}

export async function removeSavedKey(request: APIRequestContext): Promise<void> {
  const answer = await request.delete(KEY_ADDRESS);
  if (!answer.ok()) throw new Error(`The saved key was not removed: ${answer.status()} ${await answer.text()}`);
}
