import { requestJson } from '@/shared/lib/request-json';

import type { Look } from '../../review.types';

export function saveLook(projectId: string, look: Look): Promise<Look> {
  return requestJson<Look>(`/projects/${projectId}/look`, { method: 'PUT', json: look });
}
