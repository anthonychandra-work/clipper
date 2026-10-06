import type { APIRequestContext } from '@playwright/test';

import type { Project } from '@/library';
import type { Look, Review } from '@/review';

import { changeClip, readReview, storeLook } from './read-review';
import { removeSavedKey, saveTestKey } from './saved-key';
import type { FixtureServer } from './serve-fixtures';
import { createLinkProject, deleteProject, listProjects, readProject, waitForStatus } from './service-api';

const TALK_VIDEO = 'talk.mp4';
const TALK_TITLE = 'talk';
const TALK_CLIPS = 6;
const STARTING_LOOK: Look = {
  captionStyle: 'keyword',
  framing: 'follow-speaker',
  showHookTitle: true,
  showSafeZones: false,
};

export interface ReadyTalk {
  project: Project;
  review: Review;
}

export async function takeReadyTalk(request: APIRequestContext, server: FixtureServer): Promise<ReadyTalk> {
  const kept = (await findReadyTalk(request)) ?? (await makeReadyTalk(request, server));
  await deleteOtherProjects(request, kept.id);
  await putReviewBack(request, kept.id);
  return { project: await readProject(request, kept.id), review: await readReview(request, kept.id) };
}

async function findReadyTalk(request: APIRequestContext): Promise<Project | undefined> {
  const projects = await listProjects(request);
  return projects.find(
    (project) => project.status === 'ready' && project.title === TALK_TITLE && project.candidateCount === TALK_CLIPS,
  );
}

async function makeReadyTalk(request: APIRequestContext, server: FixtureServer): Promise<Project> {
  await saveTestKey(request);
  try {
    const created = await createLinkProject(request, `${server.address}/${TALK_VIDEO}`);
    return await waitForStatus(request, created.id, 'ready');
  } finally {
    await removeSavedKey(request);
  }
}

async function deleteOtherProjects(request: APIRequestContext, keptId: string): Promise<void> {
  for (const project of await listProjects(request)) {
    if (project.id !== keptId) await deleteProject(request, project.id);
  }
}

async function putReviewBack(request: APIRequestContext, projectId: string): Promise<void> {
  const review = await readReview(request, projectId);
  for (const clip of review.clips) {
    await changeClip(
      request,
      { projectId, clipId: clip.id },
      {
        decision: 'undecided',
        title: '',
        startSentence: clip.cutStartSentence,
        startNudge: 0,
        endSentence: clip.cutEndSentence,
        endNudge: 0,
      },
    );
  }
  await storeLook(request, projectId, STARTING_LOOK);
}
