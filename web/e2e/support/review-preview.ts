import { expect, type Page } from '@playwright/test';

const LOOK_STORED = '/look';

export interface PreviewText {
  playLabel: string | null;
  isShellPlaying: boolean;
  place: number;
  length: number;
  clock: string;
  caption: string[];
  marked: string[];
  hookTitle: string | null;
  safeZones: string[];
  videoTime: number;
  isVideoPaused: boolean;
}

export interface SpokenCaption {
  videoTime: number;
  caption: string[];
}

export interface LookText {
  captions: string;
  framing: string;
  hasHookTitle: boolean;
  hasSafeZones: boolean;
}

export async function openPreview(page: Page, address: string): Promise<void> {
  await page.goto(address);
  await waitForPicture(page);
}

export async function waitForPicture(page: Page): Promise<void> {
  await expect(page.locator('#preview-video')).toBeVisible();
  await page.waitForFunction(() => {
    const video = document.querySelector<HTMLVideoElement>('#preview-video');
    const isDrawn = (canvas: HTMLCanvasElement) => {
      const middle = canvas.getContext('2d')?.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
      return middle !== undefined && middle[3] > 0;
    };
    const isVideoShown = video !== null && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && !video.seeking;
    return isVideoShown && [...document.querySelectorAll<HTMLCanvasElement>('.scene canvas')].every(isDrawn);
  });
}

export function readPreview(page: Page): Promise<PreviewText> {
  return page.locator('section.preview').evaluate((preview) => {
    const video = preview.querySelector<HTMLVideoElement>('#preview-video');
    const slider = preview.querySelector<HTMLInputElement>('#preview-scrubber');
    const hook = preview.querySelector<HTMLElement>('#preview-hook');
    const readText = (part: string) => (preview.querySelector(part)?.textContent ?? '').trim();
    const listTexts = (parts: string) => [...preview.querySelectorAll(parts)].map((part) => (part.textContent ?? '').trim());
    return {
      playLabel: preview.querySelector('#preview-play')?.getAttribute('aria-label') ?? null,
      isShellPlaying: preview.querySelector('.player-shell')?.classList.contains('is-playing') ?? false,
      place: Number(slider?.value),
      length: Number(slider?.max),
      clock: readText('#preview-clock'),
      caption: readText('#preview-caption').split(' ').filter(Boolean),
      marked: listTexts('#preview-caption mark'),
      hookTitle: hook === null || hook.hidden ? null : (hook.textContent ?? '').trim(),
      safeZones: listTexts('.safe-zone'),
      videoTime: video?.currentTime ?? Number.NaN,
      isVideoPaused: video?.paused ?? true,
    };
  });
}

export async function seekPreview(page: Page, seconds: number): Promise<void> {
  const tenths = Number(seconds.toFixed(1));
  const slider = page.locator('#preview-scrubber');
  await slider.fill(String(tenths));
  await expect.poll(async () => Number(await slider.inputValue())).toBe(tenths);
}

export async function readCaptionDuring(page: Page, moment: { from: number; until: number }): Promise<SpokenCaption> {
  const read = await page.waitForFunction(
    ({ from, until }) => {
      const video = document.querySelector<HTMLVideoElement>('#preview-video');
      const caption = document.querySelector('#preview-caption');
      if (video === null || caption === null || video.currentTime < from || video.currentTime > until) return null;
      return { videoTime: video.currentTime, caption: (caption.textContent ?? '').split(' ').filter(Boolean) };
    },
    moment,
    { polling: 'raf' },
  );
  const spoken = await read.jsonValue();
  if (spoken === null) throw new Error('The preview did not reach the moment to read.');
  return spoken;
}

export async function changeLook(page: Page, controlId: string): Promise<void> {
  const stored = page.waitForResponse(
    (answer) => answer.url().endsWith(LOOK_STORED) && answer.request().method() === 'PUT' && answer.ok(),
  );
  await page.locator(`#${controlId}`).click();
  await stored;
}

export async function readLook(page: Page): Promise<LookText> {
  const readChosen = (group: string) => page.getByRole('group', { name: group }).locator('[aria-pressed="true"]').innerText();
  return {
    captions: await readChosen('Caption style'),
    framing: await readChosen('Framing'),
    hasHookTitle: await page.locator('#look-showHookTitle').isChecked(),
    hasSafeZones: await page.locator('#look-showSafeZones').isChecked(),
  };
}

export async function capturePlayer(page: Page): Promise<Buffer> {
  await waitForPicture(page);
  return page.locator('section.preview .player').screenshot();
}
