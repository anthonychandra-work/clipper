import { expect, type Locator, type Page } from '@playwright/test';

export interface ShownProblem {
  section: string;
  message: string;
}

export function newProjectForm(page: Page): Locator {
  return page.locator('dialog#sheet[open] form.sheet__form');
}

export async function openNewProjectSheet(page: Page): Promise<void> {
  await page.goto('/new');
  await expect(newProjectForm(page)).toBeVisible();
}

export async function pressFindClips(page: Page): Promise<void> {
  await newProjectForm(page).getByRole('button', { name: 'Find Clips' }).click();
}

export async function readShownProblem(page: Page): Promise<ShownProblem> {
  const problem = newProjectForm(page).locator('p.field-error#draft-problem[role="alert"]');
  await expect(problem).toBeVisible();
  const section = problem.locator('xpath=ancestor::section[1]').locator('.list-header');
  return { section: await section.innerText(), message: (await problem.innerText()).trim() };
}

export async function createLinkProjectInSheet(page: Page, link: string): Promise<string> {
  await openNewProjectSheet(page);
  await page.locator('#draft-link').fill(link);
  await pressFindClips(page);
  return readOpenedProjectId(page);
}

export async function createFileProjectInSheet(page: Page, file: string): Promise<string> {
  await openNewProjectSheet(page);
  await page.getByRole('button', { name: 'Upload a File' }).click();
  await page.locator('#draft-file').setInputFiles(file);
  await pressFindClips(page);
  return readOpenedProjectId(page);
}

async function readOpenedProjectId(page: Page): Promise<string> {
  await page.waitForURL(/\/projects\/[0-9a-f]{12}$/);
  return new URL(page.url()).pathname.split('/')[2];
}
