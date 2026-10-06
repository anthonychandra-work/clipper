import type { ExportClip as KeptClip } from '../../export.types';
import { RenderStatus } from '../../render-clips';
import { describeFile } from '../lib/describe-output';

interface ExportClipProps {
  clip: KeptClip;
  hasSource: boolean;
}

export function ExportClip({ clip, hasSource }: ExportClipProps) {
  return (
    <li className="group divided">
      <div className="export-clip__head">
        <div>
          <h3 className="export-clip__title">{clip.title}</h3>
          <p className="export-clip__path">{describeFile(clip)}</p>
        </div>
        <div className="export-clip__status">
          <RenderStatus clip={clip} hasSource={hasSource} />
        </div>
      </div>
    </li>
  );
}
