import { requestJson } from '@/shared/lib/request-json';

import type { ClipChange, ReviewClip } from '../../review.types';

export function changeClip(projectId: string, clipId: string, change: ClipChange): Promise<ReviewClip> {
  return requestJson<ReviewClip>(`/projects/${projectId}/clips/${clipId}`, { method: 'PATCH', json: change });
}
