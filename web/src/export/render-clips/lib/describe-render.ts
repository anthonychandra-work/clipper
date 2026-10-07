import type { ExportClip, ProjectExport, RenderState } from '../../export.types';

const STATES_IN_THE_QUEUE: readonly RenderState[] = ['waiting', 'rendering'];
const NO_REASON_GIVEN = 'This clip could not be rendered. Retry to render it again.';

export interface RenderButton {
  label: string;
  isBusy: boolean;
  isDisabled: boolean;
}

export type RowStatus =
  | { kind: 'not-rendered' }
  | { kind: 'progress'; label: 'Waiting' | 'Rendering'; percent: number }
  | { kind: 'failed'; reason: string }
  | { kind: 'download'; address: string };

export function isRendering(projectExport: ProjectExport | null): boolean {
  if (projectExport === null) return false;
  return projectExport.clips.some((clip) => STATES_IN_THE_QUEUE.includes(clip.render.state));
}

export function describeRenderButton(projectExport: ProjectExport): RenderButton {
  const isBusy = isRendering(projectExport);
  const clipCount = projectExport.clips.length;
  const label = isBusy ? 'Rendering…' : `Render ${clipCount} ${clipCount === 1 ? 'Clip' : 'Clips'}`;
  return { label, isBusy, isDisabled: isBusy || !projectExport.hasSource };
}

export function describeRow(clip: ExportClip, hasSource: boolean): RowStatus {
  if (!hasSource && clip.download !== null) return { kind: 'download', address: clip.download };
  const { state, percent, reason } = clip.render;
  if (state === 'waiting') return { kind: 'progress', label: 'Waiting', percent };
  if (state === 'rendering') return { kind: 'progress', label: 'Rendering', percent };
  if (state === 'failed') return { kind: 'failed', reason: reason ?? NO_REASON_GIVEN };
  if (state === 'done' && clip.download !== null) return { kind: 'download', address: clip.download };
  return { kind: 'not-rendered' };
}
