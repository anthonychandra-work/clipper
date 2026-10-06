import { statSync } from 'node:fs';

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

    expect(before).toEqual({ render: 'Render 2 Clips', ...IDLE });
    expect(during).toEqual(RENDERING);
    expect(earlier.map((row) => row.barLabel)).toEqual(['Rendering', 'Waiting']);
    expect(later[0].barValue).toBeGreaterThan(earlier[0].barValue ?? 0);
    expect(await readRenderActions(page)).toEqual({ render: 'Render 2 Clips', ...IDLE });
    expect((await readExportRows(page)).map((row) => row.status)).toEqual(['Download MP4', 'Download MP4']);
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
