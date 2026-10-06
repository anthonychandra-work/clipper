import type { APIRequestContext, APIResponse } from '@playwright/test';

import type { ProjectResults } from '@/results';

import { keepClips, startRenders, waitForExport } from './read-export';

export async function readResults(request: APIRequestContext, projectId: string): Promise<ProjectResults> {
  return readAnswer(await request.get(`/api/projects/${projectId}/results`));
}

export async function storeViews(
  request: APIRequestContext,
  clip: { projectId: string; clipId: string },
  views: number | null,
): Promise<ProjectResults> {
  const address = `/api/projects/${clip.projectId}/clips/${clip.clipId}/views`;
  return readAnswer(await request.put(address, { data: { views } }));
}

export async function exportClips(request: APIRequestContext, projectId: string, clipIds: string[]): Promise<void> {
  await keepClips(request, projectId, clipIds);
  await startRenders(request, projectId);
  await waitForExport(request, projectId, (shown) => {
    const finished = shown.clips.filter((clip) => clip.render.state === 'done').map((clip) => clip.id);
    return clipIds.every((clipId) => finished.includes(clipId));
  });
}

async function readAnswer(answer: APIResponse): Promise<ProjectResults> {
  if (!answer.ok()) throw new Error(`The results were not given: ${answer.status()} ${await answer.text()}`);
  return answer.json();
}
