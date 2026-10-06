'use client';

import { useEffect, useState } from 'react';

import { readProblem } from '@/shared/lib/read-problem';
import { showToast } from '@/shell';

import { fetchSettings } from '../api/fetch-settings';
import { forgetHistory } from '../api/forget-history';
import { removeApiKey } from '../api/remove-api-key';
import { saveApiKey } from '../api/save-api-key';
import { saveSetting } from '../api/save-setting';
import type { ChoiceName, Settings } from '../lib/setting-options';

const NO_KEY_TYPED = 'Paste the key first.';
const KEY_SAVED = 'Key saved on this Mac';
const KEY_REMOVED = 'Key removed';
const HISTORY_FORGOTTEN = 'The selector forgot what it had learned';

export interface SettingsEditor {
  settings: Settings | null;
  choose: (name: ChoiceName, value: string) => void;
  saveKey: (typedKey: string) => void;
  removeKey: () => void;
  forgetLearned: () => void;
}

export function useSettings(): SettingsEditor {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    let isCurrent = true;
    fetchSettings().then(
      (loaded) => {
        if (isCurrent) setSettings(loaded);
      },
      (error: unknown) => showToast(readProblem(error).message),
    );
    return () => {
      isCurrent = false;
    };
  }, []);

  function choose(name: ChoiceName, value: string): void {
    const before = settings;
    if (before === null) return;
    setSettings({ ...before, [name]: value });
    saveSetting(name, value).then(setSettings, (error: unknown) => {
      setSettings(before);
      showToast(readProblem(error).message);
    });
  }

  function saveKey(typedKey: string): void {
    if (typedKey.trim() === '') {
      showToast(NO_KEY_TYPED);
      return;
    }
    showOnceAnswered(saveApiKey(typedKey), KEY_SAVED);
  }

  function removeKey(): void {
    showOnceAnswered(removeApiKey(), KEY_REMOVED);
  }

  function forgetLearned(): void {
    showOnceAnswered(forgetHistory(), HISTORY_FORGOTTEN);
  }

  function showOnceAnswered(answer: Promise<Settings>, message: string): void {
    answer.then(
      (answered) => {
        setSettings(answered);
        showToast(message);
      },
      (error: unknown) => showToast(readProblem(error).message),
    );
  }

  return { settings, choose, saveKey, removeKey, forgetLearned };
}
