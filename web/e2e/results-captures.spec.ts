import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Page } from '@playwright/test';

import {
  expect,
  forgetHistory,
  makeSeededSet,
  readOutcome,
  readViewsRows,
  showWholeScreen,
  test,
  visitScreens,
  type Walk,
  walkSeededScreens,
} from './support';

const WINDOW_SIZES = [
  { width: 390, height: 844 },
  { width: 1360, height: 900 },
];
const THEMES = ['light', 'dark'] as const;
const SCREENS = ['results', 'settings'];
const CAPTURES_TIMEOUT_MS = 240_000;
const PNG_SIGNATURE = '89504e470d0a1a0a';
const PNG_WIDTH_OFFSET = 16;
const PNG_HEIGHT_OFFSET = 20;
const SMALLEST_CAPTURE_BYTES = 5000;
const SIDEBAR_STATUS = 'Exported · 3 clips exported, results logged';
const SHOWN: Record<string, string[]> = {
  results: [
    'Views After 7 Days',
    '01 | The worst day my bakery ever had | 1200',
    '02 | Hire for the habits you cannot teach | 5400',
    '03 | Almost everyone gets price wrong | 48000',
    'Enter each clip’s views a week after posting. The selector compares them with its own ranking and adjusts what it favours on your next video.',
    'Ranking Against Outcome',
    'The best performer was the selector’s pick number 3. Ranks in order of views: 3, 2, 1.',
    'Almost everyone gets price wrong | 48,000',
    'Hire for the habits you cannot teach | 5,400',
    'The worst day my bakery ever had | 1,200',
  ],
  settings: [
    'AI Services',
    'Defaults for New Projects',
    'Storage',
    'Open on Your Phone',
    'What the Selector Has Learned',
    '50 GB free of a whole number of GB on this Mac',
    'an address of this Mac with a port',
    'Cut Off Mid-Thought 1 | Not Interesting 1 | Needs Earlier Context 0 | Repeats Another Clip 0',
    'Forget All of It is switched on',
  ],
};

interface SavedCapture {
  file: string;
  screen: string;
  width: number;
  leastHeight: number;
  shown: string[];
  sidebarStatus: string | null;
}

function listExpectedFiles(): string[] {
  return SCREENS.flatMap((screen) =>
    WINDOW_SIZES.flatMap((size) => THEMES.map((theme) => `${screen}-${size.width}-${theme}.png`)),
  );
}

function expectPictureOfWholeScreen(capture: SavedCapture, picture: Buffer): void {
  expect(picture.subarray(0, 8).toString('hex'), capture.file).toBe(PNG_SIGNATURE);
  expect(picture.length, capture.file).toBeGreaterThan(SMALLEST_CAPTURE_BYTES);
  expect(picture.readUInt32BE(PNG_WIDTH_OFFSET), capture.file).toBe(capture.width);
  expect(picture.readUInt32BE(PNG_HEIGHT_OFFSET), capture.file).toBeGreaterThanOrEqual(capture.leastHeight);
}

async function readShownResults(page: Page): Promise<string[]> {
  const [viewsHeader, outcomeHeader] = await page.locator('.screen .list-header').allInnerTexts();
  const rows = await readViewsRows(page);
  const outcome = await readOutcome(page);
  return [
    viewsHeader,
    ...rows.map((row) => `${row.rank} | ${row.title} | ${row.views}`),
    (await page.locator('.screen .group-section').first().locator('.list-footer').innerText()).trim(),
    outcomeHeader,
    outcome.line,
    ...outcome.rows.map((row) => `${row.title} | ${row.views}`),
  ];
}

async function readShownSettings(page: Page): Promise<string[]> {
  const storage = (await page.locator('.storage p').innerText()).trim();
  const address = (await page.locator('.address').innerText()).trim();
  const learned = page.locator('section.group-section', { hasText: 'What the Selector Has Learned' });
  const counts = await learned.locator('li.row').allInnerTexts();
  const canForget = await page.getByRole('button', { name: 'Forget All of It' }).isEnabled();
  return [
    ...(await page.locator('.screen h2.list-header').allInnerTexts()),
    storage.replace(/ of \d+ GB /, ' of a whole number of GB '),
    /^http:\/\/\d+\.\d+\.\d+\.\d+:\d+$/.test(address) ? 'an address of this Mac with a port' : address,
    counts.map((row) => row.replace(/\s+/g, ' ').trim()).join(' | '),
    `Forget All of It is switched ${canForget ? 'on' : 'off'}`,
  ];
}

async function readSidebarStatus(page: Page, projectId: string): Promise<string | null> {
  const status = page.locator(`[id="sidebar"] [id="project-${projectId}"] .project-row__status`);
  return (await status.isVisible()) ? (await status.innerText()).trim() : null;
}

async function captureSeededScreens(page: Page, walk: Walk, folder: string): Promise<SavedCapture[]> {
  const projectId = walk.shownList.projects[0].id;
  const saved: SavedCapture[] = [];
  for (const size of WINDOW_SIZES) {
    for (const theme of THEMES) {
      await page.emulateMedia({ colorScheme: theme });
      await visitScreens(page, walk, async (screen) => {
        const file = `${screen}-${size.width}-${theme}.png`;
        await page.setViewportSize(size);
        const shown = screen === 'results' ? await readShownResults(page) : await readShownSettings(page);
        const sidebarStatus = await readSidebarStatus(page, projectId);
        await showWholeScreen(page, file);
        await page.screenshot({ path: join(folder, file), animations: 'disabled' });
        saved.push({ file, screen, width: size.width, leastHeight: size.height, shown, sidebarStatus });
      });
    }
  }
  return saved;
}

test.setTimeout(CAPTURES_TIMEOUT_MS);

test.afterEach(async ({ request }) => {
  await forgetHistory(request);
});

test('the Results tab and Settings of a talk with the seeded set are captured whole at 390 and 1360 px, in light and in dark', async ({
  page,
  request,
  ownTalk,
}, testInfo) => {
  const folder = process.env.CLIPPER_EVIDENCE_DIR ?? testInfo.outputDir;
  mkdirSync(folder, { recursive: true });
  await forgetHistory(request);
  const walk = walkSeededScreens(ownTalk.project.id, await makeSeededSet(request, ownTalk.project.id));

  const saved = await captureSeededScreens(page, walk, folder);

  expect(saved.map((capture) => capture.file).sort()).toEqual(listExpectedFiles().sort());
  for (const capture of saved) {
    expectPictureOfWholeScreen(capture, readFileSync(join(folder, capture.file)));
    expect(capture.shown, capture.file).toEqual(SHOWN[capture.screen]);
    expect(capture.sidebarStatus, capture.file).toBe(capture.width === 1360 ? SIDEBAR_STATUS : null);
  }
});
