import type { APIRequestContext, APIResponse } from '@playwright/test';

const ALL_PLATFORMS = ['tiktok', 'reels', 'shorts'];

export interface StepJson {
  kind: string;
  label: string;
  state: string;
  percent: number;
}

export interface ProjectJson {
  id: string;
  title: string;
  sourceKind: 'link' | 'file';
  sourceLabel: string;
  durationSeconds: number | null;
  status: string;
  steps: StepJson[];
  percent: number;
  halt: { reason: string } | null;
  upload: { fileName: string; sizeBytes: number; receivedBytes: number } | null;
}

export interface UploadedPart {
  projectId: string;
  offset: number;
  bytes: Buffer;
}

export async function createLinkProject(request: APIRequestContext, link: string): Promise<ProjectJson> {
  const draft = { sourceKind: 'link', link, platforms: ALL_PLATFORMS };
  return readCreated(await request.post('/api/projects', { data: draft }));
}

export async function createFileProject(
  request: APIRequestContext,
  file: { name: string; sizeBytes: number },
): Promise<ProjectJson> {
  const draft = { sourceKind: 'file', fileName: file.name, fileSizeBytes: file.sizeBytes, platforms: ALL_PLATFORMS };
  return readCreated(await request.post('/api/projects', { data: draft }));
}

export async function readProject(request: APIRequestContext, projectId: string): Promise<ProjectJson> {
  const response = await request.get(`/api/projects/${projectId}`);
  return response.json();
}

export async function listProjects(request: APIRequestContext): Promise<ProjectJson[]> {
  const response = await request.get('/api/projects');
  return (await response.json()).projects;
}

export function sendPart(request: APIRequestContext, part: UploadedPart): Promise<APIResponse> {
  return request.put(`/api/projects/${part.projectId}/upload?offset=${part.offset}`, {
    data: part.bytes,
    headers: { 'Content-Type': 'application/octet-stream' },
  });
}

export function deleteProject(request: APIRequestContext, projectId: string): Promise<APIResponse> {
  return request.delete(`/api/projects/${projectId}`);
}

async function readCreated(response: APIResponse): Promise<ProjectJson> {
  if (response.status() !== 201) {
    throw new Error(`The project was not created: ${response.status()} ${await response.text()}`);
  }
  return response.json();
}
