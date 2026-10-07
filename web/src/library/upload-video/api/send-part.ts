import { requestJson } from '@/shared/lib/request-json';

export interface PartAnswer {
  receivedBytes: number;
}

export function sendPart(projectId: string, offset: number, part: Blob): Promise<PartAnswer> {
  return requestJson<PartAnswer>(`/projects/${projectId}/upload?offset=${offset}`, { method: 'PUT', body: part });
}
