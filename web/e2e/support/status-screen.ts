import type { Locator, Page } from '@playwright/test';

export interface StatusCardText {
  heading: string;
  stage: string;
  footnote: string | null;
  buttons: string[];
  links: string[];
  hasBar: boolean;
  hasWarning: boolean;
}

export function statusCard(page: Page): Locator {
  return page.locator('section.status-card');
}

export async function readStatusCard(page: Page): Promise<StatusCardText> {
  const card = statusCard(page);
  const footnote = card.locator('.list-footer');
  return {
    heading: await card.locator('h2.status-card__title').innerText(),
    stage: await card.locator('.status-card__stage').innerText(),
    footnote: (await footnote.count()) > 0 ? await footnote.innerText() : null,
    buttons: await card.getByRole('button').allInnerTexts(),
    links: await card.getByRole('link').allInnerTexts(),
    hasBar: (await card.getByRole('progressbar').count()) > 0,
    hasWarning: (await card.locator(':scope > svg.icon').count()) > 0,
  };
}
