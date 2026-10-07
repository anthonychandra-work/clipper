import { statfsSync } from 'node:fs';

import type { APIRequestContext, Locator, Page } from '@playwright/test';

import {
  chooseInSettings,
  chooseTheDefaults,
  cutTalkAndKeepRequests,
  deleteAllProjects,
  expect,
  type KeptRequest,
  listProjects,
  nameSentTasks,
  newProjectForm,
  openNewProjectSheet,
  pressFindClips,
  readSelection,
  readSentTask,
  readSettings,
  saveChoices,
  test,
} from './support';

const DESKTOP = { width: 1360, height: 900 };
const BYTES_PER_GB = 1024 ** 3;
const SETTINGS_ADDRESS = '**/api/settings';
const ONE_SCORE_AND_THREE_CUTS = ['score', 'cut w01', 'cut w02', 'cut w03'];
const LONG_HINT = 'A full story or argument. Long enough for TikTok payouts.';
const STANDARD_HINT = 'One point with its setup and payoff.';

function selectedLength(page: Page): Locator {
  return newProjectForm(page).locator('.segmented[aria-label="Clip length"] .segmented__option[aria-pressed="true"]');
}

function lengthHint(page: Page): Locator {
  const lengthSection = newProjectForm(page).locator('section.group-section', {
    has: page.locator('.segmented[aria-label="Clip length"]'),
  });
  return lengthSection.locator('.list-footer');
}

function readEfforts(requests: KeptRequest[]): (string | null)[] {
  return requests.map((kept) => (kept.body.output_config as { effort?: string } | undefined)?.effort ?? null);
}

async function openSheetOnceSettingsAnswered(page: Page): Promise<void> {
  const answered = page.waitForResponse(SETTINGS_ADDRESS);
  await openNewProjectSheet(page);
  await answered;
}

async function holdSettingsBack(page: Page): Promise<() => Promise<void>> {
  let release = () => {};
  const released = new Promise<void>((settle) => {
    release = settle;
  });
  await page.route(SETTINGS_ADDRESS, async (route) => {
    await released;
    await route.continue();
  });
  return async () => {
    const answered = page.waitForResponse(SETTINGS_ADDRESS);
    release();
    await answered;
  };
}

async function readFreeSpaceOfTheLibrary(request: APIRequestContext): Promise<number> {
  const listed = await request.get('/api/projects');
  return (await listed.json()).freeDiskGb;
}

async function showsInTheSidebar(page: Page, freeDiskGb: number): Promise<boolean> {
  const shown = (await page.locator('.sidebar__disk').innerText()).trim();
  return shown === `${Math.floor(freeDiskGb)} GB free on this Mac`;
}

test.use({ viewport: DESKTOP });

test.afterEach(async ({ request }) => {
  await chooseTheDefaults(request);
  await deleteAllProjects(request);
});

test('with Claude Haiku 4.5 chosen for scoring and Claude Fable 5.1 for cutting, the next talk asks Haiku once without an effort setting and Fable three times', async ({
  page,
  request,
  savedKey,
  fixtureServer,
  recordedClaude,
}) => {
  await chooseInSettings(page, 'Scoring Model', 'Claude Haiku 4.5');
  await chooseInSettings(page, 'Cutting Model', 'Claude Fable 5.1');

  const { requests } = await cutTalkAndKeepRequests({ request, recordedClaude }, `${fixtureServer.address}/talk.mp4`);

  expect(savedKey).not.toBe('');
  expect(nameSentTasks(requests)).toEqual(ONE_SCORE_AND_THREE_CUTS);
  expect(requests.map((kept) => kept.body.model)).toEqual([
    'claude-haiku-4-5',
    'claude-fable-5-1',
    'claude-fable-5-1',
    'claude-fable-5-1',
  ]);
  expect(readEfforts(requests)).toEqual([null, 'high', 'high', 'high']);
});

