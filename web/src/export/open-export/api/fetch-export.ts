import { requestJson } from '@/shared/lib/request-json';

import type { ProjectExport } from '../../export.types';

export function fetchExport(projectId: string): Promise<ProjectExport> {
  return requestJson<ProjectExport>(`/projects/${projectId}/export`);
}
