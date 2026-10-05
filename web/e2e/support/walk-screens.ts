import { type APIRequestContext, expect, type Page } from '@playwright/test';

import type { Project, ProjectList } from '@/library';

import { type PresentedStates, presentTranscriptionStates, type SeededProjects } from './seed-projects';
import { listSavedKeyScreens, presentSelectionStates } from './selection-screens';

const PROJECT_LIST_ADDRESS = '**/api/projects';
const PROJECT_TABS = ['review', 'export', 'results'];
const STATUS_HEADING = 'section.status-card h2';

export interface ScreenVisit {
  name: string;
  open: (page: Page) => Promise<void>;
  leave?: (page: Page) => Promise<void>;
}

export interface Walk {
  shownList: ProjectList;
  screens: ScreenVisit[];
}

export async function readProjectList(request: APIRequestContext): Promise<ProjectList> {
  const response = await request.get('/api/projects');
  return response.json();
}

export async function holdProjectList(page: Page, list: ProjectList): Promise<void> {
  await page.unroute(PROJECT_LIST_ADDRESS);
  await page.route(PROJECT_LIST_ADDRESS, (route) =>
    route.request().method() === 'GET' ? route.fulfill({ json: list }) : route.continue(),
  );
}

export async function visitScreens(
  page: Page,
  walk: Walk,
  inspect: (screenName: string) => Promise<void>,
): Promise<void> {
  for (const screen of walk.screens) {
    await holdProjectList(page, walk.shownList);
    await screen.open(page);
    try {
      await inspect(screen.name);
    } finally {
      await screen.leave?.(page);
    }
  }
}

export async function showAddress(page: Page, address: string, landmark: string): Promise<void> {
  await page.goto(address);
  await expect(page.locator(landmark).first()).toBeVisible();
}

export function listEmptyScreens(): ScreenVisit[] {
  return [{ name: 'empty-library', open: (page) => showAddress(page, '/', '.empty h2.empty__title') }];
}

export function listProjectScreens(seeded: SeededProjects, shownList: ProjectList): ScreenVisit[] {
  const readyList = presentAsFinished(shownList, seeded.keyless.id);
  const statuses = Object.entries(seeded).map(([state, project]) => ({
    name: `status-${state}`,
    open: (page: Page) => showAddress(page, `/projects/${project.id}`, STATUS_HEADING),
  }));
  const tabs = PROJECT_TABS.map((tab) => ({
    name: `project-${tab}`,
    open: async (page: Page) => {
      await holdProjectList(page, readyList);
      await showAddress(page, `/projects/${seeded.keyless.id}/${tab}`, `#tab-${tab}[aria-current="page"]`);
    },
  }));
  return [
    { name: 'library', open: (page) => showAddress(page, '/', `#project-${seeded.keyless.id}`) },
    ...statuses,
    ...listPresentedScreens(shownList, presentTranscriptionStates(seeded)),
    ...listPresentedScreens(shownList, presentSelectionStates(seeded)),
    ...tabs,
    { name: 'delete-alert', open: (page) => showDeleteAlert(page, seeded.failed.id) },
    { name: 'settings', open: (page) => showAddress(page, '/settings', '#setting-scoringModel') },
    ...listSavedKeyScreens(),
  ];
}

function listPresentedScreens(shownList: ProjectList, presented: PresentedStates): ScreenVisit[] {
  const heldList = replaceProjects(shownList, Object.values(presented.projects));
  const showHeld = async (page: Page, address: string, landmark: string) => {
    await holdProjectList(page, heldList);
    await showAddress(page, address, landmark);
  };
  const withStatusScreen = Object.entries(presented.projects).filter(([, project]) => project.status !== 'ready');
  const statuses = withStatusScreen.map(([state, project]) => {
    const stage = project.halt?.reason ?? project.steps.find((step) => step.state === 'running')?.label;
    const landmark = `.status-card__stage:text-is("${stage}")`;
    return { name: `status-${state}`, open: (page: Page) => showHeld(page, `/projects/${project.id}`, landmark) };
  });
  return [{ name: presented.libraryName, open: (page) => showHeld(page, '/', presented.rowLandmark) }, ...statuses];
}

function replaceProjects(list: ProjectList, replacements: Project[]): ProjectList {
  const projects = list.projects.map(
    (project) => replacements.find((replacement) => replacement.id === project.id) ?? project,
  );
  return { ...list, projects };
}

function presentAsFinished(list: ProjectList, projectId: string): ProjectList {
  const projects = list.projects.map((project) =>
    project.id === projectId ? { ...project, status: 'ready' as const, percent: 100, halt: null } : project,
  );
  return { ...list, projects };
}

async function showDeleteAlert(page: Page, projectId: string): Promise<void> {
  await showAddress(page, `/projects/${projectId}`, STATUS_HEADING);
  await page.getByRole('button', { name: 'More' }).click();
  await page.getByRole('menuitem', { name: 'Delete Project…' }).click();
  await expect(page.locator('dialog#sheet[open] .alert')).toBeVisible();
}
