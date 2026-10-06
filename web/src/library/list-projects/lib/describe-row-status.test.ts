import { describe, expect, it } from 'vitest';

import type { Project, ProjectStatus, ProjectStep } from '../../library.types';
import {
  describeCandidateCount,
  describeRowStatus,
  findCurrentStep,
  nameRestingState,
} from './describe-row-status';

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
    candidateCount: 0,
    keptCount: 0,
    rejectedCount: 0,
  };
}

type ClipCounts = Pick<Project, 'candidateCount' | 'keptCount' | 'rejectedCount'>;

function describeReadyProject(counts: Partial<ClipCounts>): Project {
  const steps = planSteps('done', 'Fetching video').map((step) => ({ ...step, state: 'done' as const, percent: 100 }));
  return { ...describeProject('ready', steps), ...counts };
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

  it('shows the bar and Transcribed for a project that rests after its transcription', () => {
    const [fetch, transcribe, ...later] = planSteps('done', 'Fetching video');
    const steps: ProjectStep[] = [fetch, { ...transcribe, state: 'done', percent: 100 }, ...later];

    expect(describeRowStatus(describeProject('transcribed', steps))).toEqual({
      kind: 'progress',
      percent: 50,
      label: 'Transcribed',
    });
  });

  it('shows the label the service sent while a model is downloaded', () => {
    const [fetch, ...later] = planSteps('done', 'Fetching video');
    const download: ProjectStep = { kind: 'model', label: 'Downloading Whisper small', state: 'running', percent: 30 };
    const project = describeProject('processing', [fetch, download, ...later]);

    expect(describeRowStatus(project)).toMatchObject({ kind: 'progress', label: 'Downloading Whisper small' });
  });

  it.each([
    ['queued', 'Waiting in queue', false],
    ['failed', 'Could not finish', true],
    ['stopped', 'Stopped', false],
  ] as const)('shows a note for a %s project', (status, text, hasWarning) => {
    const project = describeProject(status, planSteps('pending', 'Fetching video'));

    expect(describeRowStatus(project)).toEqual({ kind: 'note', status, text, hasWarning });
  });

  it.each([
    [0, 'Ready to review · 0 candidates, 0 kept, 0 rejected'],
    [1, 'Ready to review · 1 candidate, 0 kept, 0 rejected'],
    [6, 'Ready to review · 6 candidates, 0 kept, 0 rejected'],
  ])('reads the row of a ready project with %i candidates and no decision as a note', (candidateCount, text) => {
    expect(describeRowStatus(describeReadyProject({ candidateCount }))).toEqual({
      kind: 'note',
      status: 'ready',
      text,
      hasWarning: false,
    });
  });

  it.each([
    [{ candidateCount: 6, keptCount: 2, rejectedCount: 1 }, 'Ready to review · 6 candidates, 2 kept, 1 rejected'],
    [{ candidateCount: 6, keptCount: 1, rejectedCount: 0 }, 'Ready to review · 6 candidates, 1 kept, 0 rejected'],
    [{ candidateCount: 1, keptCount: 0, rejectedCount: 1 }, 'Ready to review · 1 candidate, 0 kept, 1 rejected'],
    [{ candidateCount: 12, keptCount: 10, rejectedCount: 2 }, 'Ready to review · 12 candidates, 10 kept, 2 rejected'],
  ])('counts the kept and the rejected clips of a ready project in its row', (counts, text) => {
    expect(describeRowStatus(describeReadyProject(counts))).toMatchObject({ kind: 'note', status: 'ready', text });
  });
});

describe('describeCandidateCount', () => {
  it.each([
    [0, '0 candidates'],
    [1, '1 candidate'],
    [12, '12 candidates'],
  ])('words %i as “%s”', (candidateCount, words) => {
    expect(describeCandidateCount(candidateCount)).toBe(words);
  });
});

describe('nameRestingState', () => {
  it.each([
    ['fetched', 'Fetched'],
    ['transcribed', 'Transcribed'],
  ] as const)('gives the %s state one word', (status, word) => {
    expect(nameRestingState(status)).toBe(word);
  });

  it.each(['uploading', 'queued', 'processing', 'failed', 'stopped'] as const)(
    'has no word for a %s project, which does not rest',
    (status) => {
      expect(nameRestingState(status)).toBeUndefined();
    },
  );
});

describe('findCurrentStep', () => {
  it('is the first step that has not finished', () => {
    const project = describeProject('fetched', planSteps('done', 'Fetching video'));

    expect(findCurrentStep(project)?.kind).toBe('transcribe');
  });
});
