import { describe, expect, it } from 'vitest';

import type { Project, ProjectStatus, ProjectStep } from '../../library.types';
import { describeRowStatus, findCurrentStep } from './describe-row-status';

function planSteps(fetchState: ProjectStep['state'], fetchLabel: string): ProjectStep[] {
  return [
    { kind: 'fetch', label: fetchLabel, state: fetchState, percent: fetchState === 'done' ? 100 : 40 },
    { kind: 'transcribe', label: 'Transcribing on this Mac', state: 'pending', percent: 0 },
    { kind: 'score', label: 'Scoring windows', state: 'pending', percent: 0 },
    { kind: 'cut', label: 'Cutting clips', state: 'pending', percent: 0 },
  ];
}

function describeProject(status: ProjectStatus, steps: ProjectStep[]): Project {
  return {
    id: 'a1b2c3d4e5f6',
    title: 'talk',
    sourceKind: 'link',
    sourceLabel: 'Video link',
    durationSeconds: null,
    status,
    steps,
    percent: steps.reduce((sum, step) => sum + step.percent, 0) / steps.length,
    halt: null,
    upload: null,
  };
}

describe('describeRowStatus', () => {
  it('shows the bar and the step label while a link is fetched', () => {
    const project = describeProject('processing', planSteps('running', 'Fetching video'));

    expect(describeRowStatus(project)).toEqual({ kind: 'progress', percent: 10, label: 'Fetching video' });
  });

  it('shows the bar and the step label while a file uploads', () => {
    const project = describeProject('uploading', planSteps('running', 'Uploading video'));

    expect(describeRowStatus(project)).toMatchObject({ kind: 'progress', label: 'Uploading video' });
  });

  it('shows the bar and Fetched for a project that rests after its first step', () => {
    const project = describeProject('fetched', planSteps('done', 'Fetching video'));

    expect(describeRowStatus(project)).toEqual({ kind: 'progress', percent: 25, label: 'Fetched' });
  });

  it.each([
    ['queued', 'Waiting in queue', false],
    ['failed', 'Could not finish', true],
    ['stopped', 'Stopped', false],
  ] as const)('shows a note for a %s project', (status, text, hasWarning) => {
    const project = describeProject(status, planSteps('pending', 'Fetching video'));

    expect(describeRowStatus(project)).toEqual({ kind: 'note', status, text, hasWarning });
  });
});

describe('findCurrentStep', () => {
  it('is the first step that has not finished', () => {
    const project = describeProject('fetched', planSteps('done', 'Fetching video'));

    expect(findCurrentStep(project)?.kind).toBe('transcribe');
  });
});
