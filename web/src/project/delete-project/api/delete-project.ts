import { requestJson } from '@/shared/lib/request-json';

export function deleteProject(projectId: string): Promise<null> {
  return requestJson<null>(`/projects/${projectId}`, { method: 'DELETE' });
}
