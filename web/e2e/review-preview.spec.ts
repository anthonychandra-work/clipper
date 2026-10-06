import { renameSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

import type { APIRequestContext, APIResponse, Page } from '@playwright/test';

import type { Project } from '@/library';

import {
  candidateRow,
  capturePlayer,
  changeLook,
  createLinkProject,
  deleteProject,
  expect,
  listPointsAcross,
  nameColoursOfCapture,
  openPreview,
  pressStep,
  readCaptionDuring,
  readDecisionButtons,
  readLook,
  readPreview,
  readReview,
  readTranscript,
  readTrim,
  type ReadyTalk,
  seekPreview,
  type StoredWord,
  TALK_COLOUR_BARS,
  test as toolTest,
  waitForStepDone,
} from './support';

const DESKTOP = { width: 1360, height: 900 };
const RANGE = { first: 1000, last: 1999 };
const PROBE_VIDEO = '#probe-video';
const JUMP_TO_SECONDS = 120;
const PLAYED_SECONDS = 0.5;
const LENGTH_TOLERANCE_SECONDS = 0.2;
const FONT_ADDRESS = '/fonts/inter/InterVariable.ttf';
const COMMITTED_FONT = resolve(import.meta.dirname, '..', 'public', 'fonts', 'inter', 'InterVariable.ttf');
const HEAVY_TEXT = '<p id="heavy-text" style="font-family: Inter; font-weight: 900">Heavy words</p>';
const INTER_DRAWN = [{ familyName: 'Inter Variable', isCustomFont: true }];
const PLAY_BUTTON = '#preview-play';
const LONG_WORD_SECONDS = 0.4;
const WORD_EDGE_SECONDS = 0.08;
const PLAYED_STRETCH_SECONDS = 9;
const OUT_POINT_TOLERANCE_SECONDS = 0.3;
const STOP_TIMEOUT_MS = 15_000;
const CAPTION_STYLES = [
  { control: 'captions-keyword', mostWords: 3 },
  { control: 'captions-word-by-word', mostWords: 1 },
  { control: 'captions-plain', mostWords: 6 },
];
const SOURCE_GONE = 'Preview unavailable. The source video was deleted to free space.';

interface DrawnFont {
  familyName: string;
  isCustomFont: boolean;
}

interface CaptionRead {
  caption: string[];
  word: string;
  mostWords: number;
}

const test = toolTest.extend<{ fetchedTalk: Project }>({
  fetchedTalk: async ({ request, fixtureServer }, use) => {
    const created = await createLinkProject(request, `${fixtureServer.address}/talk.mp4`);
    await use(await waitForStepDone(request, created.id, 'fetch'));
    await deleteProject(request, created.id);
  },
});

function previewAddress(project: Project): string {
  return `/api/projects/${project.id}/preview`;
}

function askForRange(request: APIRequestContext, project: Project): Promise<APIResponse> {
  return request.get(previewAddress(project), { headers: { Range: `bytes=${RANGE.first}-${RANGE.last}` } });
}

async function loadInVideoElement(page: Page, address: string): Promise<number> {
  return page.evaluate(async (source) => {
    const video = document.createElement('video');
    video.id = 'probe-video';
    video.muted = true;
    video.src = source;
    document.body.append(video);
    await new Promise((settle, reject) => {
      video.addEventListener('loadedmetadata', settle, { once: true });
      video.addEventListener('error', () => reject(new Error('The video element could not load the preview copy.')));
    });
    return video.duration;
  }, address);
}

function readVideoTime(page: Page): Promise<number> {
  return page.locator(PROBE_VIDEO).evaluate((video: HTMLVideoElement) => video.currentTime);
}

async function jumpTo(page: Page, seconds: number): Promise<void> {
  await page.locator(PROBE_VIDEO).evaluate((video: HTMLVideoElement, target) => {
    video.currentTime = target;
  }, seconds);
}

async function listFontsDrawn(page: Page, selector: string): Promise<DrawnFont[]> {
  const session = await page.context().newCDPSession(page);
  await session.send('DOM.enable');
  await session.send('CSS.enable');
  const { root } = await session.send('DOM.getDocument');
  const { nodeId } = await session.send('DOM.querySelector', { nodeId: root.nodeId, selector });
  const { fonts } = await session.send('CSS.getPlatformFontsForNode', { nodeId });
  return fonts.map((font) => ({ familyName: font.familyName, isCustomFont: font.isCustomFont }));
}

function clipPage(talk: ReadyTalk, clipId: string): string {
  return `/projects/${talk.project.id}/review/${clipId}`;
}

function bareWord(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '');
}

