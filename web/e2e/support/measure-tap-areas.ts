import type { Page } from '@playwright/test';

const TAP_REACH_PX = 21;

export function findSmallTapAreas(page: Page): Promise<string[]> {
  return page.evaluate(listSmallTapAreas, TAP_REACH_PX);
}

/* Runs inside the page, so it can use nothing declared outside itself. */
function listSmallTapAreas(reachPx: number): string[] {
  const CONTROLS =
    'a[href], button, input, select, textarea, [role="button"], [role="slider"], [role="switch"], [role="menuitem"], [role="menuitemradio"]';
  const TAPS = [
    { name: 'left', across: -reachPx, down: 0 },
    { name: 'right', across: reachPx, down: 0 },
    { name: 'above', across: 0, down: -reachPx },
    { name: 'below', across: 0, down: reachPx },
  ];
  const describe = (control: Element) => {
    const text = (control.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40);
    const name = control.id === '' ? `class="${control.getAttribute('class') ?? ''}"` : `id="${control.id}"`;
    return `<${control.tagName.toLowerCase()} ${name}> ${control.getAttribute('aria-label') ?? text}`;
  };
  const isOffered = (control: Element) => {
    const isSwitchedOff = control.matches(':disabled, [aria-disabled="true"]');
    return !isSwitchedOff && control.checkVisibility({ opacityProperty: true, visibilityProperty: true });
  };
  const landsOn = (control: Element, hit: Element | null) => {
    if (hit === null) return false;
    const label = hit.closest('label');
    return control.contains(hit) || label?.control === control || label?.contains(control) === true;
  };
  const tapAround = (control: Element) => {
    control.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
    const box = control.getBoundingClientRect();
    const middle = { across: box.left + box.width / 2, down: box.top + box.height / 2 };
    const hitAt = (across: number, down: number) => document.elementFromPoint(middle.across + across, middle.down + down);
    if (!landsOn(control, hitAt(0, 0))) return [];
    return TAPS.filter((tap) => !landsOn(control, hitAt(tap.across, tap.down))).map((tap) => tap.name);
  };
  const leftAt = { across: window.scrollX, down: window.scrollY };
  const small = [...document.querySelectorAll(CONTROLS)].filter(isOffered).flatMap((control) => {
    const missed = tapAround(control);
    return missed.length === 0 ? [] : [`tap area under 44 px, missed ${missed.join(' and ')}: ${describe(control)}`];
  });
  window.scrollTo(leftAt.across, leftAt.down);
  return small;
}
