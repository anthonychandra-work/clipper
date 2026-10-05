import type { Page } from '@playwright/test';

import type { ProjectList } from '@/library';

const PROJECT_LIST_ADDRESS = '**/api/projects';

export async function presentAsReady(page: Page, projectId: string): Promise<void> {
  await page.route(PROJECT_LIST_ADDRESS, async (route) => {
    const response = await route.fetch();
    const list: ProjectList = await response.json();
    const projects = list.projects.map((project) =>
      project.id === projectId ? { ...project, status: 'ready' as const, percent: 100 } : project,
    );
    await route.fulfill({ response, json: { ...list, projects } });
  });
}
