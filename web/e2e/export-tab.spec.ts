import { readdirSync, renameSync, statSync } from 'node:fs';
import { join } from 'node:path';

import type { APIRequestContext, Page } from '@playwright/test';

import type { ProjectExport } from '@/export';

import {
  changeLook,
  expect,
  type ExportRowText,
  exportRows,
  keepClips,
  openExport,
  openPreview,
  probeSavedFile,
  readExportRows,
  readOutput,
  saveDownload,
  startRenders,
  test,
} from './support';

const DESKTOP = { width: 1360, height: 900 };
const EXPORT_ADDRESS = '**/api/projects/*/export';
const STARTING_LOOK = 'Keyword captions, speaker framing, hook title on';
const FORMAT = '1080 × 1920, 30 fps, H.264 MP4';
const SOURCE_GONE =
  'The source video was deleted to free space. Finished exports are still here. New clips cannot be rendered.';
const TWO_LONGEST_CLIPS = ['c03', 'c04'];
const LONGEST_TITLE = 'Almost everyone gets price wrong';
const RENDER_TIMEOUT_MS = 60_000;
const NOT_RENDERED = { status: 'Not rendered', barLabel: null, barValue: null, download: null };

function describeRows(shown: ProjectExport): ExportRowText[] {
  return shown.clips.map((clip) => {
    const { state, percent } = clip.render;
    const isQueued = state === 'waiting' || state === 'rendering';
    const label = state === 'waiting' ? 'Waiting' : 'Rendering';
    const resting = state === 'done' ? 'Download MP4' : 'Not rendered';
    return {
      title: clip.title,
      file: `${clip.file} · ${clip.seconds.toFixed(1)} s`,
      status: isQueued ? label : resting,
      barLabel: isQueued ? label : null,
      barValue: isQueued ? Math.round(percent) : null,
      download: state === 'done' ? clip.download : null,
    };
  });
}

async function keepAnswersOfTheExport(page: Page): Promise<ProjectExport[]> {
  const received: ProjectExport[] = [];
  await page.route(EXPORT_ADDRESS, async (route) => {
    const response = await route.fetch();
    received.push(await response.json());
    await route.fulfill({ response });
  });
  return received;
}

async function readRisingBar(page: Page): Promise<ExportRowText[][]> {
  await expect.poll(async () => (await readExportRows(page))[0].barLabel).toBe('Rendering');
  const earlier = await readExportRows(page);
  await expect
    .poll(async () => (await readExportRows(page))[0].barValue, { timeout: RENDER_TIMEOUT_MS })
    .toBeGreaterThan(earlier[0].barValue ?? 0);
  return [earlier, await readExportRows(page)];
}

function moveSourceAside(dataDir: string, projectId: string): () => void {
  const projectDir = join(dataDir, 'projects', projectId);
  const source = readdirSync(projectDir).find((name) => name.startsWith('source.'));
  if (source === undefined) throw new Error(`The project has no source in ${projectDir}.`);
  renameSync(join(projectDir, source), join(projectDir, `aside-${source}`));
  return () => renameSync(join(projectDir, `aside-${source}`), join(projectDir, source));
}

async function readAnswerOfTheFile(request: APIRequestContext, address: string | null) {
  const answer = await request.get(address ?? '');
  const headers = answer.headers();
  return { status: answer.status(), type: headers['content-type'], disposition: headers['content-disposition'] };
}

test.use({ viewport: DESKTOP });

test('a talk with no kept clip shows No Kept Clips, and Go to Review leads to the Review tab', async ({
  page,
  readyTalk,
}) => {
  await openExport(page, readyTalk.project.id);
  const emptyTitle = await page.locator('.empty .empty__title').innerText();

  await page.getByRole('link', { name: 'Go to Review' }).click();

  expect(emptyTitle).toBe('No Kept Clips');
  await expect(page).toHaveURL(new RegExp(`/projects/${readyTalk.project.id}/review$`));
  await expect(page.locator('#tab-review')).toHaveAttribute('aria-current', 'page');
});

