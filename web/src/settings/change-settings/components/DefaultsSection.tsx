import type { SettingsEditor } from '../hooks/use-settings';
import type { Settings } from '../lib/setting-options';
import { SelectRow } from './SelectRow';

interface SectionProps {
  settings: Settings;
  choose: SettingsEditor['choose'];
}

export function DefaultsSection({ settings, choose }: SectionProps) {
  return (
    <section className="group-section">
      <h2 className="list-header">Defaults for New Projects</h2>
      <div className="group divided">
        <SelectRow name="defaultLength" settings={settings} choose={choose} />
        <SelectRow name="clipsPerVideo" settings={settings} choose={choose} />
      </div>
    </section>
  );
}
