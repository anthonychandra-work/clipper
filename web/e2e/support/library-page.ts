import type { Locator, Page } from '@playwright/test';

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

export function newProjectSheet(page: Page): Locator {
  return page.locator('dialog#sheet[open]');
}
