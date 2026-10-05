import type { Project } from '@/library';
import { requestJson } from '@/shared/lib/request-json';

import type { HaltAction } from '../lib/describe-status';

export function sendHaltAction(projectId: string, action: HaltAction): Promise<Project> {
  return requestJson<Project>(`/projects/${projectId}/${action}`, { method: 'POST' });
}
