import { requestJson } from '@/shared/lib/request-json';

import type { ProjectList } from '../../library.types';

export function fetchProjects(): Promise<ProjectList> {
  return requestJson<ProjectList>('/projects');
}
