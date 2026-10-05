import type { APIRequestContext } from '@playwright/test';

import type { Project, ProjectStep } from '@/library';

import { waitForKeylessEnd } from './keyless-end';
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
const NO_SPEECH = 'No speech was recognised in this video. Clipper needs spoken words to find clips.';
const MODEL_DOWNLOAD_FAILED = 'The transcription model could not be downloaded. Check your connection, then retry.';
const LONGEST_DOWNLOAD: ProjectStep = {
  kind: 'model',
  label: 'Downloading Whisper large-v3-turbo',
  state: 'pending',
  percent: 0,
};

export interface SeededProjects {
  keyless: Project;
  failed: Project;
  stopped: Project;
  processing: Project;
  queued: Project;
  uploading: Project;
}

export async function seedEveryState(request: APIRequestContext, server: FixtureServer): Promise<SeededProjects> {
  const keyless = await createLinkProject(request, `${server.address}/talk.mp4`);
  await waitForKeylessEnd(request, keyless.id);
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
    keyless: await readProject(request, keyless.id),
    failed: await readProject(request, failed.id),
    stopped: await readProject(request, stopped.id),
    processing: await readProject(request, processing.id),
    queued: await readProject(request, queued.id),
    uploading: await readProject(request, uploading.id),
  };
}

export function presentTranscriptionStates(seeded: SeededProjects): Record<string, Project> {
  const [fetched, transcribe, ...later] = seeded.keyless.steps;
  const waiting: ProjectStep = { ...transcribe, state: 'pending', percent: 0 };
  const downloading: ProjectStep = { ...LONGEST_DOWNLOAD, state: 'running', percent: 40 };
  const transcribing: ProjectStep = { ...transcribe, state: 'running', percent: 60 };
  return {
    downloading: {
      ...seeded.keyless,
      status: 'processing',
      percent: 30,
      halt: null,
      steps: [fetched, downloading, waiting, ...later],
    },
    transcribing: {
      ...seeded.processing,
      status: 'processing',
      percent: 40,
      halt: null,
      steps: [fetched, transcribing, ...later],
    },
    'no-speech': {
      ...seeded.failed,
      status: 'failed',
      percent: 25,
      halt: { reason: NO_SPEECH, opensSettings: false },
      steps: [fetched, waiting, ...later],
    },
    'download-failed': {
      ...seeded.stopped,
      status: 'failed',
      percent: 25,
      halt: { reason: MODEL_DOWNLOAD_FAILED, opensSettings: false },
      steps: [fetched, LONGEST_DOWNLOAD, waiting, ...later],
    },
  };
}
