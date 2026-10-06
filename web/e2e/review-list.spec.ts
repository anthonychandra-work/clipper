import type { Page } from '@playwright/test';

import type { ReviewClip } from '@/review';

import {
  candidateRow,
  type CandidateRowText,
  expect,
  listCurrentRows,
  openReview,
  readCandidateRows,
  readFilterCounts,
  test,
} from './support';

const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1360, height: 900 };
const SHORT_DESKTOP = { width: 1360, height: 460 };
const SCORE_SENTENCE = 'The score orders clips inside this video. It does not forecast views.';
const SIX_CLIPS_AS_CUT = [
  { rank: '01', title: 'The worst day my bakery ever had', tags: ['Story'], score: '88' },
  { rank: '02', title: 'Hire for the habits you cannot teach', tags: ['Contrarian'], score: '84' },
  { rank: '03', title: 'Almost everyone gets price wrong', tags: ['Hot take'], score: '82' },
  {
    rank: '04',
    title: 'The hotel order that almost ended the business',
    tags: ['Confession', 'Needs context'],
    score: '82',
  },
  { rank: '05', title: 'How to know when it is time to grow', tags: ['Hot take'], score: '75' },
  { rank: '06', title: 'The smallest lesson is to write things down', tags: ['No hook', 'Not recommended'], score: '55' },
];

function padTwo(value: number): string {
  return String(Math.floor(value)).padStart(2, '0');
}

function wordStartAndLength(clip: ReviewClip): string {
  const start = `${padTwo(clip.startSeconds / 3600)}:${padTwo((clip.startSeconds % 3600) / 60)}:${padTwo(clip.startSeconds % 60)}`;
  const hundredths = Math.round(clip.endSeconds * 100) - Math.round(clip.startSeconds * 100);
  return `${start} · ${(hundredths / 100).toFixed(1)} s`;
}

function pickWords(row: CandidateRowText) {
  return { rank: row.rank, title: row.title, tags: row.tags, score: row.score };
}

async function markListPane(page: Page): Promise<void> {
  await page.locator('.pane--list').evaluate((pane) => {
    pane.setAttribute('data-kept-since', 'the list was opened');
    pane.scrollTop = pane.scrollHeight;
  });
}

function readListPane(page: Page): Promise<{ keptSince: string | null; scrollTop: number }> {
  return page
    .locator('.pane--list')
    .evaluate((pane) => ({ keptSince: pane.getAttribute('data-kept-since'), scrollTop: pane.scrollTop }));
}

