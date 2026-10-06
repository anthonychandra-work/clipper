export type SourceKind = 'link' | 'file';

export type ProjectStatus =
  | 'uploading'
  | 'queued'
  | 'processing'
  | 'failed'
  | 'stopped'
  | 'fetched'
  | 'transcribed'
  | 'ready'
  | 'exported';

export type StepKind = 'fetch' | 'model' | 'transcribe' | 'score' | 'cut';

export interface ProjectStep {
  kind: StepKind;
  label: string;
  state: 'pending' | 'running' | 'done';
  percent: number;
}

export interface ProjectUpload {
  fileName: string;
  sizeBytes: number;
  receivedBytes: number;
}

export interface ProjectHalt {
  reason: string;
  opensSettings: boolean;
}

export interface Project {
  id: string;
  title: string;
  sourceKind: SourceKind;
  sourceLabel: string;
  durationSeconds: number | null;
  status: ProjectStatus;
  steps: ProjectStep[];
  percent: number;
  halt: ProjectHalt | null;
  upload: ProjectUpload | null;
  candidateCount: number;
  keptCount: number;
  rejectedCount: number;
  exportedCount: number;
  loggedCount: number;
}

export interface ProjectList {
  projects: Project[];
  freeDiskGb: number;
}
