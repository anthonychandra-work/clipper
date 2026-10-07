import type { Page } from '@playwright/test';

import {
  candidateRow,
  expect,
  openPreview,
  openRejectMenu,
  openReview,
  type PreviewText,
  readBottomBar,
  readDock,
  readPreview,
  readReview,
  readWindowTop,
  type ReadyTalk,
  scrollWindowTo,
  test,
} from './support';

const PHONE = { width: 390, height: 844 };
const LIST_LEFT_AT_PX = 180;
const PAST_THE_PREVIEW_PX = 620;
const PLAYED_SECONDS = 0.4;
const PLAY_BUTTON = '#preview-play';
const DECISION_CONTROLS = ['decision-reject', 'decision-keep', 'decision-next'];
const STRIP_PARTS = ['.player', '#preview-play', '#preview-scrubber', '#preview-clock'];

function reviewPage(talk: ReadyTalk): string {
  return `/projects/${talk.project.id}/review`;
}

async function readTops(page: Page, parts: string[]): Promise<number[]> {
  const tops: number[] = [];
  for (const part of parts) {
    tops.push((await page.locator(part).first().boundingBox())?.y ?? Number.NaN);
  }
  return tops;
}

async function readVideoTime(page: Page): Promise<number> {
  return (await readPreview(page)).videoTime;
}

async function openClipFromList(page: Page, talk: ReadyTalk, clipId: string): Promise<void> {
  await candidateRow(page, clipId).click();
  await expect(page).toHaveURL(`${reviewPage(talk)}/${clipId}`);
  await expect(page.locator('#clip-detail')).toBeVisible();
}

async function pauseThenPlayAgain(page: Page): Promise<PreviewText> {
  await page.locator(PLAY_BUTTON).click();
  await expect(page.locator(PLAY_BUTTON)).toHaveAttribute('aria-label', 'Play');
  const whenPaused = await readPreview(page);
  await page.locator(PLAY_BUTTON).click();
  await expect.poll(() => readVideoTime(page)).toBeGreaterThan(whenPaused.videoTime + PLAYED_SECONDS);
  return whenPaused;
}

test.use({ viewport: PHONE });

test('the Review address shows the candidate list first, above the source timeline, with no preview on the screen', async ({
  page,
  readyTalk,
}) => {
  await openReview(page, readyTalk.project.id);

  const [candidatesTop, timelineTop] = await readTops(page, ['#candidates-heading', '.timeline__card']);

  expect(candidatesTop).toBeLessThan(timelineTop);
  expect(candidatesTop).toBeLessThan(PHONE.height);
  await expect(page.locator('.candidate__open')).toHaveCount(6);
  await expect(page.locator('section.preview')).toHaveCount(0);
  await expect(page.locator('#clip-detail')).toHaveCount(0);
  await expect(page.locator('#app')).toHaveAttribute('data-preview', 'inline');
  expect(await readBottomBar(page)).toMatchObject({ position: 'none', tabBars: 1 });
});

test('a row opens the clip’s screen at its top with the preview, the inspector and a bar of Reject, Keep and Next fixed to the bottom, and the back control returns to the list with the tab bar', async ({
  page,
  readyTalk,
}) => {
  await openReview(page, readyTalk.project.id);
  const listTop = await scrollWindowTo(page, LIST_LEFT_AT_PX);

  await openClipFromList(page, readyTalk, 'c03');
  const clipTop = await readWindowTop(page);
  const [previewTop, inspectorTop] = await readTops(page, ['section.preview', 'section.inspector']);
  const bar = await readBottomBar(page);
  await page.locator('#toolbar-back').click();
  await expect(page).toHaveURL(reviewPage(readyTalk));

  expect([listTop, clipTop]).toEqual([LIST_LEFT_AT_PX, 0]);
  expect(previewTop).toBeGreaterThan(0);
  expect(previewTop).toBeLessThan(PHONE.height / 2);
  expect(inspectorTop).toBeGreaterThan(previewTop);
  expect(bar).toEqual({ position: 'fixed', gapBelowPx: 0, controls: DECISION_CONTROLS, tabBars: 0 });
  expect(await readBottomBar(page)).toMatchObject({ position: 'none', tabBars: 1 });
  await expect(page.locator('.candidate__open')).toHaveCount(6);
});

test('the list is where it was left after the back control and after the browser’s Back, and Forward returns to the clip', async ({
  page,
  readyTalk,
}) => {
  await openReview(page, readyTalk.project.id);
  await scrollWindowTo(page, LIST_LEFT_AT_PX);

  await openClipFromList(page, readyTalk, 'c03');
  await page.locator('#toolbar-back').click();
  await expect(page.locator('.candidate__open')).toHaveCount(6);
  await expect.poll(() => readWindowTop(page)).toBe(LIST_LEFT_AT_PX);
  await openClipFromList(page, readyTalk, 'c03');
  await expect.poll(() => readWindowTop(page)).toBe(0);
  await page.goBack();
  await expect(page).toHaveURL(reviewPage(readyTalk));
  await expect(page.locator('.candidate__open')).toHaveCount(6);
  await expect.poll(() => readWindowTop(page)).toBe(LIST_LEFT_AT_PX);
  await page.goForward();

  await expect(page).toHaveURL(`${reviewPage(readyTalk)}/c03`);
  await expect(page.locator('h1.toolbar__title')).toHaveText('Clip 3 of 6');
  await expect(page.locator('#clip-title')).toHaveValue(readyTalk.review.clips[2].title);
});

