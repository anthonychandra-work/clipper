import { Icon, ProgressBar } from '@/shared/ui';

import type { ExportClip } from '../../export.types';
import { describeRow } from '../lib/describe-render';

interface RenderStatusProps {
  clip: ExportClip;
  hasSource: boolean;
  onRetry: (clipId: string) => void;
}

export function RenderStatus({ clip, hasSource, onRetry }: RenderStatusProps) {
  const status = describeRow(clip, hasSource);
  if (status.kind === 'progress') {
    return (
      <>
        <ProgressBar name={`render-${clip.id}`} percent={status.percent} label={status.label} />
        <span>{status.label}</span>
      </>
    );
  }
  if (status.kind === 'failed') {
    return (
      <>
        <span className="export-clip__error" role="alert">
          <Icon name="warning" />
          {status.reason}
        </span>
        <button
          type="button"
          className="button"
          id={`retry-render-${clip.id}`}
          disabled={!hasSource}
          onClick={() => onRetry(clip.id)}
        >
          Retry
        </button>
      </>
    );
  }
  if (status.kind === 'download') {
    return (
      <a
        className="button"
        id={`download-${clip.id}`}
        href={status.address}
        download
        aria-label={`Download MP4 of ${clip.title}`}
      >
        <Icon name="download" />
        Download MP4
      </a>
    );
  }
  return <span>Not rendered</span>;
}
