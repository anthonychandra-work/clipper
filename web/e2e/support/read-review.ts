import type { APIRequestContext } from '@playwright/test';

import type { ClipChange, Look, Review, ReviewClip } from '@/review';

export async function readReview(request: APIRequestContext, projectId: string): Promise<Review> {
  const answer = await request.get(`/api/projects/${projectId}/review`);
  if (!answer.ok()) throw new Error(`The review was not given: ${answer.status()} ${await answer.text()}`);
  return answer.json();
}

export async function changeClip(
  request: APIRequestContext,
  clip: { projectId: string; clipId: string },
  change: ClipChange,
): Promise<ReviewClip> {
  const answer = await request.patch(`/api/projects/${clip.projectId}/clips/${clip.clipId}`, { data: change });
  if (!answer.ok()) throw new Error(`The clip was not changed: ${answer.status()} ${await answer.text()}`);
  return answer.json();
}

export async function storeLook(request: APIRequestContext, projectId: string, look: Look): Promise<void> {
  const answer = await request.put(`/api/projects/${projectId}/look`, { data: look });
  if (!answer.ok()) throw new Error(`The look was not stored: ${answer.status()} ${await answer.text()}`);
}
