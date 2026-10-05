import { describe, expect, it } from 'vitest';

import type { Project, ProjectStatus, ProjectStep } from '@/library';

import { describeStatus, type StatusView } from './describe-status';

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

const [TRANSCRIBE, ...NOT_TRANSCRIPTION] = LATER_STEPS;
const DOWNLOAD: ProjectStep = { kind: 'model', label: 'Downloading Whisper small', state: 'pending', percent: 0 };
const DONE = { state: 'done', percent: 100 } as const;

function describeFetchedProject(status: ProjectStatus, laterSteps: ProjectStep[]): Project {
  const fetched = describeProject(status, DONE);
  return { ...fetched, steps: [fetched.steps[0], ...laterSteps] };
}

function among(...projects: Project[]): StatusView {
  return { projects, isSendingHere: true };
}

describe('describeStatus', () => {
  it('tells the browser that sends an upload to keep the page open', () => {
    const project = describeProject('uploading', { label: 'Uploading video' });

    expect(describeStatus(project, among(project))).toEqual({
      heading: 'Uploading Video',
      hasWarning: false,
      bar: { percent: 10, label: 'Uploading video' },
      stage: 'Uploading video',
      footnote: 'Step 1 of 4. Keep this page open until the upload finishes.',
      action: null,
    });
  });

  it('tells a browser that does not send the upload what to do about it', () => {
    const project = describeProject('uploading', { label: 'Uploading video' });

    expect(describeStatus(project, { projects: [project], isSendingHere: false }).footnote).toBe(
      'Step 1 of 4. This upload is not running in this browser. ' +
        'If no other browser is sending it, delete the project and upload the file again.',
    );
  });

  it('shows the step of a processing project and offers Stop', () => {
    const project = describeProject('processing');

    expect(describeStatus(project, among(project))).toEqual({
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

    expect(describeStatus(waiting, among(waiting, active))).toMatchObject({
      heading: 'Waiting in Queue',
      bar: null,
      stage: 'It starts when “Shop Talk #48” finishes.',
      footnote: 'One video is processed at a time.',
      action: null,
    });
  });

  it('says a waiting project starts in a moment when nothing is processed', () => {
    const waiting = describeProject('queued', { state: 'pending', percent: 0 });

    expect(describeStatus(waiting, among(waiting)).stage).toBe('It starts in a moment.');
  });

  it('gives the reason of a failed project and offers Retry', () => {
    const reason = 'The video could not be downloaded. Check the link and your connection, then retry.';
    const failed = { ...describeProject('failed', { state: 'pending', percent: 0 }), halt: { reason } };

    expect(describeStatus(failed, among(failed))).toEqual({
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

    expect(describeStatus(stopped, among(stopped))).toMatchObject({
      heading: 'Stopped',
      hasWarning: true,
      stage: reason,
      action: 'resume',
    });
  });

  it('names what has not started for a project that rests after its first step', () => {
    const fetched = describeProject('fetched', { state: 'done', percent: 100 });

    expect(describeStatus(fetched, among(fetched))).toEqual({
      heading: 'Fetched',
      hasWarning: false,
      bar: { percent: 25, label: 'Fetched' },
      stage: 'Step 1 of 4 is done.',
      footnote: 'Not started: Transcribing on this Mac, Scoring windows, Cutting clips.',
      action: null,
    });
  });

  it('heads a transcribed project Transcribed and names the two steps that have not started', () => {
    const steps = [{ ...TRANSCRIBE, ...DONE }, ...NOT_TRANSCRIPTION];
    const transcribed = { ...describeFetchedProject('transcribed', steps), percent: 50 };

    expect(describeStatus(transcribed, among(transcribed))).toEqual({
      heading: 'Transcribed',
      hasWarning: false,
      bar: { percent: 50, label: 'Transcribed' },
      stage: 'Step 2 of 4 is done.',
      footnote: 'Not started: Scoring windows, Cutting clips.',
      action: null,
    });
  });

  it('counts a model download among the steps that are done', () => {
    const steps = [{ ...DOWNLOAD, ...DONE }, { ...TRANSCRIBE, ...DONE }, ...NOT_TRANSCRIPTION];
    const transcribed = describeFetchedProject('transcribed', steps);

    expect(describeStatus(transcribed, among(transcribed)).stage).toBe('Step 3 of 5 is done.');
  });

  it('shows a model download under the label the service sent, as step 2 of 5', () => {
    const steps: ProjectStep[] = [{ ...DOWNLOAD, state: 'running', percent: 30 }, ...LATER_STEPS];
    const downloading = { ...describeFetchedProject('processing', steps), percent: 29 };

    expect(describeStatus(downloading, among(downloading))).toEqual({
      heading: 'Finding Clips',
      hasWarning: false,
      bar: { percent: 29, label: 'Downloading Whisper small' },
      stage: 'Downloading Whisper small',
      footnote: 'Step 2 of 5.',
      action: 'stop',
    });
  });

  it('counts the transcription as step 3 of 5 after a model download', () => {
    const steps: ProjectStep[] = [
      { ...DOWNLOAD, ...DONE },
      { ...TRANSCRIBE, state: 'running', percent: 40 },
      ...NOT_TRANSCRIPTION,
    ];
    const transcribing = describeFetchedProject('processing', steps);

    expect(describeStatus(transcribing, among(transcribing))).toMatchObject({
      stage: 'Transcribing on this Mac',
      footnote: 'Step 3 of 5.',
    });
  });
});
