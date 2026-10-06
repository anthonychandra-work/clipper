import type { Page } from '@playwright/test';

const LEAST_RATIO = 4.5;

export function findFaintTexts(page: Page): Promise<string[]> {
  return page.evaluate(listFaintTexts, LEAST_RATIO);
}

/* Runs inside the page, so it can use nothing declared outside itself. */
function listFaintTexts(leastRatio: number): string[] {
  type Colour = [number, number, number, number];
  const WHITE: Colour = [255, 255, 255, 1];
  const OVER_THE_VIDEO = '.player:not(.player--gone), .app:not([data-preview="docked"]) .player-shell';
  const SWITCHED_OFF = ':disabled, [aria-disabled="true"]';
  const read = (colour: string): Colour => {
    const [red = 0, green = 0, blue = 0, alpha = 1] = (colour.match(/[\d.]+/g) ?? []).map(Number);
    return [red, green, blue, alpha];
  };
  const lay = (top: Colour, under: Colour): Colour => {
    const mix = (place: number) => top[place] * top[3] + under[place] * (1 - top[3]);
    return [mix(0), mix(1), mix(2), 1];
  };
  const listLayers = (element: Element): Colour[][] => {
    const style = getComputedStyle(element);
    const gradients = style.backgroundImage.split(/,\s*(?=[\w-]*gradient\()/).reverse();
    const stops = gradients.map((gradient) => (gradient.match(/rgba?\([^)]*\)/g) ?? []).map(read));
    return [[read(style.backgroundColor)], ...stops.filter((colours) => colours.length > 0)];
  };
  const listBackdrops = (element: Element): Colour[] => {
    const parent = element.parentElement;
    const layers = listLayers(element);
    const isOpaque = layers[0][0][3] === 1;
    const under = isOpaque || parent === null ? [WHITE] : listBackdrops(parent);
    return layers.reduce((backdrops, layer) => backdrops.flatMap((below) => layer.map((colour) => lay(colour, below))), under);
  };
  const measureLight = ([red, green, blue]: Colour) => {
    const [linearRed, linearGreen, linearBlue] = [red, green, blue].map((level) => {
      const share = level / 255;
      return share <= 0.03928 ? share / 12.92 : ((share + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * linearRed + 0.7152 * linearGreen + 0.0722 * linearBlue;
  };
  const measureRatio = (ink: Colour, backdrop: Colour) => {
    const lights = [measureLight(lay(ink, backdrop)), measureLight(backdrop)];
    return (Math.max(...lights) + 0.05) / (Math.min(...lights) + 0.05);
  };
  const holdsText = (element: Element) => {
    const isTyped = element instanceof HTMLInputElement && element.type === 'text' && element.value !== '';
    const hasOwnText = [...element.childNodes].some(
      (node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim() !== '',
    );
    return isTyped || hasOwnText;
  };
  const isMeasured = (element: Element) => {
    const box = element.getBoundingClientRect();
    const isDrawn = element.checkVisibility({ opacityProperty: true, visibilityProperty: true });
    const isLeftOut = element.closest(OVER_THE_VIDEO) !== null || element.closest(SWITCHED_OFF) !== null;
    return isDrawn && box.width > 1 && box.height > 1 && !isLeftOut && holdsText(element);
  };
  const describe = (element: Element, ratio: number) => {
    const text = (element instanceof HTMLInputElement ? element.value : (element.textContent ?? '')).trim();
    const name = `<${element.tagName.toLowerCase()} class="${element.getAttribute('class') ?? ''}">`;
    return `${ratio.toFixed(2)} to 1: ${name} ${text.replace(/\s+/g, ' ').slice(0, 40)}`;
  };
  return [...document.querySelectorAll('body *')].filter(isMeasured).flatMap((element) => {
    const ink = read(getComputedStyle(element).color);
    const ratio = Math.min(...listBackdrops(element).map((backdrop) => measureRatio(ink, backdrop)));
    return ratio < leastRatio ? [describe(element, ratio)] : [];
  });
}
