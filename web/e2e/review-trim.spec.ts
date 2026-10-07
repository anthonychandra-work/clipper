import type { APIRequestContext, Page } from '@playwright/test';

import type { ReviewClip } from '@/review';

import {
  candidateRow,
  changeClip,
  expect,
  holdHandleAt,
  listPointsAcross,
  nameColoursOfPicture,
  pressStep,
  readCandidateRows,
  readHandle,
  readReview,
  readStripFrames,
  readTranscriptLines,
  readTrim,
  type StepName,
  TALK_COLOUR_BARS,
  test,
} from './support';

const DESKTOP = { width: 1360, height: 900 };
const FRAME_HEIGHT_PX = 104;
const BARS_ROW = 0.3;
const SENTENCE_STEPS: { step: StepName; sentences: [number, number] }[] = [
  { step: 'start-move-edge-earlier', sentences: [3, 12] },
  { step: 'start-move-edge-later', sentences: [4, 12] },
  { step: 'end-move-edge-later', sentences: [4, 13] },
  { step: 'end-move-edge-earlier', sentences: [4, 12] },
];

function padTwo(value: number): string {
  return String(Math.floor(value)).padStart(2, '0');
}

function wordTime(seconds: number): string {
  const hundredths = Math.round(seconds * 100);
  const whole = Math.floor(hundredths / 100);
  return `${padTwo(whole / 3600)}:${padTwo((whole % 3600) / 60)}:${padTwo(whole % 60)}.${Math.floor(hundredths / 10) % 10}`;
}

function wordLength(startSeconds: number, endSeconds: number): string {
  return `${((Math.round(endSeconds * 100) - Math.round(startSeconds * 100)) / 100).toFixed(1)} s`;
}

function timeSentences(clip: ReviewClip, [first, last]: [number, number]) {
  const start = clip.sentences.find((sentence) => sentence.number === first)?.startSeconds ?? NaN;
  const end = clip.sentences.find((sentence) => sentence.number === last)?.endSeconds ?? NaN;
  return { first, last, start, end };
}

async function openClip(page: Page, projectId: string, clipId: string): Promise<void> {
  await page.goto(`/projects/${projectId}/review/${clipId}`);
  await expect(candidateRow(page, clipId)).toHaveAttribute('aria-current', 'true');
  await expect(page.locator('#trim-edges .edge')).toHaveCount(2);
}

async function readStoredClip(request: APIRequestContext, projectId: string, clipId: string): Promise<ReviewClip> {
  const review = await readReview(request, projectId);
  const clip = review.clips.find((candidate) => candidate.id === clipId);
  if (clip === undefined) throw new Error(`The service holds no clip ${clipId}.`);
  return clip;
}

async function readFlagAndTag(page: Page): Promise<{ flags: number; fixes: number; tags: string[] }> {
  const rows = await readCandidateRows(page);
  return {
    flags: await page.locator('.inspector .flag[role="note"]').count(),
    fixes: await page.getByRole('button', { name: 'Start One Sentence Earlier' }).count(),
    tags: rows[3].tags,
  };
}

async function letGoAndStore(page: Page): Promise<void> {
  const stored = page.waitForResponse((answer) => answer.request().method() === 'PATCH' && answer.ok());
  await page.mouse.up();
  await stored;
}

test.use({ viewport: DESKTOP });

