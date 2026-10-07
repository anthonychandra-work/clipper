import type { DraftEditor } from '../hooks/use-draft';
import { markInvalid } from './FieldError';

export function FileField({ editor }: { editor: DraftEditor }) {
  const chosen = editor.draft.file;
  return (
    <>
      <div className="group">
        <label className="row row--stack" htmlFor="draft-file">
          <span className="row__label">Video File</span>
          <input
            id="draft-file"
            type="file"
            accept="video/*"
            onChange={(event) => editor.pickFile(event.target.files?.[0] ?? null)}
            {...markInvalid(editor.draft, 'source')}
          />
        </label>
      </div>
      <p className="list-footer" id="draft-file-name">
        {chosen ? `Chosen: ${chosen.name}` : 'MP4, MOV or MKV.'}
      </p>
    </>
  );
}
