'use client';

import type { ResultClip } from '../../results.types';
import { useViewsDraft, type ViewsSink } from '../hooks/use-views-draft';

const RANK_DIGITS = 2;
const VIEWS_STEP = 100;

interface ViewsListProps extends ViewsSink {
  clips: readonly ResultClip[];
}

export function ViewsList({ clips, onShow, onSave }: ViewsListProps) {
  return (
    <section className="group-section">
      <h2 className="list-header">Views After 7 Days</h2>
      <ol className="group divided">
        {clips.map((clip) => (
          <ViewsRow key={clip.id} clip={clip} onShow={onShow} onSave={onSave} />
        ))}
      </ol>
      <p className="list-footer">
        Enter each clip’s views a week after posting. The selector compares them with its own ranking and adjusts what
        it favours on your next video.
      </p>
    </section>
  );
}

function ViewsRow({ clip, onShow, onSave }: ViewsSink & { clip: ResultClip }) {
  const draft = useViewsDraft(clip, { onShow, onSave });
  const fieldId = `views-${clip.id}`;
  return (
    <li className="views-row">
      <span className="views-row__rank numeric">{String(clip.rank).padStart(RANK_DIGITS, '0')}</span>
      <label htmlFor={fieldId}>{clip.title}</label>
      <input
        className="number-field"
        type="number"
        id={fieldId}
        inputMode="numeric"
        min={0}
        step={VIEWS_STEP}
        value={draft.value}
        onChange={(event) => draft.type(event.target.value)}
        onBlur={draft.leave}
      />
    </li>
  );
}
