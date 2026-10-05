import { setTimeout as delay } from 'node:timers/promises';

import type { APIRequestContext } from '@playwright/test';

import type { Project, StepKind } from '@/library';

import { readProject } from './service-api';

const WAIT_TIMEOUT_MS = 90_000;
const POLL_MS = 200;

export interface AwaitedPoint {
  goal: string;
  isReached: (project: Project) => boolean;
}

export function waitForStepDone(request: APIRequestContext, projectId: string, kind: StepKind): Promise<Project> {
  return waitForProject(request, projectId, {
    goal: `finish its ${kind} step`,
    isReached: (project) => isStepDone(project, kind),
  });
}

export function isStepDone(project: Project, kind: StepKind): boolean {
  return project.steps.find((step) => step.kind === kind)?.state === 'done';
}

export async function waitForProject(
  request: APIRequestContext,
  projectId: string,
  awaited: AwaitedPoint,
): Promise<Project> {
  const deadline = Date.now() + WAIT_TIMEOUT_MS;
  for (;;) {
    const project = await readProject(request, projectId);
    if (awaited.isReached(project)) return project;
    if (Date.now() > deadline) {
      throw new Error(`The project did not ${awaited.goal}: ${JSON.stringify(project)}`);
    }
    await delay(POLL_MS);
  }
}
