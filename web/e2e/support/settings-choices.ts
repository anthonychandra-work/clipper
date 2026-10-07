import type { APIRequestContext, Page } from '@playwright/test';

export const DEFAULT_CHOICES = {
  scoringModel: 'claude-sonnet-5-5',
  cuttingModel: 'claude-opus-5-5',
  whisperModel: 'large-v3-turbo',
  defaultLength: 'standard',
  clipsPerVideo: 'auto',
  sourceRetention: '7',
};

export type Choices = Partial<typeof DEFAULT_CHOICES>;

export async function saveChoices(request: APIRequestContext, choices: Choices): Promise<void> {
  const answer = await request.patch('/api/settings', { data: choices });
  if (!answer.ok()) throw new Error(`The choices were not saved: ${answer.status()} ${await answer.text()}`);
}

export function chooseTheDefaults(request: APIRequestContext): Promise<void> {
  return saveChoices(request, DEFAULT_CHOICES);
}

export async function chooseInSettings(page: Page, row: string, label: string): Promise<void> {
  await page.goto('/settings');
  const stored = page.waitForResponse((answer) => answer.request().method() === 'PATCH' && answer.ok());
  await page.getByLabel(row).selectOption({ label });
  await stored;
}
