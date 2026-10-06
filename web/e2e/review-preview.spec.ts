import { statSync } from 'node:fs';
import { join, resolve } from 'node:path';

import type { APIRequestContext, APIResponse, Page } from '@playwright/test';

import type { Project } from '@/library';

import { createLinkProject, deleteProject, expect, test as toolTest, waitForStepDone } from './support';

const DESKTOP = { width: 1360, height: 900 };
const RANGE = { first: 1000, last: 1999 };
const PROBE_VIDEO = '#probe-video';
const JUMP_TO_SECONDS = 120;
const PLAYED_SECONDS = 0.5;
const LENGTH_TOLERANCE_SECONDS = 0.2;
const FONT_ADDRESS = '/fonts/inter/InterVariable.ttf';
const COMMITTED_FONT = resolve(import.meta.dirname, '..', 'public', 'fonts', 'inter', 'InterVariable.ttf');
const HEAVY_TEXT = '<p id="heavy-text" style="font-family: Inter; font-weight: 900">Heavy words</p>';

interface DrawnFont {
  familyName: string;
  isCustomFont: boolean;
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
