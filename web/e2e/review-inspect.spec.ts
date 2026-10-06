import type { Page } from '@playwright/test';

import type { Review, ReviewClip } from '@/review';

import { candidateRow, expect, openReview, readCandidateRows, readInspector, readReview, test } from './support';

const DESKTOP = { width: 1360, height: 900 };
const STANDING_SENTENCE = 'The score orders clips inside this video. It does not forecast views.';
const REPLAY_NOTE = 'Replay peak. Viewers of the source video rewatched this part more than the rest.';
const TYPED_TITLE = '  Hire the calm one  ';

function wordScores(clip: ReviewClip): string[] {
  const { hook, arc, value, share } = clip.scores;
  return [`Hook ${hook}/25`, `Arc ${arc}/25`, `Value ${value}/25`, `Share ${share}/25`];
}

function listScoreShares(clip: ReviewClip): number[] {
  return [clip.scores.hook, clip.scores.arc, clip.scores.value, clip.scores.share].map((points) => points / 25);
}

function waitForSavedClip(page: Page, clipId: string): Promise<unknown> {
  return page.waitForResponse(
    (answer) => answer.url().endsWith(`/clips/${clipId}`) && answer.request().method() === 'PATCH' && answer.ok(),
  );
}

async function presentUnderReplayPeak(page: Page, clipId: string): Promise<void> {
  await page.route('**/api/projects/*/review', async (route) => {
    const answer = await route.fetch();
    const review: Review = await answer.json();
    const clips = review.clips.map((clip) => (clip.id === clipId ? { ...clip, isReplayPeak: true } : clip));
    await route.fulfill({ response: answer, json: { ...review, clips } });
  });
}

async function readRowTitle(page: Page, clipId: string): Promise<string> {
  const rows = await readCandidateRows(page);
  return rows.find((row) => row.id === clipId)?.title ?? '';
}

test.use({ viewport: DESKTOP });

test('choosing a candidate shows its reason, its four subscores, its total and its rank as the service holds them', async ({
  page,
  readyTalk,
}) => {
  const third = readyTalk.review.clips[2];
  await openReview(page, readyTalk.project.id);

  await candidateRow(page, 'c03').click();
  await expect(page).toHaveURL(`/projects/${readyTalk.project.id}/review/c03`);
  await expect(page.locator('#clip-title')).toHaveValue(third.title);
  const inspector = await readInspector(page);

  expect([third.id, third.rank, third.total]).toEqual(['c03', 3, 82]);
  expect(inspector.reason).toBe(third.reason);
  expect(inspector.scores).toEqual(wordScores(third));
  expect(inspector.scores).toEqual(['Hook 21/25', 'Arc 20/25', 'Value 22/25', 'Share 19/25']);
  expect(inspector.scoreShares.map((share) => share.toFixed(2))).toEqual(
    listScoreShares(third).map((share) => share.toFixed(2)),
  );
  expect(inspector.standing).toBe(`82 of 100, rank 3 of 6. ${STANDING_SENTENCE}`);
  expect(inspector.flag).toBeNull();
  expect(inspector.replayNote).toBeNull();
});

test('each candidate shows its own reason and standing, the first without being chosen', async ({ page, readyTalk }) => {
  await openReview(page, readyTalk.project.id);
  const shownFirst = await readInspector(page);
  await candidateRow(page, 'c06').click();
  await expect(page.locator('#clip-title')).toHaveValue(readyTalk.review.clips[5].title);

  const shownLast = await readInspector(page);

  expect(shownFirst.reason).toBe(readyTalk.review.clips[0].reason);
  expect(shownFirst.standing).toBe(`88 of 100, rank 1 of 6. ${STANDING_SENTENCE}`);
  expect(shownFirst.title).toBe('The worst day my bakery ever had');
  expect(shownLast.reason).toBe(readyTalk.review.clips[5].reason);
  expect(shownLast.scores).toEqual(wordScores(readyTalk.review.clips[5]));
  expect(shownLast.standing).toBe(`55 of 100, rank 6 of 6. ${STANDING_SENTENCE}`);
});

