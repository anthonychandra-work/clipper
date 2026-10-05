export type SourceKind = 'link' | 'file';

export type ProjectStatus =
  | 'uploading'
  | 'queued'
  | 'processing'
  | 'failed'
  | 'stopped'
  | 'fetched'
  | 'ready'
  | 'exported';

export type StepKind = 'fetch' | 'transcribe' | 'score' | 'cut';

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

export interface Project {
  id: string;
  title: string;
  sourceKind: SourceKind;
  sourceLabel: string;
  durationSeconds: number | null;
  status: ProjectStatus;
  steps: ProjectStep[];
  percent: number;
  halt: { reason: string } | null;
  upload: ProjectUpload | null;
}

export interface ProjectList {
  projects: Project[];
  freeDiskGb: number;
}
