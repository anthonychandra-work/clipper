import type { Locator, Page } from '@playwright/test';

import {
  createLinkProject,
  deleteAllProjects,
  expect,
  newProjectSheet,
  openNewProjectSheet,
  projectRow,
  test,
  waitForStatus,
} from './support';

const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1360, height: 900 };
const TAB_BAR_REACH = 48;
const HALF_PIXEL = 0.5;

interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
}

async function boxOf(locator: Locator): Promise<Box> {
  const box = await locator.boundingBox();
  if (box === null) throw new Error('The element has no box to measure.');
  return { left: box.x, top: box.y, right: box.x + box.width, bottom: box.y + box.height, width: box.width };
}

async function boxOfSettledSheet(page: Page): Promise<Box> {
  await openNewProjectSheet(page);
  const sheet = newProjectSheet(page);
  await sheet.evaluate((dialog) => Promise.allSettled(dialog.getAnimations().map((motion) => motion.finished)));
  return boxOf(sheet);
}

test.afterEach(async ({ request }) => {
  await deleteAllProjects(request);
});

test.describe('at 390 px', () => {
  test.use({ viewport: PHONE });

  test('the Library is a list above a tab bar at the bottom edge', async ({ page, request, fixtureServer }) => {
    const project = await createLinkProject(request, `${fixtureServer.address}/missing.mp4`);
    await waitForStatus(request, project.id, 'failed');
    await page.goto('/');
    await expect(projectRow(page, project.id)).toBeVisible();

    const list = await boxOf(page.locator('main ul.project-rows'));
    const tabBar = await boxOf(page.locator('.tab-bar__pill'));

    expect(list.left).toBeGreaterThanOrEqual(0);
    expect(list.right).toBeLessThanOrEqual(PHONE.width);
    expect(list.bottom).toBeLessThanOrEqual(tabBar.top);
    expect(tabBar.bottom).toBeLessThanOrEqual(PHONE.height);
    expect(tabBar.bottom).toBeGreaterThan(PHONE.height - TAB_BAR_REACH);
    expect(Math.abs((tabBar.left + tabBar.right) / 2 - PHONE.width / 2)).toBeLessThanOrEqual(HALF_PIXEL);
    await expect(page.locator('#sidebar')).toHaveCount(0);
  });

  test('the new project sheet spans the width and rises from the bottom edge', async ({ page }) => {
    const sheet = await boxOfSettledSheet(page);

    expect(sheet.left).toBe(0);
    expect(sheet.width).toBe(PHONE.width);
    expect(sheet.bottom).toBe(PHONE.height);
    expect(sheet.top).toBeGreaterThan(0);
  });
});

test.describe('at 1360 px', () => {
  test.use({ viewport: DESKTOP });

  test('the projects are in a sidebar beside the screen', async ({ page, request, fixtureServer }) => {
    const project = await createLinkProject(request, `${fixtureServer.address}/missing.mp4`);
    await waitForStatus(request, project.id, 'failed');
    await page.goto('/');
    await expect(page.locator('#sidebar').locator(`#project-${project.id}`)).toBeVisible();

    const sidebar = await boxOf(page.locator('#sidebar'));
    const main = await boxOf(page.locator('.main'));

    expect(sidebar.left).toBe(0);
    expect(main.left).toBeCloseTo(sidebar.right, 0);
    expect(main.right).toBe(DESKTOP.width);
    await expect(page.locator('main ul.project-rows')).toHaveCount(0);
    await expect(page.locator('.tab-bar')).toHaveCount(0);
  });

  test('the new project sheet is centred', async ({ page }) => {
    const sheet = await boxOfSettledSheet(page);

    expect(Math.abs((sheet.left + sheet.right) / 2 - DESKTOP.width / 2)).toBeLessThanOrEqual(HALF_PIXEL);
    expect(Math.abs((sheet.top + sheet.bottom) / 2 - DESKTOP.height / 2)).toBeLessThanOrEqual(HALF_PIXEL);
    expect(sheet.width).toBeLessThan(DESKTOP.width);
    expect(sheet.top).toBeGreaterThan(0);
    expect(sheet.bottom).toBeLessThan(DESKTOP.height);
  });
});

test('the phone layout ends at 719 px and the desktop layout begins at 720 px', async ({ page }) => {
  await page.setViewportSize({ width: 719, height: 844 });
  const narrowSheet = await boxOfSettledSheet(page);
  await expect(page.locator('#app')).toHaveAttribute('data-layout', 'compact');
  await expect(page.locator('.tab-bar')).toBeVisible();

  await page.setViewportSize({ width: 720, height: 844 });
  const wideSheet = await boxOfSettledSheet(page);
  await expect(page.locator('#app')).toHaveAttribute('data-layout', 'regular');
  await expect(page.locator('.tab-bar')).toHaveCount(0);
  await expect(page.locator('.toolbar').getByRole('button', { name: 'Show sidebar' })).toBeVisible();

  expect(narrowSheet).toMatchObject({ left: 0, width: 719, bottom: 844 });
  expect(wideSheet.left).toBeGreaterThan(0);
  expect(wideSheet.right).toBeLessThan(720);
  expect(wideSheet.bottom).toBeLessThan(844);
});

test('the sidebar lies over the content at 999 px and beside it at 1000 px', async ({ page }) => {
  await page.setViewportSize({ width: 999, height: 800 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Show sidebar' }).click();
  const sidebarOver = await boxOf(page.locator('#sidebar'));
  const mainUnder = await boxOf(page.locator('.main'));
  await expect(page.locator('.sidebar-scrim')).toBeVisible();

  await page.setViewportSize({ width: 1000, height: 800 });
  await page.goto('/');
  const sidebarBeside = await boxOf(page.locator('#sidebar'));
  const mainBeside = await boxOf(page.locator('.main'));
  await expect(page.locator('.sidebar-scrim')).toHaveCount(0);

  expect(mainUnder).toMatchObject({ left: 0, width: 999 });
  expect(sidebarOver.left).toBe(0);
  expect(sidebarOver.right).toBeGreaterThan(mainUnder.left);
  expect(mainBeside.left).toBeCloseTo(sidebarBeside.right, 0);
  expect(mainBeside.right).toBe(1000);
});
