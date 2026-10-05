import { basename, join } from 'node:path';

import type { Page } from '@playwright/test';

import { showWholeScreen } from './show-whole-screen';
import { visitScreens, type Walk } from './walk-screens';

const CAPTURE_SIZES = [
  { width: 390, height: 844 },
  { width: 1360, height: 900 },
];
const THEMES = ['light', 'dark'] as const;
const CAPTURED_AS = new Map([
  ['library', 'library'],
  ['empty-library', 'empty-library'],
  ['new-project-link', 'new-project'],
  ['status-processing', 'status'],
  ['project-review', 'project'],
  ['settings', 'settings'],
]);

type WindowSize = (typeof CAPTURE_SIZES)[number];

export async function captureScreens(page: Page, walk: Walk, folder: string): Promise<string[]> {
  const captured = { ...walk, screens: walk.screens.filter((screen) => CAPTURED_AS.has(screen.name)) };
  const saved: string[] = [];
  for (const size of CAPTURE_SIZES) {
    for (const theme of THEMES) {
      await page.setViewportSize(size);
      await page.emulateMedia({ colorScheme: theme });
      await visitScreens(page, captured, async (screenName) => {
        const file = `${CAPTURED_AS.get(screenName)}-${size.width}-${theme}.png`;
        await saveWholeScreen(page, size, join(folder, file));
        saved.push(file);
      });
    }
  }
  return saved;
}

async function saveWholeScreen(page: Page, size: WindowSize, path: string): Promise<void> {
  await showWholeScreen(page, basename(path));
  await page.screenshot({ path, animations: 'disabled' });
  await page.setViewportSize(size);
}
