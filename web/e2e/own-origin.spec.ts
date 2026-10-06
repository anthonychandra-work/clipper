import { join } from 'node:path';

import type { Page } from '@playwright/test';

import {
  deleteAllProjects,
  expect,
  finishFirstOfTwoClips,
  listEmptyScreens,
  listLowDiskScreens,
  listProjectScreens,
  listSheetScreens,
  openPreview,
  readPreview,
  readProjectList,
  removeSavedKey,
  saveDownload,
  seedEveryState,
  test,
  visitScreens,
  type Walk,
  walkExport,
  walkTalkReview,
} from './support';

const SIZES = [
  { width: 390, height: 844 },
  { width: 1360, height: 900 },
];
const THREE_GB_IN_BYTES = String(3 * 1024 ** 3);
const SETTLE_MS = 400;
const SCREENS_WITH_PROJECTS = 28;
const REVIEW_SCREENS = ['list', 'clip', 'flagged-clip', 'reject-menu', 'pinned-preview', 'playing'];
const PLAYED_SECONDS = 0.5;

function listenForRequests(page: Page): string[] {
  const asked: string[] = [];
  page.on('request', (request) => asked.push(request.url()));
  page.on('websocket', (socket) => asked.push(socket.url()));
  return asked;
}

async function walkAtBothWidths(page: Page, walk: Walk): Promise<string[]> {
  const visited: string[] = [];
  for (const size of SIZES) {
    await page.setViewportSize(size);
    await visitScreens(page, walk, async (screenName) => {
      await page.waitForTimeout(SETTLE_MS);
      visited.push(`${screenName} at ${size.width}`);
    });
  }
  return visited;
}

function findOutsideTheTool(asked: string[], toolAddress: string): string[] {
  return asked.filter((address) => !address.startsWith(`${toolAddress}/`));
}

async function playFirstClip(page: Page, projectId: string): Promise<void> {
  await openPreview(page, `/projects/${projectId}/review/c01`);
  await page.locator('#preview-play').click();
  await expect.poll(async () => (await readPreview(page)).place).toBeGreaterThan(PLAYED_SECONDS);
}

test.beforeEach(async ({ request }) => {
  await deleteAllProjects(request);
});

test.afterEach(async ({ request }) => {
  await removeSavedKey(request);
  await deleteAllProjects(request);
});

test('with projects, every request of every screen is addressed to the tool', async ({
  page,
  request,
  fixtureServer,
  fixturesDir,
  tool,
}) => {
  const asked = listenForRequests(page);
  const seeded = await seedEveryState(request, fixtureServer);
  const shownList = await readProjectList(request);
  const sheetScreens = listSheetScreens({ video: join(fixturesDir, 'talk.mp4'), runDir: tool.settings.runDir });
  const screens = [...listProjectScreens(seeded, shownList), ...sheetScreens];

  const visited = await walkAtBothWidths(page, { shownList, screens });

  expect(visited).toHaveLength(SCREENS_WITH_PROJECTS * SIZES.length);
  expect(asked.length).toBeGreaterThan(visited.length);
  expect(findOutsideTheTool(asked, tool.address)).toEqual([]);
});

test('the Review screens of the talk ask nothing outside the tool, with the preview playing on one of them', async ({
  page,
  request,
  readyTalk,
  tool,
}) => {
  const asked = listenForRequests(page);
  const walk = walkTalkReview(readyTalk, await readProjectList(request));
  const playing = { name: 'review-playing', open: (shown: Page) => playFirstClip(shown, readyTalk.project.id) };

  const visited = await walkAtBothWidths(page, { ...walk, screens: [...walk.screens, playing] });

  expect(visited).toEqual(SIZES.flatMap((size) => REVIEW_SCREENS.map((screen) => `review-${screen} at ${size.width}`)));
  expect(asked.some((address) => address.endsWith('/preview'))).toBe(true);
  expect(asked.some((address) => /\/clips\/c01\/frames\/12$/.test(address))).toBe(true);
  expect(asked.some((address) => address.endsWith('/fonts/inter/InterVariable.ttf'))).toBe(true);
  expect(findOutsideTheTool(asked, tool.address)).toEqual([]);
});

test('the Export tab of a talk with a finished clip asks nothing outside the tool, and saves its file from the tool', async ({
  page,
  request,
  ownTalk,
  tool,
}, testInfo) => {
  const asked = listenForRequests(page);
  const walk = walkExport(ownTalk.project.id, await finishFirstOfTwoClips(request, ownTalk.project.id));
  const withTheTalk = { ...walk, screens: walk.screens.filter((screen) => screen.name === 'export-talk') };
  const fileAddress = `${tool.address}/api/projects/${ownTalk.project.id}/clips/c01/export`;
  const saved: string[] = [];

  for (const size of SIZES) {
    await page.setViewportSize(size);
    await visitScreens(page, withTheTalk, async () => page.waitForTimeout(SETTLE_MS));
    const download = await saveDownload(page, 'c01', join(testInfo.outputDir, String(size.width)));
    saved.push(`${download.name} from ${download.address}`);
  }

  expect(saved).toEqual(Array(SIZES.length).fill(`01 The worst day my bakery ever had.mp4 from ${fileAddress}`));
  expect(asked.some((address) => address.endsWith(`/projects/${ownTalk.project.id}/export`))).toBe(true);
  expect(findOutsideTheTool(asked, tool.address)).toEqual([]);
});

test('the empty Library asks nothing outside the tool', async ({ page, request, tool }) => {
  const asked = listenForRequests(page);
  const shownList = await readProjectList(request);

  const visited = await walkAtBothWidths(page, { shownList, screens: listEmptyScreens() });

  expect(visited).toEqual(['empty-library at 390', 'empty-library at 1360']);
  expect(asked.length).toBeGreaterThan(visited.length);
  expect(findOutsideTheTool(asked, tool.address)).toEqual([]);
});

test.describe('with 3 GB reported free', () => {
  test.afterEach(async ({ tool }) => {
    await tool.stop();
    await tool.start();
  });

  test('the low disk error asks nothing outside the tool', async ({ page, request, tool, fixtureServer }) => {
    await tool.stop();
    await tool.start({ CLIPPER_REPORTED_FREE_BYTES: THREE_GB_IN_BYTES });
    const asked = listenForRequests(page);
    const shownList = await readProjectList(request);
    const screens = listLowDiskScreens(`${fixtureServer.address}/talk.mp4`);

    const visited = await walkAtBothWidths(page, { shownList, screens });

    expect(visited).toEqual(['error-low-disk at 390', 'error-low-disk at 1360']);
    expect(asked.some((address) => address.endsWith('/api/projects'))).toBe(true);
    expect(findOutsideTheTool(asked, tool.address)).toEqual([]);
  });
});
