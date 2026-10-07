import type { Page } from '@playwright/test';

import {
  enlargeTextFromLoad,
  expect,
  findFaintTexts,
  findMisfits,
  findSmallTapAreas,
  findTextUnderBottomBar,
  finishFirstOfTwoClips,
  readExportRows,
  readTextRows,
  test,
  type TextFitReport,
  visitScreens,
  type Walk,
  walkExport,
} from './support';

const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1360, height: 900 };
const TEXT_SIZES = [
  { name: 'the normal size', percent: 100 },
  { name: '200%', percent: 200 },
];
const SIZE_NAMES = TEXT_SIZES.map((size) => size.name);
const THEMES = ['light', 'dark'] as const;
const SCREENS = ['empty', 'talk', 'crowded'];
const LONG_REASON = 'Not enough free disk space to finish. Free some space, then retry.';
const SOURCE_GONE =
  'The source video was deleted to free space. Finished exports are still here. New clips cannot be rendered.';
const EVERY_STATE = ['Not rendered', 'Waiting', 'Rendering', `${LONG_REASON} Retry`, 'Download MP4'];

function nameScreens(states: readonly string[]): string[] {
  return states.flatMap((state) => SCREENS.map((screen) => `export-${screen} at ${state}`));
}

function keepScreen(walk: Walk, name: string): Walk {
  return { ...walk, screens: walk.screens.filter((screen) => screen.name === `export-${name}`) };
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

test.describe('at 390 px', () => {
  test.use({ viewport: PHONE });

  test('the export presented to the page holds twelve clips in every state, with long texts, under the notice', async ({
    page,
    request,
    ownTalk,
  }) => {
    const shown = await finishFirstOfTwoClips(request, ownTalk.project.id);
    const crowded = keepScreen(walkExport(ownTalk.project.id, shown), 'crowded');

    await visitScreens(page, crowded, async () => undefined);

    const rows = await readExportRows(page);
    const texts = await readTextRows(page, 0);
    expect(rows).toHaveLength(12);
    expect(rows.slice(0, 5).map((row) => row.status)).toEqual(EVERY_STATE);
    expect(rows.every((row) => row.title.length >= 110)).toBe(true);
    expect(texts.filter((row) => row.label.endsWith('title')).length).toBe(3);
    expect(texts.filter((row) => row.text.length === 300).length).toBe(3);
    await expect(page.locator('.flag[role="note"] .flag__message')).toHaveText(SOURCE_GONE);
    await expect(page.getByRole('button', { name: 'Rendering…' })).toBeDisabled();
  });

  test('every Export screen fits at the normal size and at 200%, with tap areas of 44 px and its last line above the bar', async ({
    page,
    request,
    ownTalk,
  }) => {
    const shown = await finishFirstOfTwoClips(request, ownTalk.project.id);

    const report = await measureFit(page, walkExport(ownTalk.project.id, shown));

    expect(report.misfits).toEqual([]);
    expect(report.measured).toEqual(nameScreens(SIZE_NAMES));
  });

  test('no text of an Export screen measures under 4.5 to 1, in light and in dark', async ({
    page,
    request,
    ownTalk,
  }) => {
    const shown = await finishFirstOfTwoClips(request, ownTalk.project.id);

    const report = await measureContrast(page, walkExport(ownTalk.project.id, shown));

    expect(report.misfits).toEqual([]);
    expect(report.measured).toEqual(nameScreens(THEMES));
  });
});

test.describe('at 1360 px', () => {
  test.use({ viewport: DESKTOP });

  test('the same Export screens hold no text under 4.5 to 1, in light and in dark', async ({
    page,
    request,
    ownTalk,
  }) => {
    const shown = await finishFirstOfTwoClips(request, ownTalk.project.id);

    const report = await measureContrast(page, walkExport(ownTalk.project.id, shown));

    expect(report.misfits).toEqual([]);
    expect(report.measured).toEqual(nameScreens(THEMES));
  });
});
