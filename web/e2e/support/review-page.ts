import { expect, type Locator, type Page } from '@playwright/test';

export interface CandidateRowText {
  id: string;
  rank: string;
  title: string;
  meta: string;
  tags: string[];
  score: string;
  address: string | null;
  isCurrent: boolean;
}

export function candidateRow(page: Page, clipId: string): Locator {
  return page.locator(`#candidate-${clipId}`);
}

export async function openReview(page: Page, projectId: string): Promise<void> {
  await page.goto(`/projects/${projectId}/review`);
  await expect(page.locator('.candidate__open').first()).toBeVisible();
}

export function readCandidateRows(page: Page): Promise<CandidateRowText[]> {
  return page.locator('.pane--list .candidate__open').evaluateAll((rows) =>
    rows.map((row) => {
      const read = (part: string) => (row.querySelector(part)?.textContent ?? '').trim();
      return {
        id: row.id.replace('candidate-', ''),
        rank: read('.candidate__rank'),
        title: read('.candidate__title'),
        meta: read('.candidate__meta'),
        tags: [...row.querySelectorAll('.tag')].map((tag) => (tag.textContent ?? '').trim()),
        score: read('.candidate__score').replace('Score ', ''),
        address: row.getAttribute('href'),
        isCurrent: row.getAttribute('aria-current') === 'true',
      };
    }),
  );
}

export function readFilterCounts(page: Page): Promise<string[]> {
  const filters = page.getByRole('group', { name: 'Show' }).locator('.segmented__option');
  return filters.evaluateAll((options) => options.map((option) => (option.textContent ?? '').trim()));
}

export async function listCurrentRows(page: Page): Promise<string[]> {
  const rows = await readCandidateRows(page);
  return rows.filter((row) => row.isCurrent).map((row) => row.id);
}
