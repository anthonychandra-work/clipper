import { expect, type Page } from '@playwright/test';

type StepOfAPoint = 'move-edge-earlier' | 'move-edge-later' | 'nudge-edge-earlier' | 'nudge-edge-later';

export type StepName = `${'start' | 'end'}-${StepOfAPoint}`;

export interface TrimText {
  inTime: string;
  outTime: string;
  length: string;
  reading: string;
  switchedOff: string[];
}

export interface HandleText {
  label: string | null;
  now: string | null;
  most: string | null;
  words: string | null;
}

export interface TranscriptLine {
  edge: string;
  text: string;
  isIncluded: boolean;
}

export interface StripFrame {
  isLoaded: boolean;
  heightPx: number;
  address: string | null;
}

export async function readTrim(page: Page): Promise<TrimText> {
  const edges = page.locator('#trim-edges .edge');
  await expect(edges).toHaveCount(2);
  const reading = (await page.locator('#trim-band .band__reading').innerText()).trim();
  return {
    inTime: (await edges.nth(0).locator('.edge__time').innerText()).trim(),
    outTime: (await edges.nth(1).locator('.edge__time').innerText()).trim(),
    length: reading.split(',')[0],
    reading: reading.slice(reading.indexOf(',') + 1).trim(),
    switchedOff: await page.locator('#trim-edges .stepper__step:disabled').evaluateAll((steps) => steps.map((step) => step.id)),
  };
}

export async function pressStep(page: Page, step: StepName, times = 1): Promise<void> {
  for (let press = 0; press < times; press += 1) {
    const stored = page.waitForResponse((answer) => answer.request().method() === 'PATCH' && answer.ok());
    await page.locator(`#${step}`).click();
    await stored;
  }
}

export async function readHandle(page: Page, edge: 'start' | 'end'): Promise<HandleText> {
  const handle = page.locator(`#trim-handle-${edge}[role="slider"]`);
  return {
    label: await handle.getAttribute('aria-label'),
    now: await handle.getAttribute('aria-valuenow'),
    most: await handle.getAttribute('aria-valuemax'),
    words: await handle.getAttribute('aria-valuetext'),
  };
}

export function readTranscriptLines(page: Page): Promise<TranscriptLine[]> {
  return page.locator('#trim-transcript .transcript__line').evaluateAll((lines) =>
    lines.map((line) => ({
      edge: (line.querySelector('.transcript__edge')?.textContent ?? '').trim(),
      text: (line.querySelector('span:last-child')?.textContent ?? '').trim(),
      isIncluded: line.classList.contains('transcript__line--in'),
    })),
  );
}

export async function readStripFrames(page: Page): Promise<StripFrame[]> {
  const frames = page.locator('#filmstrip .filmstrip__frame');
  await expect(frames.locator('img').first()).toBeVisible();
  await page.waitForFunction(() => [...document.querySelectorAll('#filmstrip img')].every((frame) => (frame as HTMLImageElement).complete));
  return frames.evaluateAll((places) =>
    places.map((place) => {
      const picture = place.querySelector('img');
      return {
        isLoaded: picture !== null && picture.complete && picture.naturalWidth > 0,
        heightPx: picture?.naturalHeight ?? 0,
        address: picture?.getAttribute('src') ?? null,
      };
    }),
  );
}

export async function holdHandleAt(page: Page, edge: 'start' | 'end', shareOfStrip: number): Promise<void> {
  const strip = await page.locator('#filmstrip').boundingBox();
  const handle = await page.locator(`#trim-handle-${edge}`).boundingBox();
  if (strip === null || handle === null) throw new Error('The filmstrip is not on the screen.');
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
  await page.mouse.down();
  await page.mouse.move(strip.x + strip.width * shareOfStrip, strip.y + strip.height / 2, { steps: 8 });
}
