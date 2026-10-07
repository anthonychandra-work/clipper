import { expect, type Locator, type Page } from '@playwright/test';

export interface ViewsRowText {
  rank: string;
  title: string;
  views: string;
  fieldId: string;
}

export interface OutcomeRowText {
  title: string;
  views: string;
  shareOfTrack: number;
}

export interface OutcomeText {
  line: string;
  rows: OutcomeRowText[];
}

export async function openResults(page: Page, projectId: string): Promise<void> {
  await page.goto(`/projects/${projectId}/results`);
  await expect(page.locator('#tab-results')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.views-row, .empty').first()).toBeVisible();
}

export function viewsField(page: Page, clipId: string): Locator {
  return page.locator(`#views-${clipId}`);
}

export async function typeViews(page: Page, clipId: string, typed: string): Promise<void> {
  const stored = page.waitForResponse(
    (answer) => answer.url().endsWith(`/clips/${clipId}/views`) && answer.request().method() === 'PUT',
  );
  await viewsField(page, clipId).fill(typed);
  await stored;
}

export function readViewsRows(page: Page): Promise<ViewsRowText[]> {
  return page.locator('.views-row').evaluateAll((rows) =>
    rows.map((row) => {
      const field = row.querySelector('input');
      return {
        rank: (row.querySelector('.views-row__rank')?.textContent ?? '').trim(),
        title: (row.querySelector(`label[for="${field?.id}"]`)?.textContent ?? '').trim(),
        views: field?.value ?? '',
        fieldId: field?.id ?? '',
      };
    }),
  );
}

export async function readOutcome(page: Page): Promise<OutcomeText> {
  const outcome = page.locator('#outcome');
  const rows = await outcome.locator('.outcome__row').evaluateAll((shown) =>
    shown.map((row) => {
      const [title, views] = [...row.querySelectorAll('.outcome__head span')].map((part) => (part.textContent ?? '').trim());
      const track = row.querySelector('.outcome__track')?.getBoundingClientRect().width ?? 0;
      const fill = row.querySelector('.outcome__fill')?.getBoundingClientRect().width ?? 0;
      return { title, views, shareOfTrack: track === 0 ? 0 : fill / track };
    }),
  );
  return { line: (await outcome.locator('p').first().innerText()).trim(), rows };
}
