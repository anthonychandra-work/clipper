import type { APIRequestContext, Page } from '@playwright/test';

import {
  changeClip,
  expect,
  exportClips,
  keepClips,
  openResults,
  type OutcomeText,
  readOutcome,
  readResults,
  readViewsRows,
  storeViews,
  test,
  typeViews,
  viewsField,
} from './support';

const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1360, height: 900 };
const THREE_CLIPS = ['c01', 'c02', 'c03'];
const SEEDED_VIEWS = [1200, 5400, 48000];
const FIRST_TITLE = 'The worst day my bakery ever had';
const SECOND_TITLE = 'Hire for the habits you cannot teach';
const THIRD_TITLE = 'Almost everyone gets price wrong';
const THREE_EMPTY_ROWS = [
  { rank: '01', title: FIRST_TITLE, views: '', fieldId: 'views-c01' },
  { rank: '02', title: SECOND_TITLE, views: '', fieldId: 'views-c02' },
  { rank: '03', title: THIRD_TITLE, views: '', fieldId: 'views-c03' },
];
const FOOTER =
  'Enter each clip’s views a week after posting. The selector compares them with its own ranking and adjusts what it favours on your next video.';
const WAITING_FOR_TWO: OutcomeText = { line: 'Enter views for at least two clips.', rows: [] };
const SEEDED_SENTENCE = 'The best performer was the selector’s pick number 3. Ranks in order of views: 3, 2, 1.';
const SEEDED_ORDER = [
  [THIRD_TITLE, '48,000'],
  [SECOND_TITLE, '5,400'],
  [FIRST_TITLE, '1,200'],
];

async function storeSeededViews(request: APIRequestContext, projectId: string): Promise<void> {
  for (const [place, clipId] of THREE_CLIPS.entries()) {
    await storeViews(request, { projectId, clipId }, SEEDED_VIEWS[place]);
  }
}

async function typeSeededViews(page: Page): Promise<void> {
  for (const [place, clipId] of THREE_CLIPS.entries()) {
    await typeViews(page, clipId, String(SEEDED_VIEWS[place]));
  }
}

function listTitlesAndViews(outcome: OutcomeText): string[][] {
  return outcome.rows.map((row) => [row.title, row.views]);
}

async function expectTheTwoGroupsOfThePrototype(page: Page): Promise<void> {
  const groups = page.locator('.screen .group-section');
  await expect(groups.locator('.list-header')).toHaveText(['Views After 7 Days', 'Ranking Against Outcome']);
  await expect(groups.first().locator('ol.group.divided > li.views-row')).toHaveCount(THREE_CLIPS.length);
  await expect(groups.first().locator('.list-footer')).toHaveText(FOOTER);
  await expect(groups.last().locator('div#outcome.group.group--padded')).toBeVisible();
}

async function holdSavesBack(page: Page): Promise<() => void> {
  let release = () => {};
  const released = new Promise<void>((settle) => {
    release = settle;
  });
  await page.route('**/api/projects/*/clips/*/views', async (route) => {
    await released;
    await route.continue();
  });
  return release;
}

