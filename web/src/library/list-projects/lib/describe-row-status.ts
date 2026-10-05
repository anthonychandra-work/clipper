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
  ready: { text: 'Ready to review', hasWarning: false },
  exported: { text: 'Exported', hasWarning: false },
};

const RESTING_LABELS: Partial<Record<ProjectStatus, string>> = {
  fetched: 'Fetched',
};

export function describeRowStatus(project: Project): RowStatus {
  const note = NOTES[project.status];
  if (note) return { kind: 'note', status: project.status, ...note };
  const label = RESTING_LABELS[project.status] ?? findCurrentStep(project)?.label ?? '';
  return { kind: 'progress', percent: project.percent, label };
}

export function findCurrentStep(project: Project): ProjectStep | undefined {
  return project.steps.find((step) => step.state !== 'done');
}