function pickLongWords(words: StoredWord[], stretch: { from: number; until: number }): StoredWord[] {
  const long = words.filter(
    (word) =>
      word.start >= stretch.from &&
      word.end <= stretch.until &&
      word.end - word.start >= LONG_WORD_SECONDS &&
      bareWord(word.text) !== '',
  );
  return [0.5, 1.5, 2.5].map((third) => long[Math.floor((third * long.length) / 3)]);
}

function findWordAt(words: StoredWord[], seconds: number): string {
  return bareWord(words.findLast((word) => word.start <= seconds)?.text ?? '');
}

function expectSpokenWords(reads: CaptionRead[]): void {
  for (const read of reads) {
    expect(read.caption).toContain(read.word);
    expect(read.caption.length).toBeLessThanOrEqual(read.mostWords);
  }
}

async function readPlace(page: Page): Promise<number> {
  return (await readPreview(page)).place;
}

async function readHeldClip(request: APIRequestContext, talk: ReadyTalk) {
  const { decision, endSentence } = (await readReview(request, talk.project.id)).clips[0];
  return { decision, endSentence };
}

test.use({ viewport: DESKTOP });

test('the tool serves Inter from its own address at the committed size, and the page draws a heavy text in it', async ({
  page,
  request,
  tool,
}) => {
  const served = await request.get(FONT_ADDRESS);
  await page.goto('/settings');
  const fontRequest = page.waitForResponse((answer) => answer.url().endsWith(FONT_ADDRESS));
  await page.locator('body').evaluate((body, markup) => body.insertAdjacentHTML('beforeend', markup), HEAVY_TEXT);

  const loaded = await page.evaluate(async () => (await document.fonts.load('900 20px Inter')).length);
  const drawn = await listFontsDrawn(page, '#heavy-text');

  expect(new URL(served.url()).origin).toBe(tool.address);
  expect(served.status()).toBe(200);
  expect((await served.body()).length).toBe(statSync(COMMITTED_FONT).size);
  expect((await fontRequest).url()).toBe(`${tool.address}${FONT_ADDRESS}`);
  expect(loaded).toBe(1);
  expect(drawn).toEqual([{ familyName: 'Inter Variable', isCustomFont: true }]);
});

test('through the web port a byte range of the preview copy answers 206, and a video element plays it and plays on after a jump', async ({
  page,
  request,
  tool,
  fetchedTalk,
}) => {
  const stored = join(tool.settings.dataDir, 'projects', fetchedTalk.id, 'preview.mp4');
  const ranged = await askForRange(request, fetchedTalk);
  await page.goto('/');
  const length = await loadInVideoElement(page, previewAddress(fetchedTalk));
  await page.locator(PROBE_VIDEO).evaluate((video: HTMLVideoElement) => video.play());
  await expect.poll(() => readVideoTime(page)).toBeGreaterThan(PLAYED_SECONDS);
  const beforeTheJump = await readVideoTime(page);

  await jumpTo(page, JUMP_TO_SECONDS);

  await expect.poll(() => readVideoTime(page)).toBeGreaterThan(JUMP_TO_SECONDS + PLAYED_SECONDS);
  expect(new URL(ranged.url()).port).toBe(String(tool.settings.webPort));
  expect(ranged.status()).toBe(206);
  expect(ranged.headers()['content-range']).toBe(`bytes ${RANGE.first}-${RANGE.last}/${statSync(stored).size}`);
  expect(ranged.headers()['content-type']).toBe('video/mp4');
  expect((await ranged.body()).length).toBe(RANGE.last - RANGE.first + 1);
  expect(beforeTheJump).toBeLessThan(JUMP_TO_SECONDS);
  expect(Math.abs(length - (fetchedTalk.durationSeconds ?? 0))).toBeLessThan(LENGTH_TOLERANCE_SECONDS);
});