test('each sentence step moves its point to the neighbouring sentence’s time as the service holds it, and the length is the difference of the two times', async ({
  page,
  request,
  readyTalk,
}) => {
  const asCut = readyTalk.review.clips[0];
  await openClip(page, readyTalk.project.id, 'c01');
  const shown: string[][] = [];
  const stored: number[][] = [];

  for (const { step } of SENTENCE_STEPS) {
    await pressStep(page, step);
    const trim = await readTrim(page);
    const clip = await readStoredClip(request, readyTalk.project.id, 'c01');
    shown.push([trim.inTime, trim.outTime, trim.length]);
    stored.push([clip.startSentence, clip.endSentence, clip.startSeconds, clip.endSeconds]);
  }

  const expected = SENTENCE_STEPS.map(({ sentences }) => timeSentences(asCut, sentences));
  expect(stored).toEqual(expected.map((times) => [times.first, times.last, times.start, times.end]));
  expect(shown).toEqual(expected.map((times) => [wordTime(times.start), wordTime(times.end), wordLength(times.start, times.end)]));
  expect(shown[0]).toEqual(['00:00:05.7', '00:00:44.7', '39.0 s']);
  expect(shown[2]).toEqual(['00:00:11.9', '00:00:50.3', '38.4 s']);
});

test('a moved point is followed by the list’s time and length, the timeline’s pin and the transcript, and is still there after a reload', async ({
  page,
  readyTalk,
}) => {
  const reach = readyTalk.review.clips[0].sentences;
  await openClip(page, readyTalk.project.id, 'c01');
  const linesAsCut = await readTranscriptLines(page);

  await pressStep(page, 'start-move-edge-earlier');
  const linesMoved = await readTranscriptLines(page);
  await page.reload();
  await expect(page.locator('#trim-edges .edge')).toHaveCount(2);

  expect(linesAsCut.map((line) => line.text)).toEqual(reach.map((sentence) => sentence.text));
  expect(linesAsCut.map((line) => line.edge).join(',')).toBe(',,,In,,,,,,,,Out,,,');
  expect(linesAsCut.filter((line) => line.isIncluded)).toHaveLength(9);
  expect(linesMoved.map((line) => line.edge).join(',')).toBe(',,In,,,,,,,,,Out,,,');
  expect(linesMoved.filter((line) => line.isIncluded)).toHaveLength(10);
  expect(await readTrim(page)).toMatchObject({ inTime: '00:00:05.7', outTime: '00:00:44.7', length: '39.0 s' });
  expect((await readCandidateRows(page))[0].meta).toBe('00:00:05 · 39.0 s');
  await expect(page.locator('#pin-c01')).toHaveAttribute('aria-label', 'Clip ranked 1, at 00:00:05, not decided');
});

test('five 0.2-second steps move a point by one second and switch the sixth off, earlier and later', async ({
  page,
  request,
  readyTalk,
}) => {
  await openClip(page, readyTalk.project.id, 'c01');

  await pressStep(page, 'start-nudge-edge-earlier', 5);
  const earliest = await readTrim(page);
  await pressStep(page, 'start-nudge-edge-later', 10);
  const latest = await readTrim(page);
  await pressStep(page, 'end-nudge-edge-later', 5);
  const outLatest = await readTrim(page);
  const stored = await readStoredClip(request, readyTalk.project.id, 'c01');

  expect([earliest.inTime, earliest.length]).toEqual(['00:00:10.9', '33.8 s']);
  expect(earliest.switchedOff).toEqual(['start-nudge-edge-earlier']);
  expect([latest.inTime, latest.length]).toEqual(['00:00:12.9', '31.8 s']);
  expect(latest.switchedOff).toEqual(['start-nudge-edge-later']);
  expect([outLatest.outTime, outLatest.length]).toEqual(['00:00:45.7', '32.8 s']);
  expect(outLatest.switchedOff).toEqual(['start-nudge-edge-later', 'end-nudge-edge-later']);
  expect([stored.startNudge, stored.endNudge, stored.startSeconds, stored.endSeconds]).toEqual([5, 5, 12.94, 45.7]);
});

