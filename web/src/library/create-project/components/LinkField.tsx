import type { DraftEditor } from '../hooks/use-draft';
import { markInvalid } from './FieldError';

export function LinkField({ editor }: { editor: DraftEditor }) {
  return (
    <div className="group">
      <label className="row" htmlFor="draft-link">
        <span className="row__label">Video Link</span>
        <input
          className="row__field"
          id="draft-link"
          type="url"
          inputMode="url"
          value={editor.draft.link}
          placeholder="https://www.youtube.com/watch?v=…"
          onChange={(event) => editor.editLink(event.target.value)}
          {...markInvalid(editor.draft, 'source')}
        />
      </label>
    </div>
  );
}
