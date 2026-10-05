import { findCurrentStep, type Project } from '@/library';

export type HaltAction = 'stop' | 'resume' | 'retry';

export interface StatusCardText {
  heading: string;
  hasWarning: boolean;
  bar: { percent: number; label: string } | null;
  stage: string;
  footnote: string | null;
  action: HaltAction | null;
}

const KEEP_PAGE_OPEN = 'Keep this page open until the upload finishes.';
const SENT_ELSEWHERE =
  'This upload is not running in this browser. If no other browser is sending it, delete the project and upload the file again.';

export interface StatusView {
  projects: Project[];
  isSendingHere: boolean;
}

export function describeStatus(project: Project, view: StatusView): StatusCardText {
  if (project.status === 'failed') return describeHalt(project, 'Could Not Finish', 'retry');
  if (project.status === 'stopped') return describeHalt(project, 'Stopped', 'resume');
  if (project.status === 'queued') return describeWait(view.projects);
  if (project.status === 'uploading') {
    return describeRun(project, 'Uploading Video', view.isSendingHere ? KEEP_PAGE_OPEN : SENT_ELSEWHERE);
  }
  if (project.status === 'processing') return { ...describeRun(project, 'Finding Clips', ''), action: 'stop' };
  return describeRest(project);
}

function describeHalt(project: Project, heading: string, action: HaltAction): StatusCardText {
  const stage = project.halt?.reason ?? '';
  return { heading, hasWarning: true, bar: null, stage, footnote: null, action };
}

function describeWait(projects: Project[]): StatusCardText {
  const active = projects.find((other) => other.status === 'processing');
  return {
    heading: 'Waiting in Queue',
    hasWarning: false,
    bar: null,
    stage: active ? `It starts when “${active.title}” finishes.` : 'It starts in a moment.',
    footnote: 'One video is processed at a time.',
    action: null,
  };
}

function describeRun(project: Project, heading: string, advice: string): StatusCardText {
  const current = findCurrentStep(project);
  const stage = current?.label ?? '';
  const stepNumber = current ? project.steps.indexOf(current) + 1 : project.steps.length;
  const position = `Step ${stepNumber} of ${project.steps.length}.`;
  return {
    heading,
    hasWarning: false,
    bar: { percent: project.percent, label: stage },
    stage,
    footnote: advice ? `${position} ${advice}` : position,
    action: null,
  };
}

function describeRest(project: Project): StatusCardText {
  const finished = project.steps.filter((step) => step.state === 'done');
  const notStarted = project.steps.filter((step) => step.state !== 'done').map((step) => step.label);
  return {
    heading: 'Fetched',
    hasWarning: false,
    bar: { percent: project.percent, label: 'Fetched' },
    stage: `Step ${finished.length} of ${project.steps.length} is done.`,
    footnote: notStarted.length > 0 ? `Not started: ${notStarted.join(', ')}.` : null,
    action: null,
  };
}