test.describe('at 1360 px', () => {
  test.use({ viewport: DESKTOP });

  test('the list holds the talk’s six clips in the order of their ranks under filters that read 6, 6, 0 and 0', async ({
    page,
    readyTalk,
  }) => {
    await openReview(page, readyTalk.project.id);

    const rows = await readCandidateRows(page);
    const list = page.locator('section[aria-labelledby="candidates-heading"]');

    expect(rows.map(pickWords)).toEqual(SIX_CLIPS_AS_CUT);
    expect(rows.map((row) => row.meta)).toEqual(readyTalk.review.clips.map(wordStartAndLength));
    expect(rows.map((row) => row.meta)[0]).toBe('00:00:11 · 32.8 s');
    expect(rows.map((row) => row.score)).toEqual(readyTalk.review.clips.map((clip) => String(clip.total)));
    expect(rows.map((row) => row.address)).toEqual(
      readyTalk.review.clips.map((clip) => `/projects/${readyTalk.project.id}/review/${clip.id}`),
    );
    expect(await readFilterCounts(page)).toEqual(['All6', 'To Do6', 'Kept0', 'Rejected0']);
    await expect(list.locator('h2')).toHaveText('Candidates');
    await expect(list.locator('.list-footer')).toHaveText(SCORE_SENTENCE);
  });

  test('the Review address shows the list beside the first-ranked clip, and the list pane beside the detail pane', async ({
    page,
    readyTalk,
  }) => {
    await openReview(page, readyTalk.project.id);

    const listBox = await page.locator('.split .pane--list').boundingBox();
    const detailBox = await page.locator('.split .pane--detail#clip-detail').boundingBox();

    expect(await listCurrentRows(page)).toEqual(['c01']);
    await expect(page.locator('.candidate.is-selected')).toHaveCount(1);
    await expect(page.locator('#tab-review')).toHaveAttribute('aria-current', 'page');
    expect(listBox?.x ?? 0).toBeLessThan(detailBox?.x ?? 0);
    expect((listBox?.x ?? 0) + (listBox?.width ?? 0)).toBeLessThanOrEqual((detailBox?.x ?? 0) + 1);
  });

  test('a row leads to its clip’s address and is marked there, a reload keeps both, and Back returns to the clip before', async ({
    page,
    readyTalk,
  }) => {
    const review = `/projects/${readyTalk.project.id}/review`;
    await openReview(page, readyTalk.project.id);
    await candidateRow(page, 'c02').click();
    await expect(page).toHaveURL(`${review}/c02`);

    await candidateRow(page, 'c03').click();
    await expect(page).toHaveURL(`${review}/c03`);
    const afterTheRow = await listCurrentRows(page);
    await page.reload();
    await expect(candidateRow(page, 'c03')).toHaveAttribute('aria-current', 'true');
    const afterTheReload = [page.url(), ...(await listCurrentRows(page))];
    await page.goBack();
    await expect(candidateRow(page, 'c02')).toHaveAttribute('aria-current', 'true');

    expect(afterTheRow).toEqual(['c03']);
    expect(afterTheReload).toEqual([expect.stringMatching(/\/review\/c03$/), 'c03']);
    expect([new URL(page.url()).pathname, ...(await listCurrentRows(page))]).toEqual([`${review}/c02`, 'c02']);
  });

  test('an address that names no clip of the project leads to the list', async ({ page, readyTalk }) => {
    await page.goto(`/projects/${readyTalk.project.id}/review/c99`);

    await expect(page).toHaveURL(`/projects/${readyTalk.project.id}/review`);
    await expect(candidateRow(page, 'c01')).toHaveAttribute('aria-current', 'true');
    expect(await listCurrentRows(page)).toEqual(['c01']);
  });

  test('the Library address shows the Review tab of the newest project with its first clip marked', async ({
    page,
    readyTalk,
  }) => {
    await page.goto('/');

    await expect(page.locator('.toolbar__title')).toHaveText(readyTalk.project.title);
    await expect(candidateRow(page, 'c01')).toHaveAttribute('aria-current', 'true');
    expect(await listCurrentRows(page)).toEqual(['c01']);
    expect((await readCandidateRows(page)).map((row) => row.id)).toEqual(['c01', 'c02', 'c03', 'c04', 'c05', 'c06']);
    await expect(page.locator('#tab-review')).toHaveAttribute('aria-current', 'page');
  });

  test.describe('in a short window', () => {
    test.use({ viewport: SHORT_DESKTOP });

    test('the list pane stays in place, where it was scrolled to, while the address moves from clip to clip', async ({
      page,
      readyTalk,
    }) => {
      await openReview(page, readyTalk.project.id);
      await markListPane(page);
      const scrolledTo = (await readListPane(page)).scrollTop;

      await candidateRow(page, 'c05').click();
      await expect(page).toHaveURL(`/projects/${readyTalk.project.id}/review/c05`);
      await candidateRow(page, 'c06').click();
      await expect(candidateRow(page, 'c06')).toHaveAttribute('aria-current', 'true');

      expect(scrolledTo).toBeGreaterThan(0);
      expect(await readListPane(page)).toEqual({ keptSince: 'the list was opened', scrollTop: scrolledTo });
    });
  });
});

test.describe('at 390 px', () => {
  test.use({ viewport: PHONE });

  test('the Review address is the list under the project’s title and tabs, with no clip open', async ({
    page,
    readyTalk,
  }) => {
    await openReview(page, readyTalk.project.id);

    await expect(page.locator('h1.large-title')).toHaveText(readyTalk.project.title);
    await expect(page.locator('.screen-head .segmented #tab-review')).toHaveAttribute('aria-current', 'page');
    expect((await readCandidateRows(page)).map(pickWords)).toEqual(SIX_CLIPS_AS_CUT);
    expect(await listCurrentRows(page)).toEqual([]);
    await expect(page.locator('#clip-detail')).toHaveCount(0);
    await expect(page.locator('.tab-bar')).toBeVisible();
  });

  test('a row leads to a screen titled “Clip 3 of 6” whose back control returns to the list', async ({
    page,
    readyTalk,
  }) => {
    const review = `/projects/${readyTalk.project.id}/review`;
    await openReview(page, readyTalk.project.id);

    await candidateRow(page, 'c03').click();
    await expect(page).toHaveURL(`${review}/c03`);
    await expect(page.locator('h1.toolbar__title')).toHaveText('Clip 3 of 6');
    const back = page.locator('#toolbar-back');
    await expect(back).toHaveText('Clips');
    await expect(page.locator('#clip-detail')).toBeVisible();
    await expect(page.locator('.candidate__open')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'More' })).toHaveCount(0);
    await back.click();

    await expect(page).toHaveURL(review);
    await expect(page.locator('h1.large-title')).toHaveText(readyTalk.project.title);
    expect((await readCandidateRows(page)).map((row) => row.id)).toEqual(['c01', 'c02', 'c03', 'c04', 'c05', 'c06']);
  });
});
