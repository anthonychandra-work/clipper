import type { Project, ProjectStatus, ProjectStep } from '../../library.types';

interface RowNote {
  kind: 'note';
  status: ProjectStatus;
  text: string;
  hasWarning: boolean;
}

interface RowProgress {
  kind: 'progress';
  percent: number;
  label: string;
}

export type RowStatus = RowNote | RowProgress;

const NOTES: Partial<Record<ProjectStatus, { text: string; hasWarning: boolean }>> = {
  queued: { text: 'Waiting in queue', hasWarning: false },
  failed: { text: 'Could not finish', hasWarning: true },
  stopped: { text: 'Stopped', hasWarning: false },
  exported: { text: 'Exported', hasWarning: false },
};

const RESTING_WORDS: Partial<Record<ProjectStatus, string>> = {
  fetched: 'Fetched',
  transcribed: 'Transcribed',
};

export function describeRowStatus(project: Project): RowStatus {
  if (project.status === 'ready') return describeReadyRow(project);
  const note = NOTES[project.status];
  if (note) return { kind: 'note', status: project.status, ...note };
  const label = nameRestingState(project.status) ?? findCurrentStep(project)?.label ?? '';
  return { kind: 'progress', percent: project.percent, label };
}

function describeReadyRow(project: Project): RowNote {
  const candidates = describeCandidateCount(project.candidateCount);
  const text = `Ready to review · ${candidates}, ${project.keptCount} kept, ${project.rejectedCount} rejected`;
  return { kind: 'note', status: project.status, text, hasWarning: false };
}

export function describeCandidateCount(candidateCount: number): string {
  return candidateCount === 1 ? '1 candidate' : `${candidateCount} candidates`;
}

export function nameRestingState(status: ProjectStatus): string | undefined {
  return RESTING_WORDS[status];
}

export function findCurrentStep(project: Project): ProjectStep | undefined {
  return project.steps.find((step) => step.state !== 'done');
}
