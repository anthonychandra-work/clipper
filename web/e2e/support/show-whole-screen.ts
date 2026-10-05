import type { Page } from '@playwright/test';

const MOST_PASSES = 5;

export async function showWholeScreen(page: Page, screenName: string): Promise<void> {
  await page.evaluate(waitForMotionToEnd);
  await growWindowToFit(page);
  await assertNothingIsOutOfView(page, screenName);
  await assertNoTextUnderTabBar(page, screenName);
}

async function growWindowToFit(page: Page): Promise<void> {
  for (let pass = 0; pass < MOST_PASSES; pass += 1) {
    const hiddenPx = await page.evaluate(measureHiddenBelow);
    if (hiddenPx === 0) return;
    await growWindow(page, hiddenPx);
  }
}

async function growWindow(page: Page, addedPx: number): Promise<void> {
  const size = page.viewportSize();
  if (size === null) throw new Error('The page has no window size to grow.');
  await page.setViewportSize({ width: size.width, height: size.height + addedPx });
}

async function assertNothingIsOutOfView(page: Page, screenName: string): Promise<void> {
  const hiddenPx = await page.evaluate(measureHiddenBelow);
  if (hiddenPx === 0) return;
  throw new Error(`${screenName}: ${hiddenPx} px are still out of view after growing the window ${MOST_PASSES} times.`);
}

async function assertNoTextUnderTabBar(page: Page, screenName: string): Promise<void> {
  const covered = await page.evaluate(findTextUnderTabBar);
  if (covered.length === 0) return;
  throw new Error(`${screenName}: text lies under the tab bar: ${covered.join(' | ')}`);
}

/* Runs inside the page, so it can use nothing declared outside itself. */
async function waitForMotionToEnd(): Promise<void> {
  const ending = document.getAnimations().filter((motion) => motion.effect?.getComputedTiming().endTime !== Infinity);
  await Promise.allSettled(ending.map((motion) => motion.finished));
  await new Promise((settle) => requestAnimationFrame(settle));
}

/* Runs inside the page, so it can use nothing declared outside itself. */
function measureHiddenBelow(): number {
  const scrollsDown = (element: Element) => {
    const overflow = getComputedStyle(element).overflowY;
    return overflow === 'auto' || overflow === 'scroll';
  };
  const measureHidden = (element: Element) => element.scrollHeight - element.clientHeight;
  const scrollers = [...document.querySelectorAll('body *')].filter(scrollsDown);
  return Math.max(0, ...[document.documentElement, ...scrollers].map(measureHidden));
}

/* Runs inside the page, so it can use nothing declared outside itself. */
function findTextUnderTabBar(): string[] {
  const EDGE = 1;
  const bar = document.querySelector('.tab-bar');
  if (bar === null) return [];
  const barBox = bar.getBoundingClientRect();
  const reader = document.createRange();
  const describe = (element: Element) => (element.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40);
  const isShown = (element: Element) => {
    const box = element.getBoundingClientRect();
    const isDrawn = element.checkVisibility({ opacityProperty: true, visibilityProperty: true });
    return isDrawn && box.width > EDGE && box.height > EDGE;
  };
  const isDrawnOverBar = (element: Element) => bar.contains(element) || element.closest('.sheet[open]') !== null;
  const liesUnderBar = (line: DOMRect) => {
    const overlapsDown = line.bottom > barBox.top + EDGE && line.top < barBox.bottom - EDGE;
    const overlapsAcross = line.right > barBox.left + EDGE && line.left < barBox.right - EDGE;
    return overlapsDown && overlapsAcross;
  };
  const isText = (node: ChildNode) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim() !== '';
  const hasLineUnderBar = (element: Element) =>
    [...element.childNodes].filter(isText).some((text) => {
      reader.selectNodeContents(text);
      return [...reader.getClientRects()].some(liesUnderBar);
    });
  const shown = [...document.querySelectorAll('body *')].filter(isShown);
  return shown.filter((element) => !isDrawnOverBar(element) && hasLineUnderBar(element)).map(describe);
}
