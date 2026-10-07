import { SegmentedControl } from '@/shared/ui';

import type { SourceKind } from '../../library.types';
import type { DraftEditor } from '../hooks/use-draft';
import { FieldError } from './FieldError';
import { FileField } from './FileField';
import { LinkField } from './LinkField';

const SOURCE_KINDS: readonly { value: SourceKind; label: string }[] = [
  { value: 'link', label: 'YouTube Link' },
  { value: 'file', label: 'Upload a File' },
];

export function SourceSection({ editor }: { editor: DraftEditor }) {
  const { draft } = editor;
  return (
    <section className="group-section">
      <h3 className="list-header">Source</h3>
      <SegmentedControl
        name="source"
        label="Source"
        selected={draft.sourceKind}
        options={SOURCE_KINDS}
        onSelect={editor.setSourceKind}
      />
      {draft.sourceKind === 'link' ? <LinkField editor={editor} /> : <FileField editor={editor} />}
      <FieldError draft={draft} section="source" />
    </section>
  );
}
