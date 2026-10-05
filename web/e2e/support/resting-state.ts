import type { APIRequestContext } from '@playwright/test';

import type { Project, ProjectStatus, ProjectStep } from '@/library';

import { waitForStatus } from './service-api';

export interface RestingState {
  status: ProjectStatus;
  word: string;
  card: { heading: string; stage: string; footnote: string };
  stepStates: ProjectStep['state'][];
  files: string[];
}

export const RESTING: RestingState = {
  status: 'transcribed',
  word: 'Transcribed',
  card: {
    heading: 'Transcribed',
    stage: 'Step 2 of 4 is done.',
    footnote: 'Not started: Scoring windows, Cutting clips.',
  },
  stepStates: ['done', 'done', 'pending', 'pending'],
  files: ['preview.mp4', 'source.mp4', 'transcript.json'],
};

export function waitForRest(request: APIRequestContext, projectId: string): Promise<Project> {
  return waitForStatus(request, projectId, RESTING.status);
}
