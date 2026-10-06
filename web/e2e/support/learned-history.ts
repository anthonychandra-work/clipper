import type { APIRequestContext, APIResponse } from '@playwright/test';

import type { Settings } from '@/settings';

export async function readSettings(request: APIRequestContext): Promise<Settings> {
  return readAnswer(await request.get('/api/settings'));
}

export async function forgetHistory(request: APIRequestContext): Promise<Settings> {
  return readAnswer(await request.delete('/api/settings/history'));
}

async function readAnswer(answer: APIResponse): Promise<Settings> {
  if (!answer.ok()) throw new Error(`The settings were not given: ${answer.status()} ${await answer.text()}`);
  return answer.json();
}