test('Play moves the playhead forward from the in point, and Pause holds it', async ({ page, readyTalk }) => {
  const clip = readyTalk.review.clips[0];
  await openPreview(page, clipPage(readyTalk, 'c01'));
  const atRest = await readPreview(page);

  await page.locator(PLAY_BUTTON).click();
  await expect.poll(() => readPlace(page)).toBeGreaterThan(PLAYED_SECONDS);
  const playing = await readPreview(page);
  await page.locator(PLAY_BUTTON).click();
  await expect(page.locator(PLAY_BUTTON)).toHaveAttribute('aria-label', 'Play');
  const paused = await readPreview(page);

  expect(atRest).toMatchObject({ playLabel: 'Play', place: 0, clock: '0:00 / 0:32', isVideoPaused: true });
  expect(atRest.videoTime).toBeCloseTo(clip.startSeconds, 1);
  expect(atRest.length).toBe(Number((clip.endSeconds - clip.startSeconds).toFixed(1)));
  expect(playing).toMatchObject({ playLabel: 'Pause', isVideoPaused: false, isShellPlaying: true });
  expect(playing.videoTime - clip.startSeconds).toBeGreaterThan(PLAYED_SECONDS);
  expect(paused).toMatchObject({ playLabel: 'Play', isVideoPaused: true, isShellPlaying: false });
  expect(paused.place).toBeGreaterThanOrEqual(playing.place);
});

test('from two seconds before the end the clip stops at its out point, and Play at the end starts from the in point', async ({
  page,
  readyTalk,
}) => {
  const clip = readyTalk.review.clips[0];
  await openPreview(page, clipPage(readyTalk, 'c01'));
  const length = (await readPreview(page)).length;
  await seekPreview(page, length - 2);

  await page.locator(PLAY_BUTTON).click();
  await expect(page.locator(PLAY_BUTTON)).toHaveAttribute('aria-label', 'Pause');
  await expect(page.locator(PLAY_BUTTON)).toHaveAttribute('aria-label', 'Play', { timeout: STOP_TIMEOUT_MS });
  const stopped = await readPreview(page);
  await page.locator(PLAY_BUTTON).click();
  await expect.poll(() => readPlace(page)).toBeGreaterThan(PLAYED_SECONDS);
  const startedAgain = await readPreview(page);

  expect(stopped).toMatchObject({ place: length, clock: '0:32 / 0:32', isVideoPaused: true, isShellPlaying: false });
  expect(Math.abs(stopped.videoTime - clip.endSeconds)).toBeLessThan(OUT_POINT_TOLERANCE_SECONDS);
  expect(startedAgain).toMatchObject({ playLabel: 'Pause', isVideoPaused: false });
  expect(startedAgain.place).toBeLessThan(length - 2);
  expect(startedAgain.videoTime - clip.startSeconds).toBeLessThan(length - 2);
});

test('with the slider on the middle of a word of the stored transcript, the caption holds that word in each style, in no more than three, one and six words', async ({
  page,
  readyTalk,
  tool,
}) => {
  const clip = readyTalk.review.clips[0];
  const words = readTranscript(tool.settings.dataDir, readyTalk.project.id).words;
  const spoken = pickLongWords(words, { from: clip.startSeconds, until: clip.endSeconds });
  await openPreview(page, clipPage(readyTalk, 'c01'));
  const shown: CaptionRead[] = [];

  for (const style of CAPTION_STYLES) {
    await changeLook(page, style.control);
    for (const word of spoken) {
      await seekPreview(page, (word.start + word.end) / 2 - clip.startSeconds);
      const caption = (await readPreview(page)).caption.map(bareWord);
      shown.push({ caption, word: bareWord(word.text), mostWords: style.mostWords });
    }
  }

  expect(new Set(spoken.map((word) => word.start)).size).toBe(3);
  expect(shown).toHaveLength(9);
  expectSpokenWords(shown);
  expect(shown.slice(3, 6).map((read) => read.caption)).toEqual(spoken.map((word) => [bareWord(word.text)]));
});

test('while the clip plays, the caption read together with the video’s time holds the word spoken at that moment, in each style', async ({
  page,
  readyTalk,
  tool,
}) => {
  const clip = readyTalk.review.clips[0];
  const words = readTranscript(tool.settings.dataDir, readyTalk.project.id).words;
  const early = { from: clip.startSeconds + 1, until: clip.startSeconds + PLAYED_STRETCH_SECONDS };
  const spoken = pickLongWords(words, early);
  await openPreview(page, clipPage(readyTalk, 'c01'));
  const heard: CaptionRead[] = [];

  for (const style of CAPTION_STYLES) {
    await changeLook(page, style.control);
    await seekPreview(page, 0);
    await page.locator(PLAY_BUTTON).click();
    for (const word of spoken) {
      const moment = { from: word.start + WORD_EDGE_SECONDS, until: word.end - WORD_EDGE_SECONDS };
      const read = await readCaptionDuring(page, moment);
      heard.push({ caption: read.caption.map(bareWord), word: findWordAt(words, read.videoTime), mostWords: style.mostWords });
    }
    await page.locator(PLAY_BUTTON).click();
  }

  expect(heard.map((read) => read.word)).toEqual(CAPTION_STYLES.flatMap(() => spoken.map((word) => bareWord(word.text))));
  expectSpokenWords(heard);
});

