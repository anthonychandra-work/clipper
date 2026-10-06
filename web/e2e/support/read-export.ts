import { setTimeout as delay } from 'node:timers/promises';

import type { APIRequestContext, APIResponse } from '@playwright/test';

import type { ProjectExport } from '@/export';

import { changeClip } from './read-review';

const RENDER_TIMEOUT_MS = 90_000;
const RENDER_POLL_MS = 200;

export async function readExport(request: APIRequestContext, projectId: string): Promise<ProjectExport> {
  return readAnswer(await request.get(`/api/projects/${projectId}/export`));
}

export async function startRenders(request: APIRequestContext, projectId: string): Promise<ProjectExport> {
  return readAnswer(await request.post(`/api/projects/${projectId}/renders`));
}

export async function cancelRenders(request: APIRequestContext, projectId: string): Promise<ProjectExport> {
  return readAnswer(await request.delete(`/api/projects/${projectId}/renders`));
}

export async function keepClips(request: APIRequestContext, projectId: string, clipIds: string[]): Promise<void> {
  for (const clipId of clipIds) {
    await changeClip(request, { projectId, clipId }, { decision: 'keep' });
  }
}

export async function waitForExport(
  request: APIRequestContext,
  projectId: string,
  hasArrived: (shown: ProjectExport) => boolean,
): Promise<ProjectExport> {
  const deadline = Date.now() + RENDER_TIMEOUT_MS;
  for (;;) {
    const shown = await readExport(request, projectId);
    if (hasArrived(shown)) return shown;
    if (Date.now() > deadline) throw new Error(`The export did not get there: ${JSON.stringify(shown.clips)}`);
    await delay(RENDER_POLL_MS);
  }
}

async function readAnswer(answer: APIResponse): Promise<ProjectExport> {
  if (!answer.ok()) throw new Error(`The export was not given: ${answer.status()} ${await answer.text()}`);
  return answer.json();
}
