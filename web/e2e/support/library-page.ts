import { setTimeout as delay } from 'node:timers/promises';

import type { Locator, Page } from '@playwright/test';

const BAR_SAMPLE_MS = 150;
const BAR_TIMEOUT_MS = 90_000;

export interface RowText {
  title: string;
  meta: string;
  status: string;
  barLabel: string | null;
}

export function projectRow(page: Page, projectId: string): Locator {
  return page.locator(`#project-${projectId}`);
}

export async function readRow(page: Page, projectId: string): Promise<RowText> {
  const row = projectRow(page, projectId);
  const bar = row.getByRole('progressbar');
  return {
    title: await row.locator('.project-row__title').innerText(),
    meta: await row.locator('.project-row__meta').innerText(),
    status: (await row.locator('.project-row__status').innerText()).trim(),
    barLabel: (await bar.count()) > 0 ? await bar.getAttribute('aria-label') : null,
  };
}

export async function followBarUntil(page: Page, projectId: string, status: string): Promise<number[]> {
  const row = projectRow(page, projectId);
  const values: number[] = [];
  const deadline = Date.now() + BAR_TIMEOUT_MS;
  while ((await row.locator('.project-row__status').innerText()).trim() !== status) {
    if (Date.now() > deadline) throw new Error(`The row did not reach "${status}". Bar values: ${values}`);
    const shown = await row.getByRole('progressbar').getAttribute('aria-valuenow', { timeout: 500 }).catch(() => null);
    if (shown !== null) values.push(Number(shown));
    await delay(BAR_SAMPLE_MS);
  }
  return values;
}

export function newProjectSheet(page: Page): Locator {
  return page.locator('dialog#sheet[open]');
}