test('Next opens the next clip’s screen at its top', async ({ page, readyTalk }) => {
  await openPreview(page, `${reviewPage(readyTalk)}/c01`);
  const scrolled = await scrollWindowTo(page, PAST_THE_PREVIEW_PX);

  await page.locator('#decision-next').click();
  await expect(page).toHaveURL(`${reviewPage(readyTalk)}/c02`);
  await expect(page.locator('h1.toolbar__title')).toHaveText('Clip 2 of 6');

  expect(scrolled).toBe(PAST_THE_PREVIEW_PX);
  await expect.poll(() => readWindowTop(page)).toBe(0);
  await expect(page.locator('#app')).toHaveAttribute('data-preview', 'inline');
});

test('each of the three tabs and a clip open at their own addresses, and a reload returns to each', async ({
  page,
  readyTalk,
}) => {
  const project = `/projects/${readyTalk.project.id}`;
  const shown: (string | null)[] = [];

  for (const tab of ['review', 'export', 'results']) {
    await page.goto(`${project}/${tab}`);
    await page.reload();
    await expect(page).toHaveURL(`${project}/${tab}`);
    await expect(page.locator(`#tab-${tab}`)).toHaveAttribute('aria-current', 'page');
    shown.push(await page.locator('.screen-head .segmented [aria-current="page"]').getAttribute('id'));
  }
  await page.goto(`${project}/review/c05`);
  await page.reload();

  await expect(page).toHaveURL(`${project}/review/c05`);
  await expect(page.locator('h1.toolbar__title')).toHaveText('Clip 5 of 6');
  await expect(page.locator('#clip-title')).toHaveValue(readyTalk.review.clips[4].title);
  expect(shown).toEqual(['tab-review', 'tab-export', 'tab-results']);
});

test('with the clip playing, scrolling past the preview pins a strip under the top bar that still plays, pauses and plays again, and scrolling back up puts the preview back in the page', async ({
  page,
  readyTalk,
}) => {
  await openPreview(page, `${reviewPage(readyTalk)}/c01`);
  const inThePage = await readDock(page);
  await page.locator(PLAY_BUTTON).click();
  await expect(page.locator(PLAY_BUTTON)).toHaveAttribute('aria-label', 'Pause');

  await scrollWindowTo(page, PAST_THE_PREVIEW_PX);
  await expect(page.locator('#app')).toHaveAttribute('data-preview', 'docked');
  const pinned = await readDock(page);
  const whenPinned = await readVideoTime(page);
  await expect.poll(() => readVideoTime(page)).toBeGreaterThan(whenPinned + PLAYED_SECONDS);
  const whenPaused = await pauseThenPlayAgain(page);
  await scrollWindowTo(page, 0);
  await expect(page.locator('#app')).toHaveAttribute('data-preview', 'inline');

  expect(inThePage).toMatchObject({ place: 'inline', shellPosition: 'relative' });
  expect(pinned).toMatchObject({ place: 'docked', shellPosition: 'fixed', pictureWidthPx: 76, shownInStrip: STRIP_PARTS });
  expect(Math.abs(pinned.gapUnderTopBarPx)).toBeLessThanOrEqual(1);
  expect(whenPaused.isVideoPaused).toBe(true);
  expect(await readDock(page)).toMatchObject({ place: 'inline', shellPosition: 'relative' });
});

test('Reject opens its menu above the buttons of the bar, and a reason chosen there leaves the button reading “Rejected”', async ({
  page,
  request,
  readyTalk,
}) => {
  await openPreview(page, `${reviewPage(readyTalk)}/c02`);

  const menu = await openRejectMenu(page);
  const menuBox = await menu.boundingBox();
  const [barTop, buttonTop] = await readTops(page, ['.bottom-bar', '#decision-reject']);
  await menu.getByRole('menuitemradio', { name: 'Cut Off Mid-Thought' }).click();

  await expect(page.locator('#decision-reject')).toHaveText('Rejected');
  expect(buttonTop).toBeGreaterThan(barTop);
  expect((menuBox?.y ?? 0) + (menuBox?.height ?? 0)).toBeLessThan(buttonTop);
  expect(menuBox?.y).toBeGreaterThan(0);
  await expect
    .poll(async () => (await readReview(request, readyTalk.project.id)).clips[1])
    .toMatchObject({ decision: 'reject', rejectReason: 'cut-off' });
});
