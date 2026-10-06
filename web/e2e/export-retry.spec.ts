import {
  expect,
  exportRows,
  keepClips,
  moveSourceAside,
  openExport,
  putNotesInPlaceOfSource,
  readExportRows,
  readRenderActions,
  test,
  waitForDownloads,
} from './support';

const DESKTOP = { width: 1360, height: 900 };
const SHORTEST_CLIP = 'c06';
const NOT_RENDERED = 'This clip could not be rendered. Retry to render it again.';
const SOURCE_GONE =
  'The source video was deleted to free space. Finished exports are still here. New clips cannot be rendered.';
const SOURCE_DELETED = 'The source video was deleted to free space. New clips cannot be rendered.';
const RENDER_TIMEOUT_MS = 60_000;

test.use({ viewport: DESKTOP });

test('a render that fails shows its reason with Retry, and Retry ends in Download MP4 once the source is back', async ({
  page,
  request,
  ownTalk,
  tool,
}) => {
  await keepClips(request, ownTalk.project.id, [SHORTEST_CLIP]);
  const putSourceBack = putNotesInPlaceOfSource({ dataDir: tool.settings.dataDir, projectId: ownTalk.project.id });
  const reason = exportRows(page).getByRole('alert');
  try {
    await openExport(page, ownTalk.project.id);
    await page.getByRole('button', { name: 'Render 1 Clip' }).click();
    await expect(reason).toHaveText(NOT_RENDERED, { timeout: RENDER_TIMEOUT_MS });
    const failed = await readExportRows(page);
    const actionsAfterTheFailure = await readRenderActions(page);

    putSourceBack();
    await page.getByRole('button', { name: 'Retry' }).click();
    await waitForDownloads(page, 1);

    expect(failed.map((row) => row.status)).toEqual([`${NOT_RENDERED} Retry`]);
    expect(actionsAfterTheFailure).toMatchObject({ render: 'Render 1 Clip', isRenderOff: false, hasCancel: false });
    await expect(reason).toHaveCount(0);
    expect((await readExportRows(page)).map((row) => row.status)).toEqual(['Download MP4']);
  } finally {
    putSourceBack();
  }
});

test('with the source moved aside, Render is refused in a toast and is switched off under the notice', async ({
  page,
  request,
  readyTalk,
  tool,
}) => {
  await keepClips(request, readyTalk.project.id, ['c01']);
  await openExport(page, readyTalk.project.id);
  const putSourceBack = moveSourceAside({ dataDir: tool.settings.dataDir, projectId: readyTalk.project.id });
  try {
    await page.getByRole('button', { name: 'Render 1 Clip' }).click();
    await expect(page.getByRole('status')).toHaveText(SOURCE_DELETED);
    const rowsAfterTheRefusal = await readExportRows(page);

    await page.reload();
    await expect(page.locator('.flag[role="note"] .flag__message')).toHaveText(SOURCE_GONE);

    expect(rowsAfterTheRefusal.map((row) => row.status)).toEqual(['Not rendered']);
    expect(await readRenderActions(page)).toMatchObject({ render: 'Render 1 Clip', isRenderOff: true, hasCancel: false });
    expect((await readExportRows(page)).map((row) => row.status)).toEqual(['Not rendered']);
  } finally {
    putSourceBack();
  }
});
