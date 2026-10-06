import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type { APIRequestContext, Page } from '@playwright/test';

import {
  changeClip,
  expect,
  listPointsAcross,
  nameColoursOfCapture,
  readProject,
  readProjectList,
  readReview,
  readTranscript,
  type ReadyTalk,
  showWholeScreen,
  test,
  visitScreens,
  type Walk,
  waitForPicture,
  walkTalkReview,
} from './support';

const WINDOW_SIZES = [
  { width: 390, height: 844 },
  { width: 1360, height: 900 },
];
const THEMES = ['light', 'dark'] as const;
const CAPTURED_AS = new Map([
  ['review-list', 'review-list'],
  ['review-flagged-clip', 'review-clip'],
]);
const TALK_REVIEW = 'talk-review.json';
const PNG_SIGNATURE = '89504e470d0a1a0a';
const PNG_WIDTH_OFFSET = 16;
const PNG_HEIGHT_OFFSET = 20;
const SMALLEST_CAPTURE_BYTES = 5000;
const PREVIEW_ROW = 0.3;
const PREVIEW_POINTS = 5;

interface SavedCapture {
  file: string;
  width: number;
  leastHeight: number;
  previewColours: string[];
}

function listExpectedFiles(): string[] {
  const screens = [...CAPTURED_AS.values()];
  return screens.flatMap((screen) =>
    WINDOW_SIZES.flatMap((size) => THEMES.map((theme) => `${screen}-${size.width}-${theme}.png`)),
  );
}

function expectPictureOfWholeScreen(capture: SavedCapture, picture: Buffer): void {
  expect(picture.subarray(0, 8).toString('hex'), capture.file).toBe(PNG_SIGNATURE);
  expect(picture.length, capture.file).toBeGreaterThan(SMALLEST_CAPTURE_BYTES);
  expect(picture.readUInt32BE(PNG_WIDTH_OFFSET), capture.file).toBe(capture.width);
  expect(picture.readUInt32BE(PNG_HEIGHT_OFFSET), capture.file).toBeGreaterThanOrEqual(capture.leastHeight);
}

async function keepFirstAndRejectSixth(request: APIRequestContext, projectId: string): Promise<void> {
  await changeClip(request, { projectId, clipId: 'c01' }, { decision: 'keep' });
  await changeClip(request, { projectId, clipId: 'c06' }, { decision: 'reject', rejectReason: 'not-interesting' });
}

async function waitForPictures(page: Page): Promise<void> {
  if ((await page.locator('#preview-video').count()) > 0) await waitForPicture(page);
  await page.waitForFunction(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0));
}

async function namePreviewColours(page: Page, picture: Buffer): Promise<string[]> {
  const player = page.locator('section.preview .player');
  const shown = page.viewportSize();
  const preview = (await player.count()) > 0 ? await player.boundingBox() : null;
  if (preview === null || shown === null) return [];
  const points = listPointsAcross(PREVIEW_POINTS, PREVIEW_ROW).map((point) => ({
    across: (preview.x + point.across * preview.width) / shown.width,
    down: (preview.y + point.down * preview.height) / shown.height,
  }));
  return nameColoursOfCapture(page, picture, points);
}

async function captureWhole(page: Page, file: string, folder: string): Promise<string[]> {
  await waitForPictures(page);
  await showWholeScreen(page, file);
  const picture = await page.screenshot({ path: join(folder, file), animations: 'disabled' });
  return namePreviewColours(page, picture);
}

async function captureReview(page: Page, walk: Walk, folder: string): Promise<SavedCapture[]> {
  const saved: SavedCapture[] = [];
  for (const size of WINDOW_SIZES) {
    for (const theme of THEMES) {
      await page.setViewportSize(size);
      await page.emulateMedia({ colorScheme: theme });
      await visitScreens(page, walk, async (screenName) => {
        const file = `${CAPTURED_AS.get(screenName)}-${size.width}-${theme}.png`;
        const previewColours = await captureWhole(page, file, folder);
        await page.setViewportSize(size);
        saved.push({ file, width: size.width, leastHeight: size.height, previewColours });
      });
    }
  }
  return saved;
}

async function saveTalkReview(request: APIRequestContext, talk: ReadyTalk, source: { dataDir: string; folder: string }) {
  const talkReview = {
    project: await readProject(request, talk.project.id),
    review: await readReview(request, talk.project.id),
    transcript: readTranscript(source.dataDir, talk.project.id),
  };
  writeFileSync(join(source.folder, TALK_REVIEW), `${JSON.stringify(talkReview, null, 2)}\n`);
  return talkReview;
}

test('the Review list and the flagged clip are captured whole at 390 and 1360 px, in light and in dark, and the talk’s review is saved', async (
  { page, request, readyTalk, tool },
  testInfo,
) => {
  const folder = process.env.CLIPPER_EVIDENCE_DIR ?? testInfo.outputDir;
  mkdirSync(folder, { recursive: true });
  await keepFirstAndRejectSixth(request, readyTalk.project.id);
  const walk = walkTalkReview(readyTalk, await readProjectList(request));
  const captured = { ...walk, screens: walk.screens.filter((screen) => CAPTURED_AS.has(screen.name)) };

  const saved = await captureReview(page, captured, folder);
  const talkReview = await saveTalkReview(request, readyTalk, { dataDir: tool.settings.dataDir, folder });

  expect(saved.map((capture) => capture.file).sort()).toEqual(listExpectedFiles().sort());
  for (const capture of saved) {
    expectPictureOfWholeScreen(capture, readFileSync(join(folder, capture.file)));
  }
  const clipCaptures = saved.filter((capture) => capture.file.startsWith('review-clip'));
  expect(clipCaptures.map((capture) => new Set(capture.previewColours).size > 1)).toEqual([true, true, true, true]);
  expect(talkReview.review.clips.map((clip) => clip.decision)).toEqual(['keep', ...Array(4).fill('undecided'), 'reject']);
  expect([talkReview.project.keptCount, talkReview.project.rejectedCount]).toEqual([1, 1]);
  expect(talkReview.transcript.words.length).toBeGreaterThan(0);
});
