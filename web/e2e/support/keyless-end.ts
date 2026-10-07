import type { APIRequestContext } from '@playwright/test';

import type { Project, ProjectStatus, ProjectStep } from '@/library';

import type { RowText } from './library-page';
import type { StatusCardText } from './status-screen';
import { isStepDone, waitForProject } from './wait-for-step';

const NO_KEY = 'No Anthropic API key is saved. Add one in Settings, then retry.';

export interface KeylessEnd {
  status: ProjectStatus;
  row: Pick<RowText, 'status' | 'barLabel'>;
  card: StatusCardText;
  stepStates: ProjectStep['state'][];
  files: string[];
}

export const KEYLESS_END: KeylessEnd = {
  status: 'failed',
  row: { status: 'Could not finish', barLabel: null },
  card: {
    heading: 'Could Not Finish',
    stage: NO_KEY,
    footnote: null,
    buttons: ['Retry'],
    links: ['Open Settings'],
    hasBar: false,
    hasWarning: true,
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