test('with 4 chosen as the clips per video, the next talk ends ready with four candidates, and each cut task asks for 4', async ({
  page,
  request,
  savedKey,
  fixtureServer,
  recordedClaude,
}) => {
  await chooseInSettings(page, 'Clips per Video', '4');

  const { requests } = await cutTalkAndKeepRequests({ request, recordedClaude }, `${fixtureServer.address}/talk.mp4`);
  const [talk] = await listProjects(request);
  const selection = await readSelection(request, talk.id);

  expect(savedKey).not.toBe('');
  expect([talk.status, talk.candidateCount]).toEqual(['ready', 4]);
  expect(selection.candidates.map((candidate) => candidate.rank)).toEqual([1, 2, 3, 4]);
  expect(nameSentTasks(requests)).toEqual(ONE_SCORE_AND_THREE_CUTS);
  expect(requests.slice(1).map((kept) => readSentTask(kept).clipCount)).toEqual([4, 4, 4]);
});

test('with 60–180 s chosen as the clip length, the new project sheet opens with it selected, also after a reload, and a project made from it has the limits 60 and 180', async ({
  page,
  request,
  fixtureServer,
}) => {
  await chooseInSettings(page, 'Clip Length', '60–180 s');

  await openNewProjectSheet(page);
  await expect(selectedLength(page)).toHaveText('60–180 s');
  await expect(lengthHint(page)).toHaveText(LONG_HINT);
  await page.reload();
  await expect(selectedLength(page)).toHaveText('60–180 s');
  await page.locator('#draft-link').fill(`${fixtureServer.address}/talk.mp4`);
  await pressFindClips(page);
  await page.waitForURL(/\/projects\/[0-9a-f]{12}$/);
  const [made] = await listProjects(request);
  const selection = await readSelection(request, made.id);
  await saveChoices(request, { defaultLength: 'standard' });
  await openSheetOnceSettingsAnswered(page);

  await expect(selectedLength(page)).toHaveText('25–60 s');
  await expect(lengthHint(page)).toHaveText(STANDARD_HINT);
  expect(selection.clipSeconds).toMatchObject({ min: 60, max: 180 });
});

test('a length chosen in the sheet before Settings answers is kept, and the sheet opens at 25–60 s while it waits', async ({
  page,
  request,
}) => {
  await saveChoices(request, { defaultLength: 'long' });
  const letSettingsAnswer = await holdSettingsBack(page);

  await openNewProjectSheet(page);
  const openedWith = await selectedLength(page).innerText();
  await page.locator('#length-short').click();
  await letSettingsAnswer();
  await page.waitForTimeout(300);

  expect(openedWith).toBe('25–60 s');
  await expect(selectedLength(page)).toHaveText('15–30 s');
});

test('the sheet keeps 25–60 s when Settings cannot be read', async ({ page, request }) => {
  await saveChoices(request, { defaultLength: 'long' });
  await page.route(SETTINGS_ADDRESS, (route) => route.abort());
  const failed = page.waitForEvent('requestfailed', (asked) => asked.url().endsWith('/api/settings'));

  await openNewProjectSheet(page);
  await failed;
  await page.waitForTimeout(300);

  await expect(selectedLength(page)).toHaveText('25–60 s');
});

test.describe('started without a reported figure', () => {
  test.afterEach(async ({ tool }) => {
    await tool.stop();
    await tool.start();
  });

  test('the tool gives the free space and the total of the data folder’s disk within 1 GB, and Settings and the sidebar show the free space rounded down to whole gigabytes', async ({
    page,
    request,
    tool,
  }) => {
    await tool.stop();
    await tool.start({ CLIPPER_REPORTED_FREE_BYTES: undefined });
    const disk = statfsSync(tool.settings.dataDir);
    const given = await readSettings(request);
    const answered = page.waitForResponse(SETTINGS_ADDRESS);

    await page.goto('/settings');
    const shown = await (await answered).json();
    const storageLine = `${Math.floor(shown.freeDiskGb)} GB free of ${Math.round(shown.totalDiskGb)} GB on this Mac`;

    await expect(page.locator('.storage p')).toHaveText(storageLine);
    await expect.poll(async () => showsInTheSidebar(page, await readFreeSpaceOfTheLibrary(request))).toBe(true);
    expect(Math.abs(given.freeDiskGb - (disk.bavail * disk.bsize) / BYTES_PER_GB)).toBeLessThan(1);
    expect(Math.abs(given.totalDiskGb - (disk.blocks * disk.bsize) / BYTES_PER_GB)).toBeLessThan(1);
    expect(Math.abs((await readFreeSpaceOfTheLibrary(request)) - given.freeDiskGb)).toBeLessThan(1);
  });
});
