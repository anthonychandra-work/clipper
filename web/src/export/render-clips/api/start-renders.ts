import { requestJson } from '@/shared/lib/request-json';

import type { ProjectExport } from '../../export.types';

export function startRenders(projectId: string): Promise<ProjectExport> {
  return requestJson<ProjectExport>(`/projects/${projectId}/renders`, { method: 'POST' });
}