test('the sentence steps are switched off at both ends of the reach and where the two points meet', async ({
  page,
  request,
  readyTalk,
}) => {
  const projectId = readyTalk.project.id;
  await openClip(page, projectId, 'c01');
  const inTheMiddle = (await readTrim(page)).switchedOff;

  await pressStep(page, 'start-move-edge-earlier', 3);
  await pressStep(page, 'end-move-edge-later', 3);
  const atTheEnds = await readTrim(page);
  await changeClip(request, { projectId, clipId: 'c01' }, { startSentence: 9, endSentence: 9 });
  await page.reload();
  await expect(page.locator('#trim-edges .edge')).toHaveCount(2);
  const met = await readTrim(page);

  expect(inTheMiddle).toEqual([]);
  expect(atTheEnds.switchedOff).toEqual(['start-move-edge-earlier', 'start-nudge-edge-earlier', 'end-move-edge-later']);
  expect([atTheEnds.inTime, atTheEnds.outTime]).toEqual(['00:00:00.0', '00:00:57.0']);
  expect(met.switchedOff).toEqual(['start-move-edge-later', 'end-move-edge-earlier']);
  expect([await readHandle(page, 'start'), await readHandle(page, 'end')].map((handle) => handle.now)).toEqual(['8', '8']);
});

test('the reading names the preferred band, the limits, the minimum and the maximum, each for a clip of that length', async ({
  page,
  readyTalk,
}) => {
  const projectId = readyTalk.project.id;
  await openClip(page, projectId, 'c01');
  const preferred = await readTrim(page);

  await openClip(page, projectId, 'c03');
  await pressStep(page, 'end-move-edge-later', 3);
  const allowed = await readTrim(page);
  await openClip(page, projectId, 'c06');
  await pressStep(page, 'end-move-edge-earlier', 3);
  const short = await readTrim(page);
  await openClip(page, projectId, 'c04');
  await pressStep(page, 'start-move-edge-earlier', 3);
  await pressStep(page, 'end-move-edge-later', 3);
  const long = await readTrim(page);

  expect([preferred.length, preferred.reading]).toEqual(['32.8 s', 'inside the preferred 25–50 s band.']);
  expect([allowed.length, allowed.reading]).toEqual(['52.6 s', 'inside the 25–60 s limits.']);
  expect([short.length, short.reading]).toEqual(['4.7 s', 'shorter than the 25 s minimum.']);
  expect([long.length, long.reading]).toEqual(['65.3 s', 'longer than the 60 s maximum.']);
  await expect(page.locator('#trim-band .band')).toHaveClass(/band--long/);
});

test('the “needs context” flag and its tag go when the in point moves one sentence earlier, by the button and by the step, and return when it moves back', async ({
  page,
  request,
  readyTalk,
}) => {
  await openClip(page, readyTalk.project.id, 'c04');
  const asCut = await readFlagAndTag(page);

  await page.getByRole('button', { name: 'Start One Sentence Earlier' }).click();
  await expect(page.locator('.inspector .flag')).toHaveCount(0);
  const afterTheButton = await readFlagAndTag(page);
  await pressStep(page, 'start-move-edge-later');
  const movedBack = await readFlagAndTag(page);
  await pressStep(page, 'start-move-edge-earlier');
  const afterTheStep = await readFlagAndTag(page);
  await pressStep(page, 'start-nudge-edge-earlier');
  await pressStep(page, 'start-move-edge-later');
  await pressStep(page, 'start-nudge-edge-earlier');

  expect(asCut).toEqual({ flags: 1, fixes: 1, tags: ['Confession', 'Needs context'] });
  expect(afterTheButton).toEqual({ flags: 0, fixes: 0, tags: ['Confession'] });
  expect(movedBack).toEqual(asCut);
  expect(afterTheStep).toEqual(afterTheButton);
  expect(await readFlagAndTag(page)).toEqual(asCut);
  expect((await readStoredClip(request, readyTalk.project.id, 'c04')).startNudge).toBe(-1);
});

