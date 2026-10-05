import { Switch } from '@/shared/ui';

import type { DraftEditor } from '../hooks/use-draft';
import { PLATFORMS } from '../lib/create-draft';
import { FieldError, markInvalid } from './FieldError';

export function PlatformsSection({ editor }: { editor: DraftEditor }) {
  const { draft } = editor;
  return (
    <section className="group-section">
      <h3 className="list-header">Platforms</h3>
      <div className="group divided" role="group" aria-label="Platforms" {...markInvalid(draft, 'platforms')}>
        {PLATFORMS.map((platform) => (
          <label className="row" htmlFor={`platform-${platform.value}`} key={platform.value}>
            <span className="row__label">{platform.label}</span>
            <Switch
              id={`platform-${platform.value}`}
              isOn={draft.platforms.includes(platform.value)}
              onToggle={() => editor.togglePlatform(platform.value)}
            />
          </label>
        ))}
      </div>
      <FieldError draft={draft} section="platforms" />
    </section>
  );
}
