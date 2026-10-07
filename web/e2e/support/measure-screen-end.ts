import type { Page } from '@playwright/test';

export function findTextUnderBottomBar(page: Page): Promise<string[]> {
  return page.evaluate(listTextUnderBottomBar);
}

/* Runs inside the page, so it can use nothing declared outside itself. */
function listTextUnderBottomBar(): string[] {
  const EDGE = 1;
  const bar = document.querySelector('.tab-bar, .bottom-bar');
  const screen = document.querySelector('#screen');
  if (bar === null || screen === null) return ['this screen has no bar at the bottom to end above'];
  window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
  const barTop = bar.getBoundingClientRect().top;
  const reader = document.createRange();
  const isShown = (element: Element) => {
    const box = element.getBoundingClientRect();
    const isDrawn = element.checkVisibility({ opacityProperty: true, visibilityProperty: true });
    return isDrawn && box.width > EDGE && box.height > EDGE;
  };
  const isText = (node: ChildNode) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim() !== '';
  const endsUnderBar = (element: Element) =>
    [...element.childNodes].filter(isText).some((text) => {
      reader.selectNodeContents(text);
      return [...reader.getClientRects()].some((line) => line.bottom > barTop + EDGE);
    });
  const describe = (element: Element) => (element.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40);
  return [...screen.querySelectorAll('*')]
    .filter((element) => isShown(element) && endsUnderBar(element))
    .map((element) => `ends under the bar at the bottom: ${describe(element)}`);
}
