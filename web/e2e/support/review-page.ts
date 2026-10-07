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

export interface InspectorText {
  title: string;
  flag: string | null;
  reason: string;
  scores: string[];
  scoreShares: number[];
  replayNote: string | null;
  standing: string;
}

export async function readInspector(page: Page): Promise<InspectorText> {
  const inspector = page.locator('section.inspector[aria-label="Clip details"]');
  const why = inspector.locator('.group-section', { has: page.getByRole('heading', { name: 'Why This Clip' }) });
  const readOrNull = async (part: Locator) => ((await part.count()) > 0 ? squeeze(await part.innerText()) : null);
  return {
    title: await inspector.locator('#clip-title').inputValue(),
    flag: await readOrNull(inspector.locator('.flag[role="note"] .flag__message')),
    reason: squeeze(await why.locator('.group--padded > p').first().innerText()),
    scores: (await why.locator('.score').allInnerTexts()).map(squeeze),
    scoreShares: await why.locator('.score__track').evaluateAll((tracks) =>
      tracks.map((track) => {
        const fill = track.querySelector('.score__fill');
        return (fill?.getBoundingClientRect().width ?? 0) / track.getBoundingClientRect().width;
      }),
    ),
    replayNote: await readOrNull(why.locator('.replay-note')),
    standing: squeeze(await why.locator('.list-footer').innerText()),
  };
}

function squeeze(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

export interface TimelineBar {
  heightPx: number;
  isShortlisted: boolean;
}

export interface TimelinePinText {
  id: string;
  number: string;
  label: string | null;
  address: string | null;
  middlePx: number;
  isOnLowRow: boolean;
  isCurrent: boolean;
}

export function readTimelineBars(page: Page): Promise<TimelineBar[]> {
  return page.locator('.timeline__bars .timeline__bar').evaluateAll((bars) =>
    bars.map((bar) => ({
      heightPx: bar.getBoundingClientRect().height,
      isShortlisted: bar.classList.contains('is-shortlisted'),
    })),
  );
}

export async function readTimelinePins(page: Page): Promise<TimelinePinText[]> {
  await expect(page.locator('.timeline__pin').first()).toBeVisible();
  return page.locator('.timeline__pins .timeline__pin').evaluateAll((pins) =>
    pins.map((pin) => {
      const box = pin.getBoundingClientRect();
      return {
        id: pin.id.replace('pin-', ''),
        number: (pin.textContent ?? '').trim(),
        label: pin.getAttribute('aria-label'),
        address: pin.getAttribute('href'),
        middlePx: box.left + box.width / 2,
        isOnLowRow: pin.classList.contains('timeline__pin--low'),
        isCurrent: pin.classList.contains('is-selected'),
      };
    }),
  );
}