test('the clip that needs context and the one that is not recommended each show their flag’s sentence', async ({
  page,
  readyTalk,
}) => {
  const [, , , needsContext, , notRecommended] = readyTalk.review.clips;
  await page.goto(`/projects/${readyTalk.project.id}/review/c04`);
  await expect(page.locator('#clip-title')).toHaveValue(needsContext.title);
  const fourth = await readInspector(page);

  await candidateRow(page, 'c06').click();
  await expect(page.locator('#clip-title')).toHaveValue(notRecommended.title);
  const sixth = await readInspector(page);
  await candidateRow(page, 'c01').click();
  await expect(page.locator('#clip-title')).toHaveValue(readyTalk.review.clips[0].title);

  expect([needsContext.flag, notRecommended.flag]).toEqual(['needs-context', 'not-recommended']);
  expect(fourth.flag).toBe(needsContext.flagNote);
  expect(sixth.flag).toBe(notRecommended.flagNote);
  expect(fourth.flag).not.toBe(sixth.flag);
  await expect(page.locator('.inspector .flag')).toHaveCount(0);
});

test('a title typed into the field is in the list at once, and in the field and the list after a reload', async ({
  page,
  request,
  readyTalk,
}) => {
  await page.goto(`/projects/${readyTalk.project.id}/review/c02`);
  const field = page.getByLabel('Title');
  await expect(field).toHaveValue('Hire for the habits you cannot teach');
  const saved = waitForSavedClip(page, 'c02');

  await field.fill(TYPED_TITLE);
  const inTheListAtOnce = await readRowTitle(page, 'c02');
  await saved;
  await page.reload();
  await expect(page.getByLabel('Title')).toHaveValue('Hire the calm one');

  const stored = await readReview(request, readyTalk.project.id);
  expect(inTheListAtOnce).toBe(TYPED_TITLE.trim());
  expect(await readRowTitle(page, 'c02')).toBe('Hire the calm one');
  expect(stored.clips[1].title).toBe('Hire the calm one');
  expect(stored.clips.filter((clip) => clip.id !== 'c02').map((clip) => clip.title)).toEqual(
    readyTalk.review.clips.filter((clip) => clip.id !== 'c02').map((clip) => clip.title),
  );
});

test('a title is saved when the field is left, without waiting, and emptying the field brings back selection’s title', async ({
  page,
  request,
  readyTalk,
}) => {
  await page.goto(`/projects/${readyTalk.project.id}/review/c02`);
  const field = page.getByLabel('Title');
  await expect(field).toHaveValue('Hire for the habits you cannot teach');
  const savedOnLeaving = waitForSavedClip(page, 'c02');
  await field.fill('Hire the calm one');
  await field.blur();
  await savedOnLeaving;
  const afterLeaving = (await readReview(request, readyTalk.project.id)).clips[1].title;

  const savedEmpty = waitForSavedClip(page, 'c02');
  await field.fill('');
  await savedEmpty;
  await expect(candidateRow(page, 'c02').locator('.candidate__title')).toHaveText(
    'Hire for the habits you cannot teach',
  );
  await field.blur();

  expect(afterLeaving).toBe('Hire the calm one');
  await expect(field).toHaveValue('Hire for the habits you cannot teach');
  expect((await readReview(request, readyTalk.project.id)).clips[1].title).toBe('Hire for the habits you cannot teach');
});

test('a clip presented as lying under a replay peak shows the tag in the list and the note in the inspector', async ({
  page,
  readyTalk,
}) => {
  await presentUnderReplayPeak(page, 'c02');
  await page.goto(`/projects/${readyTalk.project.id}/review/c02`);
  await expect(page.locator('#clip-title')).toHaveValue(readyTalk.review.clips[1].title);

  const rows = await readCandidateRows(page);
  const inspector = await readInspector(page);

  expect(rows.map((row) => row.tags.includes('Replay peak'))).toEqual([false, true, false, false, false, false]);
  expect(rows[1].tags).toEqual(['Contrarian', 'Replay peak']);
  expect(inspector.replayNote).toBe(REPLAY_NOTE);
  expect(inspector.standing).toBe(`84 of 100, rank 2 of 6. ${STANDING_SENTENCE}`);
});
