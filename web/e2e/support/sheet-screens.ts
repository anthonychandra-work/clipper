import { rmSync, truncateSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, type Locator, type Page } from '@playwright/test';

import { newProjectForm, openNewProjectSheet, pressFindClips } from './new-project-sheet';
import type { ScreenVisit } from './walk-screens';

const OVER_FOUR_GB_IN_BYTES = 4 * 1024 ** 3 + 1;
const PLATFORMS = ['TikTok', 'Reels', 'Shorts'];
const LINK_THAT_RESOLVES_NOWHERE = 'https://clipper.invalid/talk.mp4';

export interface SheetFiles {
  video: string;
  runDir: string;
}

export function listSheetScreens(files: SheetFiles): ScreenVisit[] {
  return [
    { name: 'new-project-link', open: openNewProjectSheet },
    { name: 'new-project-file', open: (page) => showChosenFile(page, files.video) },
    {
      name: 'error-bad-link',
      open: (page) => showSheetProblem(page, (form) => form.locator('#draft-link').fill('youtube.com/watch')),
    },
    { name: 'error-no-file', open: (page) => showSheetProblem(page, chooseFileSource) },
    { name: 'error-no-platform', open: (page) => showSheetProblem(page, turnOffEveryPlatform) },
    { name: 'error-large-file', open: (page) => showLargeFileProblem(page, files.runDir) },
  ];
}

export function listLowDiskScreens(link: string): ScreenVisit[] {
  return [
    {
      name: 'error-low-disk',
      open: (page) => showSheetProblem(page, (form) => form.locator('#draft-link').fill(link)),
    },
  ];
}

async function showSheetProblem(page: Page, prepare: (form: Locator) => Promise<void>): Promise<void> {
  await openNewProjectSheet(page);
  await prepare(newProjectForm(page));
  await pressFindClips(page);
  await expect(page.locator('#draft-problem')).toBeVisible();
}

async function showChosenFile(page: Page, file: string): Promise<void> {
  await openNewProjectSheet(page);
  await chooseFileSource(newProjectForm(page));
  await page.locator('#draft-file').setInputFiles(file);
  await expect(page.locator('#draft-file-name')).toContainText('Chosen:');
}

async function showLargeFileProblem(page: Page, runDir: string): Promise<void> {
  const file = join(runDir, 'over-four-gigabytes.mp4');
  writeFileSync(file, '');
  truncateSync(file, OVER_FOUR_GB_IN_BYTES);
  try {
    await showSheetProblem(page, async (form) => {
      await chooseFileSource(form);
      await form.locator('#draft-file').setInputFiles(file);
    });
  } finally {
    rmSync(file);
  }
}

async function chooseFileSource(form: Locator): Promise<void> {
  await form.getByRole('button', { name: 'Upload a File' }).click();
}

async function turnOffEveryPlatform(form: Locator): Promise<void> {
  await form.locator('#draft-link').fill(LINK_THAT_RESOLVES_NOWHERE);
  for (const platform of PLATFORMS) {
    await form.getByRole('switch', { name: platform }).click();
  }
}
