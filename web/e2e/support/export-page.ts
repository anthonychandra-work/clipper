import { join } from 'node:path';

import { expect, type Locator, type Page } from '@playwright/test';

const RENDER_TIMEOUT_MS = 60_000;

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

export interface RenderActionsText {
  render: string;
  isRenderOff: boolean;
  hasSpinner: boolean;
  hasCancel: boolean;
  order: string[];
}

export interface TextRowText {
  label: string;
  text: string;
  copyId: string;
  copyName: string | null;
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

export function readTextRows(page: Page, clipPlace: number): Promise<TextRowText[]> {
  const textRows = exportRows(page).nth(clipPlace).locator('.copy-row');
  return textRows.evaluateAll((rows) =>
    rows.map((row) => {
      const copy = row.querySelector('button');
      return {
        label: (row.querySelector('dt')?.textContent ?? '').trim(),
        text: (row.querySelector<HTMLElement>('.copy-row__text')?.innerText ?? '').trim(),
        copyId: copy?.id ?? '',
        copyName: copy?.getAttribute('aria-label') ?? null,
      };
    }),
  );
}

export async function readRenderActions(page: Page): Promise<RenderActionsText> {
  const trailing = page.locator('header.toolbar .toolbar__trailing');
  const render = trailing.getByRole('button', { name: /^Render/ });
  return {
    render: (await render.innerText()).trim(),
    isRenderOff: await render.isDisabled(),
    hasSpinner: (await render.locator('.spinner').count()) > 0,
    hasCancel: (await trailing.getByRole('button', { name: 'Cancel' }).count()) > 0,
    order: await trailing.locator('> button').evaluateAll((controls) => controls.map((control) => control.id)),
  };
}

export async function followRisingBar(page: Page): Promise<ExportRowText[][]> {
  await expect.poll(async () => (await readExportRows(page))[0].barLabel).toBe('Rendering');
  const earlier = await readExportRows(page);
  await expect
    .poll(async () => (await readExportRows(page))[0].barValue, { timeout: RENDER_TIMEOUT_MS })
    .toBeGreaterThan(earlier[0].barValue ?? 0);
  return [earlier, await readExportRows(page)];
}

export async function waitForDownloads(page: Page, count: number): Promise<void> {
  await expect(exportRows(page).locator('a[download]')).toHaveCount(count, { timeout: RENDER_TIMEOUT_MS });
}

export async function saveDownload(page: Page, clipId: string, folder: string): Promise<SavedDownload> {
  const started = page.waitForEvent('download');
  await page.locator(`a[id="download-${clipId}"]`).click();
  const download = await started;
  const path = join(folder, download.suggestedFilename());
  await download.saveAs(path);
  return { name: download.suggestedFilename(), path };
}
