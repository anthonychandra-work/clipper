import { join } from 'node:path';

import {
  deleteAllProjects,
  expect,
  findMisfits,
  listEmptyScreens,
  listLowDiskScreens,
  listProjectScreens,
  listSheetScreens,
  measureWalk,
  readProjectList,
  seedEveryState,
  test,
} from './support';

const PHONE = { width: 390, height: 844 };
const THREE_GB_IN_BYTES = String(3 * 1024 ** 3);
const SCREENS_WITH_PROJECTS = [
  'library',
  'status-fetched',
  'status-failed',
  'status-stopped',
  'status-processing',
  'status-queued',
  'status-uploading',
  'project-review',
  'project-export',
  'project-results',
  'delete-alert',
  'settings',
  'new-project-link',
  'new-project-file',
  'error-bad-link',
  'error-no-file',
  'error-no-platform',
  'error-large-file',
];
const MISFITS_ON_PURPOSE = `
  <div style="position: absolute; top: 0; left: 0; width: 500px">A block wider than the screen</div>
  <p style="position: absolute; top: 40px; left: 0; width: 80px; overflow: hidden; white-space: nowrap">
    A label that is longer than its box
  </p>
  <span style="position: absolute; top: 80px; left: 0; width: 60px; white-space: nowrap">A label over its neighbour</span>
  <select style="position: absolute; top: 120px; left: 0; width: 40px">
    <option>A choice longer than its control</option>
  </select>`;

function atBothSizes(screens: string[]): string[] {
  return ['the normal size', '200%'].flatMap((size) => screens.map((screen) => `${screen} at ${size}`));
}

test.use({ viewport: PHONE });

test.beforeEach(async ({ request }) => {
  await deleteAllProjects(request);
});

test.afterEach(async ({ request }) => {
  await deleteAllProjects(request);
});

test('the measure finds a block that is too wide, a cut label, a spilled label and a cut choice', async ({ page }) => {
  await page.goto('/settings');
  await expect(page.locator('#setting-scoringModel')).toBeVisible();
  const before = await findMisfits(page);

  await page.locator('body').evaluate((body, markup) => body.insertAdjacentHTML('beforeend', markup), MISFITS_ON_PURPOSE);
  const after = await findMisfits(page);

  expect(before).toEqual([]);
  expect(after).toEqual([
    expect.stringMatching(/^scrolls sideways: <html /),
    'wider than the screen: <div class=""> A block wider than the screen',
    'clipped label: <p class=""> A label that is longer than its box',
    'clipped label: <span class=""> A label over its neighbour',
    'clipped label: <select class=""> A choice longer than its control',
  ]);
});

test('with projects, every screen fits at the normal size and at 200%', async ({
  page,
  request,
  fixtureServer,
  fixturesDir,
  tool,
}) => {
  const seeded = await seedEveryState(request, fixtureServer);
  const shownList = await readProjectList(request);
  const sheetScreens = listSheetScreens({ video: join(fixturesDir, 'talk.mp4'), runDir: tool.settings.runDir });
  const screens = [...listProjectScreens(seeded, shownList), ...sheetScreens];

  const report = await measureWalk(page, { shownList, screens });

  expect(report.misfits).toEqual([]);
  expect(report.measured).toEqual(atBothSizes(SCREENS_WITH_PROJECTS));
});

test('the empty Library fits at the normal size and at 200%', async ({ page, request }) => {
  const shownList = await readProjectList(request);

  const report = await measureWalk(page, { shownList, screens: listEmptyScreens() });

  expect(report.misfits).toEqual([]);
  expect(report.measured).toEqual(atBothSizes(['empty-library']));
});

test.describe('with 3 GB reported free', () => {
  test.afterEach(async ({ tool }) => {
    await tool.stop();
    await tool.start();
  });

  test('the low disk error fits at the normal size and at 200%', async ({ page, request, tool, fixtureServer }) => {
    await tool.stop();
    await tool.start({ CLIPPER_REPORTED_FREE_BYTES: THREE_GB_IN_BYTES });
    const shownList = await readProjectList(request);
    const screens = listLowDiskScreens(`${fixtureServer.address}/talk.mp4`);

    const report = await measureWalk(page, { shownList, screens });

    expect(report.misfits).toEqual([]);
    expect(report.measured).toEqual(atBothSizes(['error-low-disk']));
    await expect(page.locator('#draft-problem')).toContainText('Only 3.0 GB is free on this Mac');
  });
});
