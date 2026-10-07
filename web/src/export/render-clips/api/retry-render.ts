import { requestJson } from '@/shared/lib/request-json';

import type { ProjectExport } from '../../export.types';

export function retryRender(projectId: string, clipId: string): Promise<ProjectExport> {
  return requestJson<ProjectExport>(`/projects/${projectId}/clips/${clipId}/render`, { method: 'POST' });
}