test('the keyword style marks one word of a caption, and the two other styles mark none', async ({ page, readyTalk }) => {
  const marked = readyTalk.review.clips[0].captions.keyword.find((caption) => caption.words.some((word) => word.isHighlighted));
  if (marked === undefined) throw new Error('No keyword caption of the first clip has a highlighted word.');
  await openPreview(page, clipPage(readyTalk, 'c01'));

  await seekPreview(page, Math.ceil(marked.startSeconds * 10) / 10);
  const inKeywordStyle = await readPreview(page);
  await changeLook(page, 'captions-word-by-word');
  const inEachWordStyle = await readPreview(page);
  await changeLook(page, 'captions-plain');
  const inPlainStyle = await readPreview(page);

  expect(inKeywordStyle.caption).toEqual(marked.words.map((word) => word.text));
  expect(inKeywordStyle.marked).toEqual(marked.words.filter((word) => word.isHighlighted).map((word) => word.text));
  expect(inKeywordStyle.marked).toHaveLength(1);
  expect([inEachWordStyle.caption.length, inEachWordStyle.marked]).toEqual([1, []]);
  expect(inPlainStyle.marked).toEqual([]);
});

test('the hook title shows at one second and not at four, and never with its switch off', async ({ page, readyTalk }) => {
  await openPreview(page, clipPage(readyTalk, 'c01'));

  await seekPreview(page, 1);
  const atOneSecond = await readPreview(page);
  await seekPreview(page, 4);
  const atFourSeconds = await readPreview(page);
  await changeLook(page, 'look-showHookTitle');
  const switchedOffLate = await page.locator('#preview-hook').count();
  await seekPreview(page, 1);
  const switchedOffEarly = await page.locator('#preview-hook').count();

  expect(atOneSecond.hookTitle).toBe(readyTalk.review.clips[0].hookTitle);
  expect(atFourSeconds.hookTitle).toBeNull();
  expect([switchedOffLate, switchedOffEarly]).toEqual([0, 0]);
});

test('the safe zones follow their switch, and the caption and the hook title are drawn in Inter', async ({ page, readyTalk }) => {
  await openPreview(page, clipPage(readyTalk, 'c01'));
  await seekPreview(page, 1);
  const zonesAsMade = (await readPreview(page)).safeZones;

  await changeLook(page, 'look-showSafeZones');
  const zonesSwitchedOn = (await readPreview(page)).safeZones;
  await changeLook(page, 'look-showSafeZones');
  const zonesSwitchedOff = (await readPreview(page)).safeZones;

  expect(zonesAsMade).toEqual([]);
  expect(zonesSwitchedOn).toEqual(['Platform buttons', 'Caption and sound']);
  expect(zonesSwitchedOff).toEqual([]);
  expect((await readPreview(page)).caption.length).toBeGreaterThan(0);
  expect(await listFontsDrawn(page, '#preview-caption')).toEqual(INTER_DRAWN);
  expect(await listFontsDrawn(page, '#preview-hook')).toEqual(INTER_DRAWN);
});

test('each framing draws a different part of the talk’s colour bars, read from a capture of the frame', async ({
  page,
  readyTalk,
}) => {
  await openPreview(page, clipPage(readyTalk, 'c01'));

  const speaker = await capturePlayer(page);
  await changeLook(page, 'framing-stack-two');
  const stacked = await capturePlayer(page);
  await changeLook(page, 'framing-whole-frame');
  const fullFrame = await capturePlayer(page);

  expect(await nameColoursOfCapture(page, speaker, listPointsAcross(3, 0.3))).toEqual(['cyan', 'green', 'magenta']);
  expect(await nameColoursOfCapture(page, stacked, listPointsAcross(4, 0.25))).toEqual(TALK_COLOUR_BARS.slice(0, 4));
  expect(await nameColoursOfCapture(page, stacked, listPointsAcross(4, 0.68))).toEqual(TALK_COLOUR_BARS.slice(3));
  expect(await nameColoursOfCapture(page, fullFrame, listPointsAcross(7, 0.42))).toEqual(TALK_COLOUR_BARS);
  expect(await nameColoursOfCapture(page, fullFrame, [{ across: 0.5, down: 0.27 }])).toEqual(['green']);
});

