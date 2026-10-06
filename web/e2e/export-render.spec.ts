import { statSync } from 'node:fs';

import type { Locator, Page } from '@playwright/test';

import {
  expect,
  followRisingBar,
  keepClips,
  openExport,
  readExportRows,
  readRenderActions,
  saveDownload,
  test,
  waitForDownloads,
} from './support';

const DESKTOP = { width: 1360, height: 900 };
const PHONE = { width: 390, height: 844 };
const IDLE = { isRenderOff: false, hasSpinner: false, hasCancel: false, order: ['project-more', 'render-kept'] };
const RENDERING = {
  render: 'Rendering…',
  isRenderOff: true,
  hasSpinner: true,
  hasCancel: true,
  order: ['project-more', 'cancel-render', 'render-kept'],
};
const SHORTEST_CLIP = 'c06';
const SHORTEST_TITLE = 'The smallest lesson is to write things down';
const SMALLEST_CLIP_BYTES = 100_000;
const EXPORTED_ROW = { status: 'Exported · 2 clips exported', ticks: 1 };

async function readExportedRow(place: Locator, projectId: string) {
  const status = place.locator(`[id="project-${projectId}"] .project-row__status--exported`);
  await expect(status).toBeVisible();
  return { status: (await status.innerText()).trim(), ticks: await status.locator('svg.icon').count() };
}

async function readExportedRowAtBothWidths(page: Page, projectId: string) {
  const inTheSidebar = await readExportedRow(page.locator('[id="sidebar"]'), projectId);
  await page.setViewportSize(PHONE);
  await page.goto('/');
  return { inTheSidebar, inTheLibrary: await readExportedRow(page.locator('main'), projectId) };
}

test.describe('at 1360 px', () => {
  test.use({ viewport: DESKTOP });

  test('Render reads Rendering… beside Cancel while the rows show their bars, and both clips end in Download MP4', async ({
    page,
    request,
    ownTalk,
  }) => {
    await keepClips(request, ownTalk.project.id, ['c01', 'c02']);
    await openExport(page, ownTalk.project.id);
    const before = await readRenderActions(page);

    await page.getByRole('button', { name: 'Render 2 Clips' }).click();
    await expect(page.getByRole('button', { name: 'Rendering…' })).toBeDisabled();
    const during = await readRenderActions(page);
    const [earlier, later] = await followRisingBar(page);
    await waitForDownloads(page, 2);
    await expect(page.getByRole('button', { name: 'Render 2 Clips' })).toBeEnabled();
    const actionsWhenDone = await readRenderActions(page);
    const rowsWhenDone = await readExportRows(page);
    const libraryRows = await readExportedRowAtBothWidths(page, ownTalk.project.id);

    expect(before).toEqual({ render: 'Render 2 Clips', ...IDLE });
    expect(during).toEqual(RENDERING);
    expect(earlier.map((row) => row.barLabel)).toEqual(['Rendering', 'Waiting']);
    expect(later[0].barValue).toBeGreaterThan(earlier[0].barValue ?? 0);
    expect(actionsWhenDone).toEqual({ render: 'Render 2 Clips', ...IDLE });
    expect(rowsWhenDone.map((row) => row.status)).toEqual(['Download MP4', 'Download MP4']);
    expect(libraryRows).toEqual({ inTheSidebar: EXPORTED_ROW, inTheLibrary: EXPORTED_ROW });
  });
});

test.describe('at 390 px', () => {
  test.use({ viewport: PHONE });

  test('the same actions are in the top bar, Render queues the clip, and Download MP4 saves the file', async ({
    page,
    request,
    ownTalk,
  }, testInfo) => {
    await keepClips(request, ownTalk.project.id, [SHORTEST_CLIP]);
    await openExport(page, ownTalk.project.id);
    const before = await readRenderActions(page);

    await page.getByRole('button', { name: 'Render 1 Clip' }).click();
    await expect(page.getByRole('button', { name: 'Rendering…' })).toBeDisabled();
    const during = await readRenderActions(page);
    await waitForDownloads(page, 1);
    const saved = await saveDownload(page, SHORTEST_CLIP, testInfo.outputDir);

    expect(before).toEqual({ render: 'Render 1 Clip', ...IDLE });
    expect(during).toEqual(RENDERING);
    expect(saved.name).toBe(`06 ${SHORTEST_TITLE}.mp4`);
    expect(statSync(saved.path).size).toBeGreaterThan(SMALLEST_CLIP_BYTES);
    expect(await readRenderActions(page)).toEqual({ render: 'Render 1 Clip', ...IDLE });
  });
});
