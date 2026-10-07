import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Page } from '@playwright/test';

import {
  expect,
  finishFirstOfTwoClips,
  readExportRows,
  readRenderActions,
  readTextRows,
  showWholeScreen,
  test,
  visitScreens,
  type Walk,
  walkExport,
} from './support';

const WINDOW_SIZES = [
  { width: 390, height: 844 },
  { width: 1360, height: 900 },
];
const THEMES = ['light', 'dark'] as const;
const CAPTURED_SCREEN = 'export-talk';
const PNG_SIGNATURE = '89504e470d0a1a0a';
const PNG_WIDTH_OFFSET = 16;
const PNG_HEIGHT_OFFSET = 20;
const SMALLEST_CAPTURE_BYTES = 5000;
const SHOWN = {
  rows: [
    'The worst day my bakery ever had | exports/01-c01.mp4 · 32.8 s | Download MP4',
    'Hire for the habits you cannot teach | exports/02-c02.mp4 · 33.2 s | Not rendered',
  ],
  render: 'Render 2 Clips',
  textCounts: [6, 6],
};
const SIDEBAR_STATUS = 'Exported · 1 clip exported';

interface ShownTab {
  rows: string[];
  render: string;
  textCounts: number[];
}

interface SavedCapture {
  file: string;
  width: number;
  leastHeight: number;
  shown: ShownTab;
  sidebarStatus: string | null;
}

function listExpectedFiles(): string[] {
  return WINDOW_SIZES.flatMap((size) => THEMES.map((theme) => `export-${size.width}-${theme}.png`));
}

function expectPictureOfWholeScreen(capture: SavedCapture, picture: Buffer): void {
  expect(picture.subarray(0, 8).toString('hex'), capture.file).toBe(PNG_SIGNATURE);
  expect(picture.length, capture.file).toBeGreaterThan(SMALLEST_CAPTURE_BYTES);
  expect(picture.readUInt32BE(PNG_WIDTH_OFFSET), capture.file).toBe(capture.width);
  expect(picture.readUInt32BE(PNG_HEIGHT_OFFSET), capture.file).toBeGreaterThanOrEqual(capture.leastHeight);
}

async function readShownTab(page: Page): Promise<ShownTab> {
  const rows = await readExportRows(page);
  const texts = [await readTextRows(page, 0), await readTextRows(page, 1)];
  return {
    rows: rows.map((row) => `${row.title} | ${row.file} | ${row.status}`),
    render: (await readRenderActions(page)).render,
    textCounts: texts.map((textRows) => textRows.filter((textRow) => textRow.copyId !== '').length),
  };
}

async function readSidebarStatus(page: Page, projectId: string): Promise<string | null> {
  const status = page.locator(`[id="sidebar"] [id="project-${projectId}"] .project-row__status`);
  return (await status.isVisible()) ? (await status.innerText()).trim() : null;
}

async function captureExport(page: Page, walk: Walk, folder: string): Promise<SavedCapture[]> {
  const projectId = walk.shownList.projects[0].id;
  const saved: SavedCapture[] = [];
  for (const size of WINDOW_SIZES) {
    for (const theme of THEMES) {
      await page.setViewportSize(size);
      await page.emulateMedia({ colorScheme: theme });
      await visitScreens(page, walk, async () => {
        const file = `export-${size.width}-${theme}.png`;
        const sidebarStatus = await readSidebarStatus(page, projectId);
        const shown = await readShownTab(page);
        await showWholeScreen(page, file);
        await page.screenshot({ path: join(folder, file), animations: 'disabled' });
        saved.push({ file, width: size.width, leastHeight: size.height, shown, sidebarStatus });
      });
    }
  }
  return saved;
}

test('the Export tab with one clip finished and one not rendered is captured whole at 390 and 1360 px, in light and in dark', async ({
  page,
  request,
  ownTalk,
}, testInfo) => {
  const folder = process.env.CLIPPER_EVIDENCE_DIR ?? testInfo.outputDir;
  mkdirSync(folder, { recursive: true });
  const walk = walkExport(ownTalk.project.id, await finishFirstOfTwoClips(request, ownTalk.project.id));
  const captured = { ...walk, screens: walk.screens.filter((screen) => screen.name === CAPTURED_SCREEN) };

  const saved = await captureExport(page, captured, folder);

  expect(saved.map((capture) => capture.file).sort()).toEqual(listExpectedFiles().sort());
  for (const capture of saved) {
    expectPictureOfWholeScreen(capture, readFileSync(join(folder, capture.file)));
  }
  expect(saved.map((capture) => capture.shown)).toEqual(Array(saved.length).fill(SHOWN));
  expect(saved.map((capture) => capture.sidebarStatus)).toEqual([null, null, SIDEBAR_STATUS, SIDEBAR_STATUS]);
});
