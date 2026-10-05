import type { APIRequestContext } from '@playwright/test';

import type { Project } from '@/library';

import { waitForRest } from './resting-state';
import type { FixtureServer } from './serve-fixtures';
import {
  createFileProject,
  createLinkProject,
  readProject,
  sendPart,
  stopProject,
  waitForStatus,
} from './service-api';

const UPLOAD_BYTES = 2000;
const UPLOADED_SO_FAR = Buffer.alloc(UPLOAD_BYTES / 2, 'x');

export interface SeededProjects {
  rested: Project;
  failed: Project;
  stopped: Project;
  processing: Project;
  queued: Project;
  uploading: Project;
}

export async function seedEveryState(request: APIRequestContext, server: FixtureServer): Promise<SeededProjects> {
  const rested = await createLinkProject(request, `${server.address}/talk.mp4`);
  await waitForRest(request, rested.id);
  const failed = await createLinkProject(request, `${server.address}/missing.mp4`);
  await waitForStatus(request, failed.id, 'failed');
  const stopped = await createLinkProject(request, `${server.address}/slow/talk.mp4`);
  await waitForStatus(request, stopped.id, 'processing');
  await stopProject(request, stopped.id);
  const processing = await createLinkProject(request, `${server.address}/slow/talk.mp4`);
  const queued = await createLinkProject(request, `${server.address}/talk.mp4`);
  const uploading = await createFileProject(request, { name: 'interview.mov', sizeBytes: UPLOAD_BYTES });
  await sendPart(request, { projectId: uploading.id, offset: 0, bytes: UPLOADED_SO_FAR });
  await waitForStatus(request, processing.id, 'processing');
  return {
    rested: await readProject(request, rested.id),
    failed: await readProject(request, failed.id),
    stopped: await readProject(request, stopped.id),
    processing: await readProject(request, processing.id),
    queued: await readProject(request, queued.id),
    uploading: await readProject(request, uploading.id),
  };
}
