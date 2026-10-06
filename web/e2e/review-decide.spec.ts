import type { Page } from '@playwright/test';

import {
  candidateRow,
  changeClip,
  expect,
  openRejectMenu,
  projectRow,
  readCandidateRows,
  readDecisionButtons,
  readFilterCounts,
  readRejectMenu,
  readReview,
  readTimelinePins,
  rejectAs,
  rejectMenu,
  test,
} from './support';

const DESKTOP = { width: 1360, height: 900 };
const MENU_TITLE = 'Why? The selector uses the reason when it picks clips from your next video.';
const FIVE_CHOICES = [
  { label: 'Cut Off Mid-Thought', stored: 'cut-off' },
  { label: 'Not Interesting', stored: 'not-interesting' },
  { label: 'Needs Earlier Context', stored: 'needs-context' },
  { label: 'Repeats Another Clip', stored: 'repeat' },
  { label: 'No Reason', stored: null },
];
const UNDECIDED = { reject: 'Reject', isRejectMarked: false, keep: 'Keep', isKeepPressed: false };
const KEPT = { reject: 'Reject', isRejectMarked: false, keep: 'Kept', isKeepPressed: true };
const REJECTED = { reject: 'Rejected', isRejectMarked: true, keep: 'Keep', isKeepPressed: false };

async function openClip(page: Page, projectId: string, clipId: string): Promise<void> {
  await page.goto(`/projects/${projectId}/review/${clipId}`);
  await expect(candidateRow(page, clipId)).toHaveAttribute('aria-current', 'true');
}

async function chooseClip(page: Page, clipId: string): Promise<void> {
  await candidateRow(page, clipId).click();
  await expect(candidateRow(page, clipId)).toHaveAttribute('aria-current', 'true');
}

function waitForStoredClip(page: Page): Promise<unknown> {
  return page.waitForResponse(
    (answer) => /\/clips\/c\d+$/.test(answer.url()) && answer.request().method() === 'PATCH' && answer.ok(),
  );
}

async function pressAndStore(page: Page, press: () => Promise<void>): Promise<void> {
  const stored = waitForStoredClip(page);
  await press();
  await stored;
}

async function readFirstClipEverywhere(page: Page) {
  const [row] = await readCandidateRows(page);
  const pin = page.locator('#pin-c01');
  return {
    buttons: await readDecisionButtons(page),
    tags: row.tags,
    pinClass: ((await pin.getAttribute('class')) ?? '').match(/timeline__pin--(keep|reject|undecided)/)?.[1],
    pinLabel: await pin.getAttribute('aria-label'),
    filters: await readFilterCounts(page),
  };
}

async function pressNext(page: Page, times: number): Promise<string[]> {
  const visited: string[] = [];
  for (let press = 0; press < times; press += 1) {
    const before = page.url();
    await page.locator('#decision-next').click();
    await expect(page).not.toHaveURL(before);
    visited.push(new URL(page.url()).pathname.split('/').pop() ?? '');
  }
  return visited;
}

async function keepFirstRejectSecondRenameThird(page: Page, projectId: string): Promise<void> {
  await openClip(page, projectId, 'c01');
  await pressAndStore(page, () => page.locator('#decision-keep').click());
  await chooseClip(page, 'c02');
  await pressAndStore(page, () => rejectAs(page, 'Not Interesting'));
  await chooseClip(page, 'c03');
  await page.getByLabel('Title').fill('Price by your own costs');
  await pressAndStore(page, () => page.getByLabel('Title').blur());
}

test.use({ viewport: DESKTOP });

test('Reject, Keep and Next sit in the toolbar after the More button', async ({ page, readyTalk }) => {
  await openClip(page, readyTalk.project.id, 'c01');

  const controls = page.locator('.toolbar__trailing > *');

  await expect(controls).toHaveText(['', 'Reject', 'Keep', 'Next']);
  await expect(controls.first()).toHaveAttribute('aria-label', 'More');
  expect(await readDecisionButtons(page)).toMatchObject({
    ...UNDECIDED,
    next: 'Next',
    nextAddress: `/projects/${readyTalk.project.id}/review/c02`,
  });
  await expect(page.locator('#decision-keep')).toHaveClass(/bar-button--tinted/);
  await expect(page.locator('#decision-next')).not.toHaveClass(/bar-button--tinted/);
});

