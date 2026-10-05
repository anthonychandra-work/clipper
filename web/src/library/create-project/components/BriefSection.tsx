import type { DraftEditor } from '../hooks/use-draft';

export function BriefSection({ editor }: { editor: DraftEditor }) {
  return (
    <section className="group-section">
      <label className="list-header" htmlFor="draft-brief">
        What to Look For (Optional)
      </label>
      <div className="group">
        <textarea
          className="text-area"
          id="draft-brief"
          rows={3}
          value={editor.draft.brief}
          placeholder="Pricing advice and strong opinions. Skip the sponsor read."
          onChange={(event) => editor.editBrief(event.target.value)}
        />
      </div>
    </section>
  );
}