test('a changed look is the same on another clip and after a reload, and is the one the service holds', async ({
  page,
  request,
  readyTalk,
}) => {
  const chosen = { captions: 'Plain', framing: 'Full Frame', hasHookTitle: false, hasSafeZones: true };
  await openPreview(page, clipPage(readyTalk, 'c01'));
  const asMade = await readLook(page);
  for (const control of ['captions-plain', 'framing-whole-frame', 'look-showHookTitle', 'look-showSafeZones']) {
    await changeLook(page, control);
  }

  await candidateRow(page, 'c03').click();
  await expect(page).toHaveURL(clipPage(readyTalk, 'c03'));
  const onAnotherClip = await readLook(page);
  await page.reload();
  await expect(page.locator('#preview-video')).toBeVisible();
  const afterReload = await readLook(page);
  const drawn = await readPreview(page);
  const stored = (await readReview(request, readyTalk.project.id)).look;

  expect(asMade).toEqual({ captions: 'Keyword', framing: 'Speaker', hasHookTitle: true, hasSafeZones: false });
  expect(onAnotherClip).toEqual(chosen);
  expect(afterReload).toEqual(chosen);
  expect(drawn.safeZones).toHaveLength(2);
  expect(stored).toEqual({ captionStyle: 'plain', framing: 'whole-frame', showHookTitle: false, showSafeZones: true });
});

test('a step of a point and Next each put the playhead back at the in point, paused', async ({ page, readyTalk }) => {
  const [first, second] = readyTalk.review.clips;
  const earlier = first.sentences.find((sentence) => sentence.number === first.startSentence - 1);
  await openPreview(page, clipPage(readyTalk, 'c01'));
  await page.locator(PLAY_BUTTON).click();
  await expect.poll(() => readPlace(page)).toBeGreaterThan(PLAYED_SECONDS);

  await pressStep(page, 'start-move-edge-earlier');
  await expect(page.locator(PLAY_BUTTON)).toHaveAttribute('aria-label', 'Play');
  const afterTheStep = await readPreview(page);
  await page.locator(PLAY_BUTTON).click();
  await expect.poll(() => readPlace(page)).toBeGreaterThan(PLAYED_SECONDS);
  await page.locator('#decision-next').click();
  await expect(page).toHaveURL(clipPage(readyTalk, 'c02'));
  await expect(page.locator(PLAY_BUTTON)).toHaveAttribute('aria-label', 'Play');
  const afterNext = await readPreview(page);

  expect(afterTheStep).toMatchObject({ place: 0, isVideoPaused: true, isShellPlaying: false });
  expect(afterTheStep.videoTime).toBeCloseTo(earlier?.startSeconds ?? Number.NaN, 1);
  expect(afterNext).toMatchObject({ place: 0, isVideoPaused: true, isShellPlaying: false });
  expect(afterNext.videoTime).toBeCloseTo(second.startSeconds, 1);
});

test('with the preview copy moved aside a reload shows the notice in place of the preview, and a decision and a step of a point still work', async ({
  page,
  request,
  readyTalk,
  tool,
}) => {
  const stored = join(tool.settings.dataDir, 'projects', readyTalk.project.id, 'preview.mp4');
  await openPreview(page, clipPage(readyTalk, 'c01'));
  renameSync(stored, `${stored}.aside`);
  try {
    await page.reload();
    await expect(page.locator('.preview--gone')).toHaveText(SOURCE_GONE);
    await page.locator('#decision-keep').click();
    await pressStep(page, 'end-move-edge-later');

    expect(await page.locator('#preview-video').count()).toBe(0);
    expect((await readDecisionButtons(page)).keep).toBe('Kept');
    expect(await readTrim(page)).toMatchObject({ outTime: '00:00:50.3', length: '38.4 s' });
    await expect.poll(() => readHeldClip(request, readyTalk)).toEqual({ decision: 'keep', endSentence: 13 });
  } finally {
    renameSync(`${stored}.aside`, stored);
  }
});
