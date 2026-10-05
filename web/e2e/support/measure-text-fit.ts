import type { Page } from '@playwright/test';

import { visitScreens, type Walk } from './walk-screens';

const NORMAL_PERCENT = 100;
const TEXT_SIZES = [
  { name: 'the normal size', percent: NORMAL_PERCENT },
  { name: '200%', percent: 200 },
];

interface PageFit {
  sideways: string[];
  wide: string[];
  clipped: string[];
}

export interface TextFitReport {
  measured: string[];
  misfits: string[];
}

export async function enlargeTextFromLoad(page: Page, percent: number): Promise<void> {
  await page.addInitScript((size) => {
    const watcher = new MutationObserver(() => {
      const root = document.querySelector('html');
      if (root === null) return;
      root.style.fontSize = `${size}%`;
      watcher.disconnect();
    });
    watcher.observe(document, { childList: true });
  }, percent);
}

export async function findMisfits(page: Page): Promise<string[]> {
  await page.evaluate(waitForMotionToEnd);
  const fit = await page.evaluate(inspectFit);
  return [
    ...fit.sideways.map((element) => `scrolls sideways: ${element}`),
    ...fit.wide.map((element) => `wider than the screen: ${element}`),
    ...fit.clipped.map((element) => `clipped label: ${element}`),
  ];
}

export async function measureWalk(page: Page, walk: Walk): Promise<TextFitReport> {
  const report: TextFitReport = { measured: [], misfits: [] };
  for (const size of TEXT_SIZES) {
    if (size.percent !== NORMAL_PERCENT) await enlargeTextFromLoad(page, size.percent);
    await visitScreens(page, walk, async (screenName) => {
      const measured = `${screenName} at ${size.name}`;
      const misfits = await findMisfits(page);
      report.measured.push(measured);
      report.misfits.push(...misfits.map((misfit) => `${measured}: ${misfit}`));
    });
  }
  return report;
}

/* Runs inside the page, so it can use nothing declared outside itself. */
async function waitForMotionToEnd(): Promise<void> {
  const ending = document.getAnimations().filter((motion) => motion.effect?.getComputedTiming().endTime !== Infinity);
  await Promise.allSettled(ending.map((motion) => motion.finished));
  await new Promise((settle) => requestAnimationFrame(settle));
}

/* Runs inside the page, so it can use nothing declared outside itself. */
function inspectFit(): PageFit {
  const EDGE = 1;
  const describe = (element: Element) => {
    const text = (element.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40);
    return `<${element.tagName.toLowerCase()} class="${element.getAttribute('class') ?? ''}"> ${text}`;
  };
  const isShown = (element: Element) => {
    const box = element.getBoundingClientRect();
    const isDrawn = element.checkVisibility({ opacityProperty: true, visibilityProperty: true });
    return isDrawn && box.width > EDGE && box.height > EDGE;
  };
  const scrolls = (overflow: string) => overflow === 'auto' || overflow === 'scroll';
  const hides = (overflow: string) => overflow === 'hidden' || overflow === 'clip';
  const scrollsSideways = (element: Element) => {
    const canScroll = element === document.documentElement || scrolls(getComputedStyle(element).overflowX);
    return canScroll && element.scrollWidth > element.clientWidth + EDGE;
  };
  const isWide = (element: Element) => {
    const box = element.getBoundingClientRect();
    return box.width > window.innerWidth + EDGE || box.right > window.innerWidth + EDGE || box.left < -EDGE;
  };
  const findOwnText = (element: Element) =>
    [...element.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim() !== '');
  const cutsOwnText = (element: Element) => {
    const style = getComputedStyle(element);
    const cutsAcross = hides(style.overflowX) && element.scrollWidth > element.clientWidth + EDGE;
    const cutsDown = hides(style.overflowY) && element.scrollHeight > element.clientHeight + EDGE;
    return cutsAcross || cutsDown;
  };
  const spillsOwnText = (element: Element) => {
    const box = element.getBoundingClientRect();
    const lineSlack = parseFloat(getComputedStyle(element).fontSize) / 4;
    const reader = document.createRange();
    const leavesBox = (line: DOMRect) => {
      const leavesAcross = line.right > box.right + EDGE || line.left < box.left - EDGE;
      return leavesAcross || line.bottom > box.bottom + lineSlack || line.top < box.top - lineSlack;
    };
    return findOwnText(element).some((text) => {
      reader.selectNodeContents(text);
      return [...reader.getClientRects()].some(leavesBox);
    });
  };
  const isCutByAncestor = (element: Element) => {
    const box = element.getBoundingClientRect();
    for (let parent = element.parentElement; parent !== null; parent = parent.parentElement) {
      const style = getComputedStyle(parent);
      const frame = parent.getBoundingClientRect();
      if (hides(style.overflowX) && (box.right > frame.right + EDGE || box.left < frame.left - EDGE)) return true;
      if (hides(style.overflowY) && (box.bottom > frame.bottom + EDGE || box.top < frame.top - EDGE)) return true;
      if (scrolls(style.overflowY)) return false;
    }
    return false;
  };
  const cutsChoice = (select: HTMLSelectElement) => {
    const style = getComputedStyle(select);
    const pen = document.createElement('canvas').getContext('2d');
    if (pen === null) throw new Error('This browser has no canvas to measure the chosen option with.');
    pen.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    return pen.measureText(select.selectedOptions[0]?.label ?? '').width + padding > select.clientWidth + EDGE;
  };
  const isClipped = (element: Element) => {
    if (element instanceof HTMLSelectElement) return cutsChoice(element);
    if (findOwnText(element).length === 0) return false;
    return cutsOwnText(element) || spillsOwnText(element) || isCutByAncestor(element);
  };
  const shown = [...document.querySelectorAll('body *')].filter(isShown);
  return {
    sideways: [document.documentElement, ...shown].filter(scrollsSideways).map(describe),
    wide: shown.filter(isWide).map(describe),
    clipped: shown.filter(isClipped).map(describe),
  };
}