test('every frame of the strip is a loaded picture 104 px high whose colours are the talk’s colour bars', async ({
  page,
  readyTalk,
}) => {
  await openClip(page, readyTalk.project.id, 'c02');

  const frames = await readStripFrames(page);
  const pictures = page.locator('#filmstrip .filmstrip__frame img');
  const colours: string[][] = [];
  for (const picture of await pictures.all()) {
    colours.push(await nameColoursOfPicture(picture, listPointsAcross(TALK_COLOUR_BARS.length, BARS_ROW)));
  }

  expect(frames).toHaveLength(12);
  expect(frames.map((frame) => frame.isLoaded)).toEqual(Array.from({ length: 12 }, () => true));
  expect(new Set(frames.map((frame) => frame.heightPx))).toEqual(new Set([FRAME_HEIGHT_PX]));
  expect(frames.map((frame) => frame.address)).toEqual(readyTalk.review.clips[1].frames);
  expect(colours).toEqual(Array.from({ length: 12 }, () => TALK_COLOUR_BARS));
});

test('a handle dragged along the strip leaves its point on the sentence nearest the place it was let go, and its words change to match', async ({
  page,
  request,
  readyTalk,
}) => {
  const projectId = readyTalk.project.id;
  const reach = readyTalk.review.clips[0].sentences;
  const stretch = reach[reach.length - 1].endSeconds - reach[0].startSeconds;
  await openClip(page, projectId, 'c01');
  const wordsAsCut = (await readHandle(page, 'start')).words;

  await holdHandleAt(page, 'start', (reach[1].startSeconds + 0.3) / stretch);
  const whileHeld = await readTrim(page);
  const storedWhileHeld = (await readStoredClip(request, projectId, 'c01')).startSentence;
  await expect(page.locator('#filmstrip')).toHaveClass(/is-trimming/);
  await letGoAndStore(page);
  await holdHandleAt(page, 'end', (reach[12].endSeconds - 0.4) / stretch);
  await letGoAndStore(page);
  const stored = await readStoredClip(request, projectId, 'c01');

  expect(wordsAsCut).toBe('Sentence 4 of 15, 00:00:11.9');
  expect([whileHeld.inTime, whileHeld.length, storedWhileHeld]).toEqual(['00:00:02.4', '42.2 s', 4]);
  expect([stored.startSentence, stored.endSentence, stored.startSeconds, stored.endSeconds]).toEqual([2, 13, 2.48, 50.3]);
  expect(await readTrim(page)).toMatchObject({ inTime: '00:00:02.4', outTime: '00:00:50.3', length: '47.8 s' });
  expect(await readHandle(page, 'start')).toEqual({ label: 'In point', now: '1', most: '14', words: 'Sentence 2 of 15, 00:00:02.4' });
  expect(await readHandle(page, 'end')).toMatchObject({ label: 'Out point', words: 'Sentence 13 of 15, 00:00:50.3' });
  await expect(page.locator('#filmstrip')).not.toHaveClass(/is-trimming/);
});

test('a handle is a slider that the arrow keys move by a sentence, within what the rules allow', async ({
  page,
  request,
  readyTalk,
}) => {
  await openClip(page, readyTalk.project.id, 'c01');

  await page.locator('#trim-handle-start').focus();
  const moved = page.waitForResponse((answer) => answer.request().method() === 'PATCH' && answer.ok());
  await page.keyboard.press('ArrowLeft');
  await moved;
  const afterLeft = await readHandle(page, 'start');
  await page.locator('#trim-handle-end').focus();
  const movedOut = page.waitForResponse((answer) => answer.request().method() === 'PATCH' && answer.ok());
  await page.keyboard.press('ArrowRight');
  await movedOut;

  const stored = await readStoredClip(request, readyTalk.project.id, 'c01');
  expect(afterLeft.words).toBe('Sentence 3 of 15, 00:00:05.7');
  expect(await readHandle(page, 'end')).toMatchObject({ now: '12', words: 'Sentence 13 of 15, 00:00:50.3' });
  expect([stored.startSentence, stored.endSentence]).toEqual([3, 13]);
});