test.describe('at 1360 px', () => {
  test.use({ viewport: DESKTOP });

  test('a talk with no kept clip shows No Results Yet with Go to Review, and one with a kept clip that is not rendered shows Go to Export', async ({
    page,
    request,
    ownTalk,
  }) => {
    const projectId = ownTalk.project.id;
    const empty = page.locator('.screen .empty');

    await openResults(page, projectId);
    await expect(empty.locator('.empty__title')).toHaveText('No Results Yet');
    await expect(empty.locator('p')).toHaveText('Results appear here after you keep clips and post them.');
    await expect(empty.locator('#results-go-export')).toHaveCount(0);
    await empty.getByRole('link', { name: 'Go to Review' }).click();
    await expect(page).toHaveURL(`/projects/${projectId}/review`);
    await keepClips(request, projectId, ['c01']);
    await openResults(page, projectId);
    await expect(empty.locator('.empty__title')).toHaveText('No Results Yet');
    await expect(empty.locator('#results-go-review')).toHaveCount(0);
    await empty.getByRole('link', { name: 'Go to Export' }).click();

    await expect(page).toHaveURL(`/projects/${projectId}/export`);
  });

  test('with three clips exported the tab lists their rows with empty fields, and the outcome follows a typed number at once and waits for two clips with views', async ({
    page,
    request,
    ownTalk,
  }) => {
    const projectId = ownTalk.project.id;
    await exportClips(request, projectId, THREE_CLIPS);
    await keepClips(request, projectId, ['c04']);
    await openResults(page, projectId);
    const rows = await readViewsRows(page);
    const before = await readOutcome(page);

    await typeViews(page, 'c01', '1200');
    const afterTheFirst = await readOutcome(page);
    const releaseSaves = await holdSavesBack(page);
    await viewsField(page, 'c02').fill('5400');
    await expect(page.locator('#outcome .outcome__row')).toHaveCount(2);
    const afterTheSecond = await readOutcome(page);
    const storedMeanwhile = await readResults(request, projectId);
    releaseSaves();

    expect(rows).toEqual(THREE_EMPTY_ROWS);
    await expectTheTwoGroupsOfThePrototype(page);
    expect([before, afterTheFirst]).toEqual([WAITING_FOR_TWO, WAITING_FOR_TWO]);
    expect(afterTheSecond.line).toBe(
      'The best performer was the selector’s pick number 2. Ranks in order of views: 2, 1.',
    );
    expect(listTitlesAndViews(afterTheSecond)).toEqual(SEEDED_ORDER.slice(1));
    expect(storedMeanwhile.clips.map((clip) => clip.views)).toEqual([1200, null, null]);
  });

  test('the seeded views are listed by their views under the sentence with the longest bar first, and are all there after a reload', async ({
    page,
    request,
    ownTalk,
  }) => {
    const projectId = ownTalk.project.id;
    await exportClips(request, projectId, THREE_CLIPS);
    await openResults(page, projectId);

    await typeSeededViews(page);
    const typed = await readOutcome(page);
    await page.reload();
    await expect(viewsField(page, 'c03')).toHaveValue('48000');
    const reloaded = await readOutcome(page);
    const fields = (await readViewsRows(page)).map((row) => row.views);
    const stored = await readResults(request, projectId);

    expect(typed.line).toBe(SEEDED_SENTENCE);
    expect(listTitlesAndViews(typed)).toEqual(SEEDED_ORDER);
    expect(typed.rows[0].shareOfTrack).toBeCloseTo(1, 2);
    expect(typed.rows[1].shareOfTrack).toBeCloseTo(0.1125, 2);
    expect(typed.rows[2].shareOfTrack).toBeGreaterThan(0.02);
    expect(typed.rows[2].shareOfTrack).toBeLessThan(0.03);
    expect([reloaded.line, listTitlesAndViews(reloaded)]).toEqual([SEEDED_SENTENCE, SEEDED_ORDER]);
    expect(fields).toEqual(['1200', '5400', '48000']);
    expect(stored.clips.map((clip) => clip.views)).toEqual(SEEDED_VIEWS);
  });

  test('90000 for the first pick names it best, and an emptied field and a typed 0 each take their clip out of the outcome, also after a reload', async ({
    page,
    request,
    ownTalk,
  }) => {
    const projectId = ownTalk.project.id;
    await exportClips(request, projectId, THREE_CLIPS);
    await storeSeededViews(request, projectId);
    await openResults(page, projectId);

    await typeViews(page, 'c01', '90000');
    const withTheFirstAhead = await readOutcome(page);
    await typeViews(page, 'c02', '');
    const withoutTheSecond = await readOutcome(page);
    await typeViews(page, 'c03', '0');
    const withoutTheThird = await readOutcome(page);
    await page.reload();
    await expect(viewsField(page, 'c01')).toHaveValue('90000');
    const reloaded = await readOutcome(page);
    const fields = (await readViewsRows(page)).map((row) => row.views);

    expect(withTheFirstAhead.line).toBe('The selector’s first pick performed best. Ranks in order of views: 1, 3, 2.');
    expect(withoutTheSecond.line).toBe('The selector’s first pick performed best. Ranks in order of views: 1, 3.');
    expect(listTitlesAndViews(withoutTheSecond)).toEqual([
      [FIRST_TITLE, '90,000'],
      [THIRD_TITLE, '48,000'],
    ]);
    expect([withoutTheThird, reloaded]).toEqual([WAITING_FOR_TWO, WAITING_FOR_TWO]);
    expect(fields).toEqual(['90000', '', '']);
    expect((await readResults(request, projectId)).clips.map((clip) => clip.views)).toEqual([90000, null, null]);
  });

  test('a clip rejected after its export keeps its row and its views', async ({ page, request, ownTalk }) => {
    const projectId = ownTalk.project.id;
    await exportClips(request, projectId, ['c03']);
    await storeViews(request, { projectId, clipId: 'c03' }, 48000);

    await changeClip(request, { projectId, clipId: 'c03' }, { decision: 'reject', rejectReason: 'repeat' });
    await openResults(page, projectId);

    expect(await readViewsRows(page)).toEqual([{ ...THREE_EMPTY_ROWS[2], views: '48000' }]);
    expect((await readResults(request, projectId)).clips).toEqual([
      { id: 'c03', rank: 3, title: THIRD_TITLE, views: 48000 },
    ]);
  });
});

test.describe('at 390 px', () => {
  test.use({ viewport: PHONE });

  test('on a phone the tab lists the same rows, and a number typed there is stored', async ({
    page,
    request,
    ownTalk,
  }) => {
    const projectId = ownTalk.project.id;
    await exportClips(request, projectId, THREE_CLIPS);
    await openResults(page, projectId);
    const rows = await readViewsRows(page);

    await typeViews(page, 'c02', '5400');
    await page.reload();
    await expect(viewsField(page, 'c02')).toHaveValue('5400');

    expect(rows).toEqual(THREE_EMPTY_ROWS);
    await expect(page.locator('#outcome .list-footer')).toHaveText(WAITING_FOR_TWO.line);
    expect((await readResults(request, projectId)).clips.map((clip) => clip.views)).toEqual([null, 5400, null]);
  });
});
