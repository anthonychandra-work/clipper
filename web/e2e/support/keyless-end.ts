import type { APIRequestContext } from '@playwright/test';

import type { Project, ProjectStatus, ProjectStep } from '@/library';

import type { RowText } from './library-page';
import type { StatusCardText } from './status-screen';
import { isStepDone, waitForProject } from './wait-for-step';

export interface KeylessEnd {
  status: ProjectStatus;
  row: Pick<RowText, 'status' | 'barLabel'>;
  card: StatusCardText;
  stepStates: ProjectStep['state'][];
  files: string[];
}

export const KEYLESS_END: KeylessEnd = {
  status: 'transcribed',
  row: { status: 'Transcribed', barLabel: 'Transcribed' },
  card: {
    heading: 'Transcribed',
    stage: 'Step 2 of 4 is done.',
    footnote: 'Not started: Scoring windows, Cutting clips.',
    buttons: [],
    links: [],
    hasBar: true,
    hasWarning: false,
  },
  stepStates: ['done', 'done', 'pending', 'pending'],
  files: ['preview.mp4', 'source.mp4', 'transcript.json'],
};

export function waitForKeylessEnd(request: APIRequestContext, projectId: string): Promise<Project> {
  return waitForProject(request, projectId, {
    goal: 'end where a run without a key ends',
    isReached: (project) => project.status === KEYLESS_END.status && isStepDone(project, 'transcribe'),
  });
}
