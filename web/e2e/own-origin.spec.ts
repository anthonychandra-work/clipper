import { join } from 'node:path';

import type { Page } from '@playwright/test';

import {
  deleteAllProjects,
  expect,
  listEmptyScreens,
  listLowDiskScreens,
  listProjectScreens,
  listSheetScreens,
  readProjectList,
  seedEveryState,
  test,
  visitScreens,
  type Walk,
} from './support';

const SIZES = [
  { width: 390, height: 844 },
  { width: 1360, height: 900 },
];
const THREE_GB_IN_BYTES = String(3 * 1024 ** 3);
const SETTLE_MS = 400;
const SCREENS_WITH_PROJECTS = 23;

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

test.beforeEach(async ({ request }) => {
  await deleteAllProjects(request);
});

test.afterEach(async ({ request }) => {
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
