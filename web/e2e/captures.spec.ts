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
const SCREEN_LONGER_THAN_THE_WINDOW = 'settings';
const WINDOW_SIZES = [
  { width: 390, height: 844 },
  { width: 1360, height: 900 },
];
const THEMES = ['light', 'dark'];
const PNG_SIGNATURE = '89504e470d0a1a0a';
const PNG_WIDTH_OFFSET = 16;
const PNG_HEIGHT_OFFSET = 20;
const SMALLEST_CAPTURE_BYTES = 5000;

interface ExpectedCapture {
  file: string;
  width: number;
  leastHeight: number;
}

function listExpectedCaptures(): ExpectedCapture[] {
  return SCREENS.flatMap((screen) =>
    WINDOW_SIZES.flatMap((size) =>
      THEMES.map((theme) => ({
        file: `${screen}-${size.width}-${theme}.png`,
        width: size.width,
        leastHeight: screen === SCREEN_LONGER_THAN_THE_WINDOW ? size.height + 1 : size.height,
      })),
    ),
  );
}

function expectPictureOfWholeScreen(capture: ExpectedCapture, picture: Buffer): void {
  expect(picture.subarray(0, 8).toString('hex'), capture.file).toBe(PNG_SIGNATURE);
  expect(picture.length, capture.file).toBeGreaterThan(SMALLEST_CAPTURE_BYTES);
  expect(picture.readUInt32BE(PNG_WIDTH_OFFSET), capture.file).toBe(capture.width);
  expect(picture.readUInt32BE(PNG_HEIGHT_OFFSET), capture.file).toBeGreaterThanOrEqual(capture.leastHeight);
}

test.beforeEach(async ({ request }) => {
  await deleteAllProjects(request);
});

test.afterEach(async ({ request }) => {
  await deleteAllProjects(request);
});

test('six screens are captured whole at 390 and 1360 px, in light and in dark', async (
  { page, request, fixtureServer, fixturesDir, tool },
  testInfo,
) => {
  const folder = process.env.CLIPPER_EVIDENCE_DIR ?? testInfo.outputDir;
  const expected = listExpectedCaptures();
  const emptyList = await readProjectList(request);
  const savedEmpty = await captureScreens(page, { shownList: emptyList, screens: listEmptyScreens() }, folder);
  const seeded = await seedEveryState(request, fixtureServer);
  const shownList = await readProjectList(request);
  const sheetScreens = listSheetScreens({ video: join(fixturesDir, 'talk.mp4'), runDir: tool.settings.runDir });
  const screens = [...listProjectScreens(seeded, shownList), ...sheetScreens];

  const saved = await captureScreens(page, { shownList, screens }, folder);

  expect([...savedEmpty, ...saved].sort()).toEqual(expected.map((capture) => capture.file).sort());
  for (const capture of expected) {
    expectPictureOfWholeScreen(capture, readFileSync(join(folder, capture.file)));
  }
});
