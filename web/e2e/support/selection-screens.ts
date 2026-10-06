import { expect, type Page } from '@playwright/test';

import type { Project, ProjectStep } from '@/library';

import { removeSavedKey, saveTestKey } from './saved-key';
import type { PresentedStates, SeededProjects } from './seed-projects';
import type { ScreenVisit } from './walk-screens';

const DECLINED =
  'Claude declined to read this transcript. Retry, or choose another model for this step in Settings.';
const SCORING_THREE_HOURS = 'Scoring 180 windows';
const MOST_CLIPS = { candidateCount: 12, keptCount: 10, rejectedCount: 2 };
const READY_ROW = 'Ready to review · 12 candidates, 10 kept, 2 rejected';

export function presentSelectionStates(seeded: SeededProjects): PresentedStates {
  const [fetched, transcribed, score, cut] = seeded.keyless.steps;
  const scoring: ProjectStep = { ...score, label: SCORING_THREE_HOURS, state: 'running', percent: 40 };
  const scored: ProjectStep = { ...score, label: SCORING_THREE_HOURS, state: 'done', percent: 100 };
  const cutting: ProjectStep = { ...cut, state: 'running', percent: 67 };
  const finished = [fetched, transcribed, scored, { ...cut, state: 'done' as const, percent: 100 }];
  return {
    libraryName: 'library-selection',
    rowLandmark: `#project-${seeded.stopped.id} .project-row__status--ready:text-is("${READY_ROW}")`,
    projects: {
      scoring: describeRunning(seeded.keyless, [fetched, transcribed, scoring, cut]),
      cutting: describeRunning(seeded.processing, [fetched, transcribed, scored, cutting]),
      declined: {
        ...seeded.failed,
        status: 'failed',
        percent: 50,
        halt: { reason: DECLINED, opensSettings: true },
        steps: [fetched, transcribed, score, cut],
      },
      ready: {
        ...seeded.stopped,
        status: 'ready',
        percent: 100,
        halt: null,
        ...MOST_CLIPS,
        steps: finished,
      },
    },
  };
}

export function listSavedKeyScreens(): ScreenVisit[] {
  return [
    {
      name: 'settings-saved-key',
      open: showSettingsWithSavedKey,
      leave: (page) => removeSavedKey(page.request),
    },
  ];
}

function describeRunning(project: Project, steps: ProjectStep[]): Project {
  const percent = steps.reduce((sum, step) => sum + step.percent, 0) / steps.length;
  return { ...project, status: 'processing', percent, halt: null, steps };
}

async function showSettingsWithSavedKey(page: Page): Promise<void> {
  await saveTestKey(page.request);
  await page.goto('/settings');
  await expect(page.locator('#remove-api-key')).toBeVisible();
}
