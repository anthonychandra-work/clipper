import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  captureScreens,
  deleteAllProjects,
  expect,
  listEmptyScreens,
  listProjectScreens,
  listSheetScreens,
  readProjectList,
  seedEveryState,
  test,
} from './support';

const SCREENS = ['library', 'empty-library', 'new-project', 'status', 'project', 'settings'];
const WIDTHS = [390, 1360];
const THEMES = ['light', 'dark'];
const PNG_SIGNATURE = '89504e470d0a1a0a';
const SMALLEST_CAPTURE_BYTES = 5000;

function listExpectedCaptures(): string[] {
  return SCREENS.flatMap((screen) =>
    WIDTHS.flatMap((width) => THEMES.map((theme) => `${screen}-${width}-${theme}.png`)),
  );
}

test.beforeEach(async ({ request }) => {
  await deleteAllProjects(request);
});

test.afterEach(async ({ request }) => {
  await deleteAllProjects(request);
});

test('six screens are captured at 390 and 1360 px, in light and in dark', async (
  { page, request, fixtureServer, fixturesDir, tool },
  testInfo,
) => {
  const folder = process.env.CLIPPER_EVIDENCE_DIR ?? testInfo.outputDir;
  const emptyList = await readProjectList(request);
  const savedEmpty = await captureScreens(page, { shownList: emptyList, screens: listEmptyScreens() }, folder);
  const seeded = await seedEveryState(request, fixtureServer);
  const shownList = await readProjectList(request);
  const sheetScreens = listSheetScreens({ video: join(fixturesDir, 'talk.mp4'), runDir: tool.settings.runDir });
  const screens = [...listProjectScreens(seeded, shownList), ...sheetScreens];

  const saved = await captureScreens(page, { shownList, screens }, folder);

  expect([...savedEmpty, ...saved].sort()).toEqual(listExpectedCaptures().sort());
  for (const capture of listExpectedCaptures()) {
    const picture = readFileSync(join(folder, capture));
    expect(picture.subarray(0, 8).toString('hex'), capture).toBe(PNG_SIGNATURE);
    expect(picture.length, capture).toBeGreaterThan(SMALLEST_CAPTURE_BYTES);
  }
});