test('with two clips kept, the tab shows the look, the format and a group for each clip in the order of the ranks', async ({
  page,
  request,
  readyTalk,
}) => {
  await keepClips(request, readyTalk.project.id, ['c02', 'c01']);

  await openExport(page, readyTalk.project.id);

  expect(await readOutput(page)).toEqual({
    look: STARTING_LOOK,
    format: FORMAT,
    footer: 'Change the look on the Review tab.',
  });
  expect(await readExportRows(page)).toEqual([
    { title: 'The worst day my bakery ever had', file: 'exports/01-c01.mp4 · 32.8 s', ...NOT_RENDERED },
    { title: 'Hire for the habits you cannot teach', file: 'exports/02-c02.mp4 · 33.2 s', ...NOT_RENDERED },
  ]);
  await expect(page.locator('#tab-export .segmented__count')).toHaveText('2');
  await expect(page.locator('.empty')).toHaveCount(0);
});

test('after the look is changed on the Review tab, the sentence of the look follows', async ({
  page,
  request,
  readyTalk,
}) => {
  const projectId = readyTalk.project.id;
  await keepClips(request, projectId, ['c01']);
  await openExport(page, projectId);
  const before = (await readOutput(page)).look;

  await openPreview(page, `/projects/${projectId}/review/c01`);
  await changeLook(page, 'captions-plain');
  await changeLook(page, 'framing-whole-frame');
  await changeLook(page, 'look-showHookTitle');
  await page.locator('#tab-export').click();

  expect(before).toBe(STARTING_LOOK);
  await expect(page.locator('.export-list')).toBeVisible();
  expect((await readOutput(page)).look).toBe('Plain captions, full frame framing, hook title off');
});

test('two queued clips read Rendering and Waiting, keep their state over a reload and end in Download MP4', async ({
  page,
  request,
  ownTalk,
}) => {
  const projectId = ownTalk.project.id;
  await keepClips(request, projectId, TWO_LONGEST_CLIPS);
  await startRenders(request, projectId);
  await openExport(page, projectId);

  const [earlier, later] = await readRisingBar(page);
  const received = await keepAnswersOfTheExport(page);
  await page.reload();
  await expect(exportRows(page)).toHaveCount(2);
  const afterReload = await readExportRows(page);
  await expect(exportRows(page).locator('a[download]')).toHaveCount(2, { timeout: RENDER_TIMEOUT_MS });

  expect(earlier.map((row) => row.status)).toEqual(['Rendering', 'Waiting']);
  expect(earlier.map((row) => row.barLabel)).toEqual(['Rendering', 'Waiting']);
  expect(later[0].barValue).toBeGreaterThan(earlier[0].barValue ?? 0);
  expect(received.map(describeRows)).toContainEqual(afterReload);
  expect(afterReload[0].barValue ?? 100).toBeGreaterThanOrEqual(later[0].barValue ?? 0);
  expect((await readExportRows(page)).map((row) => row.status)).toEqual(['Download MP4', 'Download MP4']);
});

test('the download of a finished clip is an MP4 attachment named after the clip, also once the source is gone', async ({
  page,
  request,
  ownTalk,
  tool,
}, testInfo) => {
  const projectId = ownTalk.project.id;
  await keepClips(request, projectId, TWO_LONGEST_CLIPS);
  await startRenders(request, projectId);
  await openExport(page, projectId);
  await expect(exportRows(page).locator('a[download]')).toHaveCount(2, { timeout: RENDER_TIMEOUT_MS });
  const [row] = await readExportRows(page);

  const saved = await saveDownload(page, 'c03', testInfo.outputDir);
  const answer = await readAnswerOfTheFile(request, row.download);
  const probed = probeSavedFile(saved.path);
  const putSourceBack = moveSourceAside(tool.settings.dataDir, projectId);
  try {
    await page.reload();
    await expect(page.locator('.flag[role="note"] .flag__message')).toHaveText(SOURCE_GONE);
    const savedAgain = await saveDownload(page, 'c03', join(testInfo.outputDir, 'without-source'));
    expect(statSync(savedAgain.path).size).toBe(statSync(saved.path).size);
  } finally {
    putSourceBack();
  }

  expect(saved.name).toBe(`03 ${LONGEST_TITLE}.mp4`);
  await expect(page.locator('#download-c03')).toHaveAccessibleName(`Download MP4 of ${LONGEST_TITLE}`);
  expect(answer).toEqual({ status: 200, type: 'video/mp4', disposition: expect.stringMatching(/^attachment; filename/) });
  expect(probed).toMatchObject({ picture: 'h264 1080 x 1920 at 30/1', sound: 'aac', isMp4: true });
  expect(row.file).toBe('exports/03-c03.mp4 · 41.3 s');
  expect(Math.abs(probed.seconds - 41.3)).toBeLessThanOrEqual(0.1);
});
