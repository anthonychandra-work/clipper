import type { Page } from '@playwright/test';

import {
  enlargeTextFromLoad,
  expect,
  findFaintTexts,
  findMisfits,
  findSmallTapAreas,
  findTextUnderBottomBar,
  openReview,
  readProjectList,
  test,
  type TextFitReport,
  visitScreens,
  type Walk,
  walkCrowdedReview,
  walkTalkReview,
} from './support';

const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1360, height: 900 };
const TEXT_SIZES = [
  { name: 'the normal size', percent: 100 },
  { name: '200%', percent: 200 },
];
const SIZE_NAMES = TEXT_SIZES.map((size) => size.name);
const THEMES = ['light', 'dark'] as const;
const SCREENS = ['list', 'clip', 'flagged-clip', 'reject-menu', 'pinned-preview'];
const SCREENS_BESIDE_THE_LIST = ['clip', 'flagged-clip'];
const TAPS_ON_PURPOSE = `
  <div style="position: fixed; top: 200px; left: 40px; z-index: 99; width: 300px; height: 400px; background: white">
    <button id="small-on-purpose" style="position: absolute; top: 40px; left: 40px; width: 24px; height: 24px"></button>
    <button id="narrow-on-purpose" style="position: absolute; top: 120px; left: 40px; width: 30px; height: 44px"></button>
    <button id="large-enough" style="position: absolute; top: 200px; left: 40px; width: 44px; height: 44px"></button>
    <button id="switched-off" style="position: absolute; top: 280px; left: 40px; width: 24px; height: 24px" disabled></button>
    <label style="position: absolute; top: 320px; left: 0; display: grid; place-items: center; width: 300px; height: 48px">
      <input id="inside-its-label" type="checkbox" style="width: 20px; height: 20px">
    </label>
  </div>`;
const TEXTS_ON_PURPOSE = `
  <div style="position: fixed; top: 200px; left: 40px; z-index: 99; width: 300px; background: white">
    <p class="faint-on-purpose" style="color: rgb(160 160 160)">Grey on white</p>
    <p class="see-through-on-purpose" style="color: rgb(0 0 0 / 0.4)">Black at four tenths on white</p>
    <p class="on-a-gradient-on-purpose" style="color: white; background-image: linear-gradient(gold, gold)">White on gold</p>
    <p class="dark-enough" style="color: rgb(90 90 90)">Dark grey on white</p>
    <button class="switched-off" style="color: rgb(200 200 200)" disabled>Switched off</button>
  </div>`;

function nameScreens(walked: string, screens: string[], states: readonly string[]): string[] {
  return states.flatMap((state) => screens.map((screen) => `${walked}-${screen} at ${state}`));
}

function keepScreens(walk: Walk, kept: string[]): Walk {
  return { ...walk, screens: walk.screens.filter((screen) => kept.some((name) => screen.name.endsWith(`-${name}`))) };
}

async function plant(page: Page, markup: string): Promise<void> {
  await page.locator('body').evaluate((body, planted) => body.insertAdjacentHTML('beforeend', planted), markup);
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

  test('the tap measure finds a control made too small on purpose, and leaves out one that is switched off', async ({
    page,
    readyTalk,
  }) => {
    await openReview(page, readyTalk.project.id);
    const before = await findSmallTapAreas(page);

    await plant(page, TAPS_ON_PURPOSE);
    const after = await findSmallTapAreas(page);

    expect(before).toEqual([]);
    expect(after).toEqual([
      'tap area under 44 px, missed left and right and above and below: <button id="small-on-purpose"> ',
      'tap area under 44 px, missed left and right: <button id="narrow-on-purpose"> ',
    ]);
  });

  test('the contrast measure finds a text made too faint on purpose, on a plain colour and on a plain gradient', async ({
    page,
    readyTalk,
  }) => {
    await openReview(page, readyTalk.project.id);
    const before = await findFaintTexts(page);

    await plant(page, TEXTS_ON_PURPOSE);
    const after = await findFaintTexts(page);

    expect(before).toEqual([]);
    expect(after).toEqual([
      '2.61 to 1: <p class="faint-on-purpose"> Grey on white',
      '2.85 to 1: <p class="see-through-on-purpose"> Black at four tenths on white',
      '1.40 to 1: <p class="on-a-gradient-on-purpose"> White on gold',
    ]);
  });

  test('on the talk, every Review screen fits at the normal size and at 200%, with tap areas of 44 px and its last line above the bar', async ({
    page,
    request,
    readyTalk,
  }) => {
    const walk = walkTalkReview(readyTalk, await readProjectList(request));

    const report = await measureFit(page, walk);

    expect(report.misfits).toEqual([]);
    expect(report.measured).toEqual(nameScreens('review', SCREENS, SIZE_NAMES));
  });

  test('on a review of twelve crowded clips, 180 windows and long titles, every Review screen fits the same way', async ({
    page,
    request,
    readyTalk,
  }) => {
    const walk = walkCrowdedReview(readyTalk, await readProjectList(request));

    const report = await measureFit(page, walk);

    expect(report.misfits).toEqual([]);
    expect(report.measured).toEqual(nameScreens('crowded', SCREENS, SIZE_NAMES));
  });

  test('no text of a Review screen measures under 4.5 to 1, in light and in dark, on the talk and on the crowded review', async ({
    page,
    request,
    readyTalk,
  }) => {
    const shownList = await readProjectList(request);

    const onTheTalk = await measureContrast(page, walkTalkReview(readyTalk, shownList));
    const onTheCrowd = await measureContrast(page, walkCrowdedReview(readyTalk, shownList));

    expect(onTheTalk.misfits).toEqual([]);
    expect(onTheCrowd.misfits).toEqual([]);
    expect(onTheTalk.measured).toEqual(nameScreens('review', SCREENS, THEMES));
    expect(onTheCrowd.measured).toEqual(nameScreens('crowded', SCREENS, THEMES));
  });
});

test.describe('at 1360 px', () => {
  test.use({ viewport: DESKTOP });

  test('the list beside a clip and beside the flagged clip holds no text under 4.5 to 1, in light and in dark', async ({
    page,
    request,
    readyTalk,
  }) => {
    const shownList = await readProjectList(request);
    const onTheTalk = keepScreens(walkTalkReview(readyTalk, shownList), SCREENS_BESIDE_THE_LIST);
    const onTheCrowd = keepScreens(walkCrowdedReview(readyTalk, shownList), SCREENS_BESIDE_THE_LIST);

    const reports = [await measureContrast(page, onTheTalk), await measureContrast(page, onTheCrowd)];

    expect(reports.flatMap((report) => report.misfits)).toEqual([]);
    expect(reports[0].measured).toEqual(nameScreens('review', SCREENS_BESIDE_THE_LIST, THEMES));
    expect(reports[1].measured).toEqual(nameScreens('crowded', SCREENS_BESIDE_THE_LIST, THEMES));
  });
});
