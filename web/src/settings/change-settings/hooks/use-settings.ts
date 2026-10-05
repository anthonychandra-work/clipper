'use client';

import { useEffect, useState } from 'react';

import { readProblem } from '@/shared/lib/read-problem';
import { showToast } from '@/shell';

import { fetchSettings } from '../api/fetch-settings';
import { saveSetting } from '../api/save-setting';
import type { ChoiceName, Settings } from '../lib/setting-options';

export interface SettingsEditor {
  settings: Settings | null;
  choose: (name: ChoiceName, value: string) => void;
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

  return { settings, choose };
}
