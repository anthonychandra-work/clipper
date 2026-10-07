import type { Page } from '@playwright/test';

import {
  enlargeTextFromLoad,
  expect,
  findFaintTexts,
  findMisfits,
  findSmallTapAreas,
  findTextUnderBottomBar,
  forgetHistory,
  makeSeededSet,
  readOutcome,
  readShownResults,
  readViewsRows,
  test,
  type TextFitReport,
  visitScreens,
  type Walk,
  walkResults,
} from './support';

const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1360, height: 900 };
const TEXT_SIZES = [
  { name: 'the normal size', percent: 100 },
  { name: '200%', percent: 200 },
];
const SIZE_NAMES = TEXT_SIZES.map((size) => size.name);
const THEMES = ['light', 'dark'] as const;
const SCREENS = ['results-empty', 'results-seeded', 'results-crowded', 'settings-keyless', 'settings-with-key'];
const FIT_TIMEOUT_MS = 240_000;

function nameScreens(states: readonly string[]): string[] {
  return states.flatMap((state) => SCREENS.map((screen) => `${screen} at ${state}`));
}

function keepScreen(walk: Walk, name: string): Walk {
  return { ...walk, screens: walk.screens.filter((screen) => screen.name === name) };
}

async function measureFit(page: Page, walk: Walk): Promise<TextFitReport> {
  const report: TextFitReport = { measured: [], misfits: [] };
  for (const size of TEXT_SIZES) {
    if (size.percent !== 100) await enlargeTextFromLoad(page, size.percent);
    await visitScreens(page, walk, async (screenName) => {
      const measured = `${screenName} at ${size.name}`;
      const found = [...(await findMisfits(page)), ...(await findSmallTapAreas(page))];
      found.push(...(await findTextUnderBottomBar(page)));
      report.measured.push(measured);
      report.misfits.push(...found.map((misfit) => `${measured}: ${misfit}`));
    });
  }
  return report;
}

async function measureContrast(page: Page, walk: Walk): Promise<TextFitReport> {
  const report: TextFitReport = { measured: [], misfits: [] };
  for (const theme of THEMES) {
    await page.emulateMedia({ colorScheme: theme });
    await visitScreens(page, walk, async (screenName) => {
      const measured = `${screenName} at ${theme}`;
      const faint = await findFaintTexts(page);
      report.measured.push(measured);
      report.misfits.push(...faint.map((text) => `${measured}: ${text}`));
    });
  }
  return report;
}

test.setTimeout(FIT_TIMEOUT_MS);

test.afterEach(async ({ request }) => {
  await forgetHistory(request);
});

test.describe('at 390 px', () => {
  test.use({ viewport: PHONE });

  test('the results presented to the page hold twelve clips with titles of 110 characters and views of ten digits, and Settings counts of three digits', async ({
    page,
    request,
    ownTalk,
  }) => {
    const walk = walkResults(ownTalk.project.id, await readShownResults(request, ownTalk.project.id));

    await visitScreens(page, keepScreen(walk, 'settings-with-key'), async () => undefined);
    const counts = await page.locator('.memory-count').allInnerTexts();
    const savedKey = await page.locator('.row', { hasText: 'Anthropic API Key' }).locator('.row__value').innerText();
    await visitScreens(page, keepScreen(walk, 'results-crowded'), async () => undefined);
    const rows = await readViewsRows(page);
    const outcome = await readOutcome(page);

    expect(counts).toEqual(['128', '204', '317', '100']);
    expect(savedKey).toBe('Saved · ends in 4f2a');
    expect(rows.map((row) => row.rank)).toEqual(Array.from({ length: 12 }, (_, place) => String(place + 1).padStart(2, '0')));
    expect(rows.every((row) => row.title.length >= 110 && row.views.length === 10)).toBe(true);
    expect(outcome.rows.map((row) => row.views.length)).toEqual(Array(12).fill('9,999,999,999'.length));
    expect(outcome.line).toMatch(/^The selector’s first pick performed best\. Ranks in order of views: 1, 2, 3, /);
  });

  test('every Results and Settings screen fits at the normal size and at 200%, with tap areas of 44 px and its last line above the bar', async ({
    page,
    request,
    ownTalk,
  }) => {
    const shown = await makeSeededSet(request, ownTalk.project.id);

    const report = await measureFit(page, walkResults(ownTalk.project.id, shown));

    expect(report.misfits).toEqual([]);
    expect(report.measured).toEqual(nameScreens(SIZE_NAMES));
  });

  test('no text of a Results or Settings screen measures under 4.5 to 1, in light and in dark', async ({
    page,
    request,
    ownTalk,
  }) => {
    const shown = await makeSeededSet(request, ownTalk.project.id);

    const report = await measureContrast(page, walkResults(ownTalk.project.id, shown));

    expect(report.misfits).toEqual([]);
    expect(report.measured).toEqual(nameScreens(THEMES));
  });
});

test.describe('at 1360 px', () => {
  test.use({ viewport: DESKTOP });

  test('the same Results and Settings screens hold no text under 4.5 to 1, in light and in dark', async ({
    page,
    request,
    ownTalk,
  }) => {
    const shown = await makeSeededSet(request, ownTalk.project.id);

    const report = await measureContrast(page, walkResults(ownTalk.project.id, shown));

    expect(report.misfits).toEqual([]);
    expect(report.measured).toEqual(nameScreens(THEMES));
  });
});
