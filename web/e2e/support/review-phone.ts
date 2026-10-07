import type { Page } from '@playwright/test';

export interface BottomBarText {
  position: string;
  gapBelowPx: number;
  controls: string[];
  tabBars: number;
}

export interface DockText {
  place: string | null;
  shellPosition: string;
  gapUnderTopBarPx: number;
  pictureWidthPx: number;
  shownInStrip: string[];
}

export function scrollWindowTo(page: Page, top: number): Promise<number> {
  return page.evaluate(async (wanted) => {
    window.scrollTo(0, wanted);
    await new Promise((settle) => requestAnimationFrame(settle));
    return window.scrollY;
  }, top);
}

export function readWindowTop(page: Page): Promise<number> {
  return page.evaluate(() => window.scrollY);
}

export function readBottomBar(page: Page): Promise<BottomBarText> {
  return page.evaluate(() => {
    const bar = document.querySelector('.bottom-bar');
    return {
      position: bar === null ? 'none' : getComputedStyle(bar).position,
      gapBelowPx: bar === null ? Number.NaN : window.innerHeight - bar.getBoundingClientRect().bottom,
      controls: [...(bar?.querySelectorAll('a, button') ?? [])].map((control) => control.id),
      tabBars: document.querySelectorAll('.tab-bar').length,
    };
  });
}

export function readDock(page: Page): Promise<DockText> {
  return page.evaluate(() => {
    const shell = document.querySelector('.player-shell');
    const topBar = document.querySelector('.toolbar');
    if (shell === null || topBar === null) throw new Error('This screen has no preview under a top bar.');
    const strip = shell.getBoundingClientRect();
    const isInStrip = (part: Element) => {
      const box = part.getBoundingClientRect();
      return box.width > 0 && box.top >= strip.top && box.bottom <= strip.bottom && box.left >= strip.left && box.right <= strip.right;
    };
    const parts = ['.player', '#preview-play', '#preview-scrubber', '#preview-clock'];
    return {
      place: document.querySelector('#app')?.getAttribute('data-preview') ?? null,
      shellPosition: getComputedStyle(shell).position,
      gapUnderTopBarPx: strip.top - topBar.getBoundingClientRect().bottom,
      pictureWidthPx: shell.querySelector('.player')?.getBoundingClientRect().width ?? 0,
      shownInStrip: parts.filter((part) => [...shell.querySelectorAll(part)].some(isInStrip)),
    };
  });
}
