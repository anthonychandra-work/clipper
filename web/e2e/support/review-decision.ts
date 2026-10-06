import { expect, type Locator, type Page } from '@playwright/test';

export interface DecisionButtons {
  reject: string;
  isRejectMarked: boolean;
  keep: string;
  isKeepPressed: boolean;
  next: string;
  nextAddress: string | null;
}

export interface RejectMenuText {
  label: string | null;
  title: string;
  choices: string[];
  chosen: string[];
  others: string[];
  dividers: number;
}

export function rejectMenu(page: Page): Locator {
  return page.locator('#menu:not([hidden]) .menu[role="menu"]');
}

export async function readDecisionButtons(page: Page): Promise<DecisionButtons> {
  const reject = page.locator('#decision-reject');
  const keep = page.locator('#decision-keep');
  const next = page.locator('#decision-next');
  return {
    reject: (await reject.innerText()).trim(),
    isRejectMarked: /bar-button--rejected/.test((await reject.getAttribute('class')) ?? ''),
    keep: (await keep.innerText()).trim(),
    isKeepPressed: (await keep.getAttribute('aria-pressed')) === 'true',
    next: (await next.innerText()).trim(),
    nextAddress: await next.getAttribute('href'),
  };
}

export async function openRejectMenu(page: Page): Promise<Locator> {
  await page.locator('#decision-reject').click();
  await expect(rejectMenu(page)).toBeVisible();
  return rejectMenu(page);
}

export async function readRejectMenu(page: Page): Promise<RejectMenuText> {
  const menu = rejectMenu(page);
  const choices = menu.getByRole('menuitemradio');
  return {
    label: await menu.getAttribute('aria-label'),
    title: (await menu.locator('.menu__title').innerText()).trim(),
    choices: (await choices.allInnerTexts()).map((text) => text.trim()),
    chosen: (await menu.locator('[role="menuitemradio"][aria-checked="true"]').allInnerTexts()).map((text) => text.trim()),
    others: (await menu.getByRole('menuitem').allInnerTexts()).map((text) => text.trim()),
    dividers: await menu.locator('hr.menu__divider').count(),
  };
}

export async function rejectAs(page: Page, reason: string): Promise<void> {
  const menu = await openRejectMenu(page);
  await menu.getByRole('menuitemradio', { name: reason }).click();
  await expect(rejectMenu(page)).toHaveCount(0);
}
