import { setTimeout as delay } from 'node:timers/promises';

import type { APIRequestContext, APIResponse } from '@playwright/test';

import type { Project, ProjectStatus } from '@/library';

const ALL_PLATFORMS = ['tiktok', 'reels', 'shorts'];
const STATUS_TIMEOUT_MS = 90_000;
const STATUS_POLL_MS = 200;

export interface UploadedPart {
  projectId: string;
  offset: number;
  bytes: Buffer;
}

export async function createLinkProject(request: APIRequestContext, link: string): Promise<Project> {
  const draft = { sourceKind: 'link', link, platforms: ALL_PLATFORMS };
  return readCreated(await request.post('/api/projects', { data: draft }));
}

export async function createFileProject(
  request: APIRequestContext,
  file: { name: string; sizeBytes: number },
): Promise<Project> {
  const draft = { sourceKind: 'file', fileName: file.name, fileSizeBytes: file.sizeBytes, platforms: ALL_PLATFORMS };
  return readCreated(await request.post('/api/projects', { data: draft }));
}

export async function readProject(request: APIRequestContext, projectId: string): Promise<Project> {
  const response = await request.get(`/api/projects/${projectId}`);
  return response.json();
}

export async function listProjects(request: APIRequestContext): Promise<Project[]> {
  const response = await request.get('/api/projects');
  return (await response.json()).projects;
}

export function sendPart(request: APIRequestContext, part: UploadedPart): Promise<APIResponse> {
  return request.put(`/api/projects/${part.projectId}/upload?offset=${part.offset}`, {
    data: part.bytes,
    headers: { 'Content-Type': 'application/octet-stream' },
  });
}

export function stopProject(request: APIRequestContext, projectId: string): Promise<APIResponse> {
  return request.post(`/api/projects/${projectId}/stop`);
}

export function deleteProject(request: APIRequestContext, projectId: string): Promise<APIResponse> {
  return request.delete(`/api/projects/${projectId}`);
}

export async function deleteAllProjects(request: APIRequestContext): Promise<void> {
  for (const project of await listProjects(request)) {
    await deleteProject(request, project.id);
  }
}

export async function waitForStatus(
  request: APIRequestContext,
  projectId: string,
  status: ProjectStatus,
): Promise<Project> {
  const deadline = Date.now() + STATUS_TIMEOUT_MS;
  for (;;) {
    const project = await readProject(request, projectId);
    if (project.status === status) return project;
    if (Date.now() > deadline) {
      throw new Error(`The project did not become ${status}: ${JSON.stringify(project)}`);
    }
    await delay(STATUS_POLL_MS);
  }
}

async function readCreated(response: APIResponse): Promise<Project> {
  if (response.status() !== 201) {
    throw new Error(`The project was not created: ${response.status()} ${await response.text()}`);
  }
  return response.json();
}