test('Keep keeps the clip at once in the buttons, the row, the pin and the counts, and Keep again leaves it undecided', async ({
  page,
  request,
  readyTalk,
}) => {
  await openClip(page, readyTalk.project.id, 'c01');

  await pressAndStore(page, () => page.locator('#decision-keep').click());
  const kept = await readFirstClipEverywhere(page);
  const storedKept = (await readReview(request, readyTalk.project.id)).clips[0].decision;
  await pressAndStore(page, () => page.locator('#decision-keep').click());
  const again = await readFirstClipEverywhere(page);

  expect(kept.buttons).toMatchObject(KEPT);
  expect(kept).toMatchObject({ tags: ['Story', 'Kept'], pinClass: 'keep', pinLabel: 'Clip ranked 1, at 00:00:11, kept' });
  expect(kept.filters).toEqual(['All6', 'To Do5', 'Kept1', 'Rejected0']);
  expect(storedKept).toBe('keep');
  expect(again.buttons).toMatchObject(UNDECIDED);
  expect(again).toMatchObject({ tags: ['Story'], pinClass: 'undecided', filters: ['All6', 'To Do6', 'Kept0', 'Rejected0'] });
  expect((await readReview(request, readyTalk.project.id)).clips[0].decision).toBe('undecided');
});

test('Reject opens the menu of four reasons and No Reason under its heading, and a kept clip has no Undo Reject', async ({
  page,
  readyTalk,
}) => {
  await openClip(page, readyTalk.project.id, 'c01');
  await pressAndStore(page, () => page.locator('#decision-keep').click());

  await openRejectMenu(page);
  const menu = await readRejectMenu(page);

  expect(menu).toEqual({
    label: 'Reject this clip',
    title: MENU_TITLE,
    choices: FIVE_CHOICES.map((choice) => choice.label),
    chosen: [],
    others: [],
    dividers: 1,
  });
  await expect(page.locator('#decision-reject')).toHaveAttribute('aria-expanded', 'true');
});

test('each of the five choices rejects the clip with it, and carries the tick when the menu is opened again', async ({
  page,
  request,
  readyTalk,
}) => {
  await openClip(page, readyTalk.project.id, 'c02');
  const ticked: string[][] = [];
  const stored: (string | null)[] = [];

  for (const choice of FIVE_CHOICES) {
    await pressAndStore(page, () => rejectAs(page, choice.label));
    await openRejectMenu(page);
    ticked.push((await readRejectMenu(page)).chosen);
    await page.keyboard.press('Escape');
    stored.push((await readReview(request, readyTalk.project.id)).clips[1].rejectReason);
  }

  expect(ticked).toEqual(FIVE_CHOICES.map((choice) => [choice.label]));
  expect(stored).toEqual(FIVE_CHOICES.map((choice) => choice.stored));
  expect(await readDecisionButtons(page)).toMatchObject(REJECTED);
  expect((await readCandidateRows(page))[1].tags).toEqual(['Contrarian', 'Rejected']);
  expect(await readFilterCounts(page)).toEqual(['All6', 'To Do5', 'Kept0', 'Rejected1']);
});

test('the menu of a rejected clip also offers Undo Reject, which leaves the clip undecided', async ({
  page,
  request,
  readyTalk,
}) => {
  await openClip(page, readyTalk.project.id, 'c01');
  await pressAndStore(page, () => rejectAs(page, 'Cut Off Mid-Thought'));
  const rejected = await readFirstClipEverywhere(page);

  const menu = await openRejectMenu(page);
  const offered = await readRejectMenu(page);
  await pressAndStore(page, () => menu.getByRole('menuitem', { name: 'Undo Reject' }).click());
  const undone = await readFirstClipEverywhere(page);

  expect(rejected.buttons).toMatchObject(REJECTED);
  expect(rejected).toMatchObject({ tags: ['Story', 'Rejected'], pinClass: 'reject' });
  expect(rejected.pinLabel).toBe('Clip ranked 1, at 00:00:11, rejected');
  expect(offered).toMatchObject({ chosen: ['Cut Off Mid-Thought'], others: ['Undo Reject'], dividers: 2 });
  expect(undone.buttons).toMatchObject(UNDECIDED);
  expect(undone).toMatchObject({ tags: ['Story'], filters: ['All6', 'To Do6', 'Kept0', 'Rejected0'] });
  expect((await readReview(request, readyTalk.project.id)).clips[0]).toMatchObject({
    decision: 'undecided',
    rejectReason: null,
  });
});

