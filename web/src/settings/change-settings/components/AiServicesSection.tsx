import type { SettingsEditor } from '../hooks/use-settings';
import type { Settings } from '../lib/setting-options';
import { ApiKeyRow } from './ApiKeyRow';
import { SelectRow } from './SelectRow';

interface SectionProps {
  settings: Settings;
  choose: SettingsEditor['choose'];
  saveKey: SettingsEditor['saveKey'];
  removeKey: SettingsEditor['removeKey'];
}

export function AiServicesSection({ settings, choose, saveKey, removeKey }: SectionProps) {
  return (
    <section className="group-section">
      <h2 className="list-header">AI Services</h2>
      <div className="group divided">
        <ApiKeyRow settings={settings} saveKey={saveKey} removeKey={removeKey} />
        <SelectRow name="scoringModel" settings={settings} choose={choose} />
        <SelectRow name="cuttingModel" settings={settings} choose={choose} />
        <SelectRow name="whisperModel" settings={settings} choose={choose} />
      </div>
      <p className="list-footer">
        The key is stored on this Mac and shown only by its last four characters. Claude reads the transcript
        to score windows and cut clips; the video stays here. Transcription runs on this Mac, and a
        transcription model downloads the first time a project needs it.
      </p>
    </section>
  );
}
