import { requestJson } from '@/shared/lib/request-json';

import type { ProjectResults } from '../../results.types';

export function fetchResults(projectId: string): Promise<ProjectResults> {
  return requestJson<ProjectResults>(`/projects/${projectId}/results`);
}
