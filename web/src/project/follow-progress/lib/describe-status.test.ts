import { describe, expect, it } from 'vitest';

import type { Project, ProjectStatus, ProjectStep } from '@/library';

import { describeStatus } from './describe-status';

const LATER_STEPS: ProjectStep[] = [
  { kind: 'transcribe', label: 'Transcribing on this Mac', state: 'pending', percent: 0 },
  { kind: 'score', label: 'Scoring windows', state: 'pending', percent: 0 },
  { kind: 'cut', label: 'Cutting clips', state: 'pending', percent: 0 },
];

function describeProject(status: ProjectStatus, fetch: Partial<ProjectStep> = {}): Project {
  const fetchStep: ProjectStep = { kind: 'fetch', label: 'Fetching video', state: 'running', percent: 40, ...fetch };
  return {
    id: 'a1b2c3d4e5f6',
    title: 'Founder Q&A',
    sourceKind: 'link',
    sourceLabel: 'YouTube link',
    durationSeconds: null,
    status,
    steps: [fetchStep, ...LATER_STEPS],
    percent: fetchStep.percent / 4,
    halt: null,
    upload: null,
  };
}

describe('describeStatus', () => {
  it('tells an uploading project to keep the page open', () => {
    const project = describeProject('uploading', { label: 'Uploading video' });

    expect(describeStatus(project, [project])).toEqual({
      heading: 'Uploading Video',
      hasWarning: false,
      bar: { percent: 10, label: 'Uploading video' },
      stage: 'Uploading video',
      footnote: 'Step 1 of 4. Keep this page open until the upload finishes.',
      action: null,
    });
  });

  it('shows the step of a processing project and offers Stop', () => {
    const project = describeProject('processing');

    expect(describeStatus(project, [project])).toEqual({
      heading: 'Finding Clips',
      hasWarning: false,
      bar: { percent: 10, label: 'Fetching video' },
      stage: 'Fetching video',
      footnote: 'Step 1 of 4.',
      action: 'stop',
    });
  });

  it('names the project a waiting one waits for', () => {
    const waiting = describeProject('queued', { state: 'pending', percent: 0 });
    const active = { ...describeProject('processing'), id: 'ffffffffffff', title: 'Shop Talk #48' };

    expect(describeStatus(waiting, [waiting, active])).toMatchObject({
      heading: 'Waiting in Queue',
      bar: null,
      stage: 'It starts when “Shop Talk #48” finishes.',
      footnote: 'One video is processed at a time.',
      action: null,
    });
  });

  it('says a waiting project starts in a moment when nothing is processed', () => {
    const waiting = describeProject('queued', { state: 'pending', percent: 0 });

    expect(describeStatus(waiting, [waiting]).stage).toBe('It starts in a moment.');
  });

  it('gives the reason of a failed project and offers Retry', () => {
    const reason = 'The video could not be downloaded. Check the link and your connection, then retry.';
    const failed = { ...describeProject('failed', { state: 'pending', percent: 0 }), halt: { reason } };

    expect(describeStatus(failed, [failed])).toEqual({
      heading: 'Could Not Finish',
      hasWarning: true,
      bar: null,
      stage: reason,
      footnote: null,
      action: 'retry',
    });
  });

  it('gives the reason of a stopped project and offers Resume', () => {
    const reason = 'Stopped at “Fetching video”. The stages before it are kept.';
    const stopped = { ...describeProject('stopped', { state: 'pending', percent: 0 }), halt: { reason } };

    expect(describeStatus(stopped, [stopped])).toMatchObject({
      heading: 'Stopped',
      hasWarning: true,
      stage: reason,
      action: 'resume',
    });
  });

  it('names what has not started for a project that rests after its first step', () => {
    const fetched = describeProject('fetched', { state: 'done', percent: 100 });

    expect(describeStatus(fetched, [fetched])).toEqual({
      heading: 'Fetched',
      hasWarning: false,
      bar: { percent: 25, label: 'Fetched' },
      stage: 'Step 1 of 4 is done.',
      footnote: 'Not started: Transcribing on this Mac, Scoring windows, Cutting clips.',
      action: null,
    });
  });
});
