import { statSync } from 'node:fs';

import type { APIRequestContext, Page } from '@playwright/test';

import {
  candidateRow,
  expect,
  exportClips,
  isSourceOrPreview,
  measureProjectFiles,
  openExport,
  openResults,
  openReview,
  projectRow,
  readExport,
  readRenderActions,
  readReview,
  readViewsRows,
  saveDownload,
  test,
  type ToolRun,
} from './support';

const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1360, height: 900 };
const RETENTION_TIMEOUT_MS = 240_000;
const FIRST_TITLE = 'The worst day my bakery ever had';
const EXPORT_OF_THE_FIRST_CLIP = 'exports/01-c01.mp4';
const NO_PREVIEW = 'Preview unavailable. The source video was deleted to free space.';
const NO_SOURCE =
  'The source video was deleted to free space. Finished exports are still here. New clips cannot be rendered.';

async function startWithTheClockAhead(tool: ToolRun, days: number): Promise<void> {
  await tool.stop();
  await tool.start({ CLIPPER_CLOCK_AHEAD_DAYS: String(days) });
}

async function readCopies(request: APIRequestContext, projectId: string): Promise<boolean[]> {
  const review = await readReview(request, projectId);
  const shown = await readExport(request, projectId);
  return [shown.hasSource, review.hasPreview];
}

function listKeptFiles(measured: Record<string, number>): Record<string, number> {
  return Object.fromEntries(Object.entries(measured).filter(([name]) => !isSourceOrPreview(name)));
}

async function chooseRetention(page: Page, label: string): Promise<void> {
  await page.goto('/settings');
  const stored = page.waitForResponse((answer) => answer.request().method() === 'PATCH' && answer.ok());
  await page.getByLabel('Delete Source Videos After').selectOption({ label });
  await stored;
}

async function expectTheReviewWithoutItsPreview(page: Page, projectId: string): Promise<void> {
  await page.goto(`/projects/${projectId}/review/c01`);
  await expect(page.locator('.preview--gone')).toHaveText(NO_PREVIEW);
  await expect(page.locator('#preview-video')).toHaveCount(0);
  await expect(page.locator('.candidate__open')).toHaveCount(6);
}

async function expectTheExportWithoutItsSource(page: Page, projectId: string): Promise<void> {
  await openExport(page, projectId);
  await expect(page.locator('.flag[role="note"] .flag__message')).toHaveText(NO_SOURCE);
  expect(await readRenderActions(page)).toMatchObject({ isRenderOff: true, hasCancel: false });
}

test.setTimeout(RETENTION_TIMEOUT_MS);

test.afterEach(async ({ tool, request }) => {
  await tool.stop();
  await tool.start();
  await request.patch('/api/settings', { data: { sourceRetention: '7' } });
});

test.describe('at 1360 px', () => {
  test.use({ viewport: DESKTOP });

  test('a talk with a clip exported keeps its source and its preview copy when the tool is started six days later by its clock', async ({
    request,
    ownTalk,
    tool,
  }) => {
    const folder = { dataDir: tool.settings.dataDir, projectId: ownTalk.project.id };
    await exportClips(request, ownTalk.project.id, ['c01']);
    const before = measureProjectFiles(folder);

    await startWithTheClockAhead(tool, 6);

    expect(Object.keys(before).filter(isSourceOrPreview)).toEqual(['preview.mp4', 'source.mp4']);
    expect(measureProjectFiles(folder)).toEqual(before);
    expect(await readCopies(request, ownTalk.project.id)).toEqual([true, true]);
  });

  test('started eight days later the talk has lost its source and its preview copy and nothing else, and its Review, Export and Results tabs still open', async ({
    page,
    request,
    ownTalk,
    tool,
  }, testInfo) => {
    const projectId = ownTalk.project.id;
    const folder = { dataDir: tool.settings.dataDir, projectId };
    await exportClips(request, projectId, ['c01']);
    const before = measureProjectFiles(folder);

    await startWithTheClockAhead(tool, 8);
    const after = measureProjectFiles(folder);
    await page.goto('/');
    await expect(projectRow(page, projectId).locator('.project-row__status')).toHaveText('Exported · 1 clip exported');
    await expectTheReviewWithoutItsPreview(page, projectId);
    await expectTheExportWithoutItsSource(page, projectId);
    const saved = await saveDownload(page, 'c01', testInfo.outputDir);
    await openResults(page, projectId);

    expect(after).toEqual(listKeptFiles(before));
    expect(Object.keys(after).filter((name) => /^(transcript\.json|frames\/|exports\/)/.test(name)).length).toBeGreaterThan(2);
    expect(statSync(saved.path).size).toBe(before[EXPORT_OF_THE_FIRST_CLIP]);
    expect(await readCopies(request, projectId)).toEqual([false, false]);
    expect(await readViewsRows(page)).toEqual([{ rank: '01', title: FIRST_TITLE, views: '', fieldId: 'views-c01' }]);
  });

  test('with Never chosen in Settings the source stays 400 days later, and with 3 days it is removed four days later', async ({
    page,
    request,
    ownTalk,
    tool,
  }) => {
    const projectId = ownTalk.project.id;
    await exportClips(request, projectId, ['c01']);

    await chooseRetention(page, 'Never');
    await startWithTheClockAhead(tool, 400);
    const withNever = await readCopies(request, projectId);
    await chooseRetention(page, '3 days');
    await startWithTheClockAhead(tool, 2);
    const twoDaysLater = await readCopies(request, projectId);
    await startWithTheClockAhead(tool, 4);

    expect([withNever, twoDaysLater]).toEqual([
      [true, true],
      [true, true],
    ]);
    expect(await readCopies(request, projectId)).toEqual([false, false]);
  });
});

test.describe('at 390 px', () => {
  test.use({ viewport: PHONE });

  test('on a phone the Review list of a talk without its source opens the clip with the notice in place of the preview', async ({
    page,
    request,
    ownTalk,
    tool,
  }) => {
    const projectId = ownTalk.project.id;
    await exportClips(request, projectId, ['c01']);
    await startWithTheClockAhead(tool, 8);

    await openReview(page, projectId);
    await expect(page.locator('.candidate__open')).toHaveCount(6);
    await candidateRow(page, 'c01').click();

    await expect(page).toHaveURL(`/projects/${projectId}/review/c01`);
    await expect(page.locator('.preview--gone')).toHaveText(NO_PREVIEW);
    await expect(page.locator('#decision-keep')).toBeVisible();
  });
});
