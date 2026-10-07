import type { APIRequestContext, Page } from '@playwright/test';

import type { Platform } from '@/export';

import {
  deleteProject,
  expect,
  keepClips,
  openExport,
  readTextRows,
  test,
  TEST_KEY,
  waitForStatus,
} from './support';

const DESKTOP = { width: 1360, height: 900 };
const FIRST_TITLE = 'The worst day my bakery ever had';
const SIX_LABELS = [
  'TikTok title',
  'TikTok description',
  'Reels title',
  'Reels caption',
  'Shorts title',
  'Shorts description',
];
const PLATFORMS: readonly Platform[] = ['tiktok', 'reels', 'shorts'];

type StoredTexts = Record<Platform, { title: string; description: string }>;

async function readStoredTexts(request: APIRequestContext, projectId: string): Promise<string[]> {
  const answer = await request.get(`/api/projects/${projectId}/selection`);
  const stored: StoredTexts = (await answer.json()).candidates[0].platforms;
  return PLATFORMS.flatMap((platform) => [stored[platform].title, stored[platform].description]);
}

async function createTalkFor(request: APIRequestContext, link: string, platforms: Platform[]): Promise<string> {
  const created = await request.post('/api/projects', { data: { sourceKind: 'link', link, platforms } });
  const project = await waitForStatus(request, (await created.json()).id, 'ready');
  return project.id;
}

function readClipboard(page: Page): Promise<string> {
  return page.evaluate(() => navigator.clipboard.readText());
}

async function takeClipboardInterfaceAway(page: Page): Promise<void> {
  await page.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, 'clipboard', { get: () => undefined });
  });
}

test.use({ viewport: DESKTOP, permissions: ['clipboard-read', 'clipboard-write'] });

test('a kept clip shows a title and a description for each of the three platforms, as selection stored them', async ({
  page,
  request,
  readyTalk,
}) => {
  await keepClips(request, readyTalk.project.id, ['c01']);

  await openExport(page, readyTalk.project.id);

  const rows = await readTextRows(page, 0);
  expect(rows.map((row) => row.label)).toEqual(SIX_LABELS);
  expect(rows.map((row) => row.text)).toEqual(await readStoredTexts(request, readyTalk.project.id));
  expect(rows.map((row) => row.copyName)).toEqual(SIX_LABELS.map((label) => `Copy ${label} for ${FIRST_TITLE}`));
  expect(new Set(rows.map((row) => row.text)).size).toBe(6);
});

test('each of the six Copy controls leaves its row’s text on the clipboard and shows Copied', async ({
  page,
  request,
  readyTalk,
}) => {
  await keepClips(request, readyTalk.project.id, ['c01']);
  await openExport(page, readyTalk.project.id);
  const rows = await readTextRows(page, 0);
  const copied: string[] = [];

  for (const row of rows) {
    await page.getByRole('button', { name: row.copyName ?? '' }).click();
    await expect(page.getByRole('status')).toHaveText('Copied');
    copied.push(await readClipboard(page));
  }

  expect(copied).toEqual(rows.map((row) => row.text));
  expect(copied).toHaveLength(6);
});

test('a project made for TikTok alone shows that platform’s two rows', async ({
  page,
  request,
  fixtureServer,
  savedKey,
}) => {
  const projectId = await createTalkFor(request, `${fixtureServer.address}/talk.mp4`, ['tiktok']);
  await keepClips(request, projectId, ['c01']);

  await openExport(page, projectId);
  const rows = await readTextRows(page, 0);
  const stored = await readStoredTexts(request, projectId);
  await deleteProject(request, projectId);

  expect(savedKey).toBe(TEST_KEY);
  expect(rows.map((row) => row.label)).toEqual(['TikTok title', 'TikTok description']);
  expect(rows.map((row) => row.text)).toEqual(stored.slice(0, 2));
});

test('with the clipboard interface taken from the page, Copy still leaves the text on the clipboard', async ({
  page,
  context,
  request,
  readyTalk,
}) => {
  await keepClips(request, readyTalk.project.id, ['c01']);
  await takeClipboardInterfaceAway(page);
  await openExport(page, readyTalk.project.id);
  const caption = (await readTextRows(page, 0))[3];
  const hasInterface = await page.evaluate(() => navigator.clipboard !== undefined);

  await page.getByRole('button', { name: caption.copyName ?? '' }).click();
  await expect(page.getByRole('status')).toHaveText('Copied');
  const second = await context.newPage();
  await second.goto('/settings');
  await second.bringToFront();

  expect(hasInterface).toBe(false);
  expect(caption.label).toBe('Reels caption');
  expect(await readClipboard(second)).toBe(caption.text);
});
