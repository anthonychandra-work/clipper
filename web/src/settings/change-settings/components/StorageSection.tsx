import { ProgressBar } from '@/shared/ui';

import type { SettingsEditor } from '../hooks/use-settings';
import { describeDiskUse, type Settings } from '../lib/setting-options';
import { SelectRow } from './SelectRow';

interface SectionProps {
  settings: Settings;
  choose: SettingsEditor['choose'];
}

export function StorageSection({ settings, choose }: SectionProps) {
  return (
    <section className="group-section">
      <h2 className="list-header">Storage</h2>
      <div className="group divided">
        <div className="storage">
          <p>
            <span className="numeric">{Math.floor(settings.freeDiskGb)} GB</span> free of{' '}
            {Math.round(settings.totalDiskGb)} GB on this Mac
          </p>
          <ProgressBar name="disk" percent={describeDiskUse(settings)} label="Disk space used" />
        </div>
        <SelectRow name="sourceRetention" settings={settings} choose={choose} />
      </div>
      <p className="list-footer">Exported clips stay until you delete them.</p>
    </section>
  );
}
