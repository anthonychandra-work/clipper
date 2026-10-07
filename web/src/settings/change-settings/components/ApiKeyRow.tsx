'use client';

import { useRef } from 'react';

import type { SettingsEditor } from '../hooks/use-settings';
import { describeSavedKey, type Settings } from '../lib/setting-options';

interface ApiKeyRowProps {
  settings: Settings;
  saveKey: SettingsEditor['saveKey'];
  removeKey: SettingsEditor['removeKey'];
}

export function ApiKeyRow({ settings, saveKey, removeKey }: ApiKeyRowProps) {
  if (settings.hasApiKey) return <SavedKey ending={settings.apiKeyEnding} removeKey={removeKey} />;
  return <KeyField saveKey={saveKey} />;
}

function SavedKey({ ending, removeKey }: { ending: string | null; removeKey: SettingsEditor['removeKey'] }) {
  return (
    <div className="row">
      <span className="row__label">Anthropic API Key</span>
      <span className="row__value numeric">{describeSavedKey(ending)}</span>
      <button type="button" className="button button--destructive" id="remove-api-key" onClick={removeKey}>
        Remove
      </button>
    </div>
  );
}

function KeyField({ saveKey }: { saveKey: SettingsEditor['saveKey'] }) {
  const field = useRef<HTMLInputElement>(null);

  function sendTypedKey(): void {
    const typed = field.current;
    if (typed === null) return;
    const typedKey = typed.value;
    typed.value = '';
    saveKey(typedKey);
  }

  return (
    <div className="row">
      <label className="row__label" htmlFor="setting-apiKey">
        Anthropic API Key
      </label>
      <input
        ref={field}
        className="row__field"
        id="setting-apiKey"
        type="password"
        autoComplete="off"
        placeholder="sk-ant-…"
      />
      <button type="button" className="button" id="save-api-key" onClick={sendTypedKey}>
        Save
      </button>
    </div>
  );
}