test('Next goes through the six clips and back to the first, and through the two of a filter’s group', async ({
  page,
  request,
  readyTalk,
}) => {
  const projectId = readyTalk.project.id;
  await changeClip(request, { projectId, clipId: 'c02' }, { decision: 'keep' });
  await changeClip(request, { projectId, clipId: 'c05' }, { decision: 'keep' });
  await openClip(page, projectId, 'c01');

  const throughAll = await pressNext(page, 6);
  await page.getByRole('group', { name: 'Show' }).getByRole('button', { name: 'Kept' }).click();
  const group = (await readCandidateRows(page)).map((row) => row.id);
  const throughKept = await pressNext(page, 3);
  await page.goBack();

  expect(throughAll).toEqual(['c02', 'c03', 'c04', 'c05', 'c06', 'c01']);
  expect(group).toEqual(['c02', 'c05']);
  expect(throughKept).toEqual(['c02', 'c05', 'c02']);
  await expect(page).toHaveURL(`/projects/${projectId}/review/c05`);
  expect((await readTimelinePins(page)).filter((pin) => pin.isCurrent).map((pin) => pin.id)).toEqual(['c05']);
});

test('the menu opens with the keyboard on the reason that was chosen, moves with the arrows and closes with Escape', async ({
  page,
  readyTalk,
}) => {
  await openClip(page, readyTalk.project.id, 'c03');
  await pressAndStore(page, () => rejectAs(page, 'Needs Earlier Context'));

  await page.locator('#decision-reject').focus();
  await page.keyboard.press('Enter');
  await expect(rejectMenu(page)).toBeVisible();
  const focusedOnOpening = await page.evaluate(() => document.activeElement?.id);
  await page.keyboard.press('ArrowDown');
  const focusedAfterArrow = await page.evaluate(() => document.activeElement?.id);
  await page.keyboard.press('Escape');

  await expect(rejectMenu(page)).toHaveCount(0);
  expect(focusedOnOpening).toBe('reject-reason-needs-context');
  expect(focusedAfterArrow).toBe('reject-reason-repeat');
  expect(await page.evaluate(() => document.activeElement?.id)).toBe('decision-reject');
  expect(await readDecisionButtons(page)).toMatchObject(REJECTED);
});

test('a kept clip, a rejected clip with its reason and an edited title are still there after a reload, and the counts match', async ({
  page,
  request,
  readyTalk,
}) => {
  const projectId = readyTalk.project.id;
  await keepFirstRejectSecondRenameThird(page, projectId);
  await expect(page.locator('#tab-export .segmented__count')).toHaveText('1');

  await page.reload();
  await expect(candidateRow(page, 'c03')).toHaveAttribute('aria-current', 'true');
  const rows = await readCandidateRows(page);
  const filters = await readFilterCounts(page);
  await page.getByRole('group', { name: 'Show' }).getByRole('button', { name: 'Kept' }).click();

  const stored = (await readReview(request, projectId)).clips;
  expect(rows.slice(0, 3).map((row) => row.tags)).toEqual([['Story', 'Kept'], ['Contrarian', 'Rejected'], ['Hot take']]);
  expect(rows[2].title).toBe('Price by your own costs');
  expect(stored.slice(0, 3).map((clip) => [clip.decision, clip.rejectReason, clip.title])).toEqual([
    ['keep', null, 'The worst day my bakery ever had'],
    ['reject', 'not-interesting', 'Hire for the habits you cannot teach'],
    ['undecided', null, 'Price by your own costs'],
  ]);
  expect(filters).toEqual(['All6', 'To Do4', 'Kept1', 'Rejected1']);
  expect((await readCandidateRows(page)).map((row) => row.id)).toEqual(['c01']);
  await expect(page.locator('#tab-export .segmented__count')).toHaveText('1');
  await expect(projectRow(page, projectId).locator('.project-row__status')).toHaveText(
    'Ready to review · 6 candidates, 1 kept, 1 rejected',
  );
});
