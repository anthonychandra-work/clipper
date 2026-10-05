import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import type { Page } from '@playwright/test';

import {
  createLinkProject,
  deleteAllProjects,
  expect,
  KEYLESS_END,
  listProjects,
  projectRow,
  statusCard,
  test,
  waitForKeylessEnd,
  waitForStatus,
} from './support';

const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1360, height: 900 };
const WHAT_IS_REMOVED = 'This removes the video, its clips and its exports from this Mac. It cannot be undone.';

async function askToDelete(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'More' }).click();
  await page.getByRole('menuitem', { name: 'Delete Project…' }).click();
}

test.afterEach(async ({ request }) => {
  await deleteAllProjects(request);
});

test.describe('at 390 px', () => {
  test.use({ viewport: PHONE });

  test('the More menu offers Delete Project, and the confirmation names the project', async ({
    page,
    request,
    fixtureServer,
  }) => {
    const project = await createLinkProject(request, `${fixtureServer.address}/missing.mp4`);
    await page.goto(`/projects/${project.id}`);
    const more = page.getByRole('button', { name: 'More' });

    await more.click();
    const menu = page.locator('#menu .menu[role="menu"][aria-label="Project"]');
    await expect(more).toHaveAttribute('aria-expanded', 'true');
    await expect(menu.getByRole('menuitem')).toHaveText(['Delete Project…']);
    await expect(menu.getByRole('menuitem', { name: 'Delete Project…' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('#menu')).toBeHidden();
    await expect(more).toBeFocused();
    await askToDelete(page);

    const alert = page.locator('dialog#sheet[open] .alert');
    await expect(alert.locator('h2#sheet-title')).toHaveText('Delete “New video from link”?');
    await expect(alert.locator('.alert__message')).toHaveText(WHAT_IS_REMOVED);
    await expect(alert.getByRole('button')).toHaveText(['Cancel', 'Delete']);
  });

  test('Cancel removes neither the row nor the folder, and Delete removes both', async ({
    page,
    request,
    fixtureServer,
    tool,
  }) => {
    const created = await createLinkProject(request, `${fixtureServer.address}/talk.mp4`);
    await waitForKeylessEnd(request, created.id);
    const folder = join(tool.settings.dataDir, 'projects', created.id);
    await page.goto(`/projects/${created.id}`);

    await askToDelete(page);
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.locator('dialog#sheet[open]')).toHaveCount(0);
    const filesAfterCancel = readdirSync(folder).sort();
    const projectsAfterCancel = await listProjects(request);
    await askToDelete(page);
    await page.getByRole('button', { name: 'Delete', exact: true }).click();

    await expect(page.locator('#toast')).toHaveText('Project deleted');
    await expect(page).toHaveURL('/');
    await expect(projectRow(page, created.id)).toHaveCount(0);
    expect(filesAfterCancel).toEqual(KEYLESS_END.files);
    expect(projectsAfterCancel.map((project) => project.id)).toEqual([created.id]);
    expect(existsSync(folder)).toBe(false);
    expect(await listProjects(request)).toEqual([]);
  });

  test('deleting a project while it is being fetched stops it and leaves no folder', async ({
    page,
    request,
    fixtureServer,
    tool,
  }) => {
    const project = await createLinkProject(request, `${fixtureServer.address}/slow/talk.mp4`);
    const folder = join(tool.settings.dataDir, 'projects', project.id);
    await page.goto(`/projects/${project.id}`);
    await expect(statusCard(page).locator('h2')).toHaveText('Finding Clips');
    await expect.poll(() => existsSync(folder)).toBe(true);

    await askToDelete(page);
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(page.locator('#toast')).toHaveText('Project deleted');
    await page.waitForTimeout(1500);

    expect(existsSync(folder)).toBe(false);
    expect(await listProjects(request)).toEqual([]);
    await expect(page).toHaveURL('/');
  });
});

test.describe('at 1360 px', () => {
  test.use({ viewport: DESKTOP });

  test('the menu opens under the More control, and deleting shows the next project', async ({
    page,
    request,
    fixtureServer,
  }) => {
    const older = await createLinkProject(request, `${fixtureServer.address}/missing.mp4`);
    const newer = await createLinkProject(request, `${fixtureServer.address}/missing.mp4`);
    await waitForStatus(request, newer.id, 'failed');
    await page.goto(`/projects/${newer.id}`);

    await page.getByRole('button', { name: 'More' }).click();
    const more = await page.getByRole('button', { name: 'More' }).boundingBox();
    const menu = await page.locator('#menu').boundingBox();
    await page.getByRole('menuitem', { name: 'Delete Project…' }).click();
    await page.getByRole('button', { name: 'Delete', exact: true }).click();

    expect(menu && more && menu.y).toBeGreaterThan((more?.y ?? 0) + (more?.height ?? 0));
    await expect(page).toHaveURL('/');
    await expect(projectRow(page, newer.id)).toHaveCount(0);
    await expect(projectRow(page, older.id)).toHaveAttribute('aria-current', 'true');
  });
});
