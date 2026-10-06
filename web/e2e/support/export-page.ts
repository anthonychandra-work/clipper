import { join } from 'node:path';

import { expect, type Locator, type Page } from '@playwright/test';

export interface ExportRowText {
  title: string;
  file: string;
  status: string;
  barLabel: string | null;
  barValue: number | null;
  download: string | null;
}

export interface OutputText {
  look: string;
  format: string;
  footer: string;
}

export interface SavedDownload {
  name: string;
  path: string;
}

export async function openExport(page: Page, projectId: string): Promise<void> {
  await page.goto(`/projects/${projectId}/export`);
  await expect(page.locator('#tab-export')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.export-list, .empty').first()).toBeVisible();
}

export function exportRows(page: Page): Locator {
  return page.locator('.export-list > li');
}

export function readExportRows(page: Page): Promise<ExportRowText[]> {
  return exportRows(page).evaluateAll((rows) =>
    rows.map((row) => {
      const read = (part: string) => (row.querySelector<HTMLElement>(part)?.innerText ?? '').trim();
      const bar = row.querySelector('[role="progressbar"]');
      return {
        title: read('.export-clip__title'),
        file: read('.export-clip__path'),
        status: read('.export-clip__status').replace(/\s+/g, ' '),
        barLabel: bar?.getAttribute('aria-label') ?? null,
        barValue: bar === null ? null : Number(bar.getAttribute('aria-valuenow')),
        download: row.querySelector('a[download]')?.getAttribute('href') ?? null,
      };
    }),
  );
}

export async function readOutput(page: Page): Promise<OutputText> {
  const output = page.locator('.group-section', { has: page.getByRole('heading', { name: 'Output' }) });
  const [look, format] = await output.locator('.row__value').allInnerTexts();
  return { look, format, footer: await output.locator('.list-footer').innerText() };
}

export async function saveDownload(page: Page, clipId: string, folder: string): Promise<SavedDownload> {
  const started = page.waitForEvent('download');
  await page.locator(`#download-${clipId}`).click();
  const download = await started;
  const path = join(folder, download.suggestedFilename());
  await download.saveAs(path);
  return { name: download.suggestedFilename(), path };
}
