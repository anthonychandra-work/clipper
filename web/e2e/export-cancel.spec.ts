import {
  expect,
  keepClips,
  listExportFiles,
  listRenderWorkFolders,
  openExport,
  readExportRows,
  readRenderActions,
  test,
} from './support';

const DESKTOP = { width: 1360, height: 900 };
const THREE_CLIPS = ['c01', 'c02', 'c03'];
const RENDER_TIMEOUT_MS = 60_000;

test.use({ viewport: DESKTOP });

test('Cancel during the second clip leaves the first clip’s file and download, and the two others not rendered', async ({
  page,
  request,
  ownTalk,
  tool,
}) => {
  const folder = { dataDir: tool.settings.dataDir, projectId: ownTalk.project.id };
  await keepClips(request, ownTalk.project.id, THREE_CLIPS);
  await openExport(page, ownTalk.project.id);
  await page.getByRole('button', { name: 'Render 3 Clips' }).click();
  await expect
    .poll(async () => (await readExportRows(page)).map((row) => row.status), { timeout: RENDER_TIMEOUT_MS })
    .toEqual(['Download MP4', 'Rendering', 'Waiting']);

  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('button', { name: 'Render 3 Clips' })).toBeEnabled();

  const rows = await readExportRows(page);
  expect(rows.map((row) => row.status)).toEqual(['Download MP4', 'Not rendered', 'Not rendered']);
  expect(rows.map((row) => row.download !== null)).toEqual([true, false, false]);
  expect(listExportFiles(folder)).toEqual(['01-c01.mp4']);
  expect(listRenderWorkFolders(folder)).toEqual([]);
  expect((await readRenderActions(page)).hasCancel).toBe(false);
});
