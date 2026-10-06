'use client';

import { type TitleSink, useTitleDraft } from '../hooks/use-title-draft';

interface TitleFieldProps extends TitleSink {
  title: string;
}

export function TitleField({ title, onShow, onSave }: TitleFieldProps) {
  const draft = useTitleDraft(title, { onShow, onSave });
  return (
    <div className="group-section">
      <label className="list-header" htmlFor="clip-title">
        Title
      </label>
      <div className="group">
        <input
          className="text-field"
          id="clip-title"
          type="text"
          value={draft.value}
          onChange={(event) => draft.type(event.target.value)}
          onBlur={draft.leave}
        />
      </div>
    </div>
  );
}
