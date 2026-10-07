import { SegmentedControl } from '@/shared/ui';

import type { DraftEditor } from '../hooks/use-draft';
import { CLIP_LENGTHS } from '../lib/clip-lengths';

export function ClipLengthSection({ editor }: { editor: DraftEditor }) {
  const chosen = CLIP_LENGTHS.find((option) => option.value === editor.draft.length);
  return (
    <section className="group-section">
      <h3 className="list-header">Clip Length</h3>
      <SegmentedControl
        name="length"
        label="Clip length"
        selected={editor.draft.length}
        options={CLIP_LENGTHS}
        onSelect={editor.setLength}
      />
      <p className="list-footer">{chosen?.hint}</p>
    </section>
  );
}
