import { requestJson } from '@/shared/lib/request-json';

import type { ProjectResults } from '../../results.types';

export function saveViews(projectId: string, clipId: string, views: number | null): Promise<ProjectResults> {
  return requestJson<ProjectResults>(`/projects/${projectId}/clips/${clipId}/views`, { method: 'PUT', json: { views } });
}
