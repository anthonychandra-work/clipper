'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const SAVE_DELAY_MS = 500;

export interface TitleSink {
  onShow: (title: string) => void;
  onSave: (title: string) => void;
}

export interface TitleDraft {
  value: string;
  type: (text: string) => void;
  leave: () => void;
}

export function useTitleDraft(storedTitle: string, { onShow, onSave }: TitleSink): TitleDraft {
  const [draft, setDraft] = useState<string | null>(null);
  const waitingSave = useRef<{ timer: ReturnType<typeof setTimeout>; save: () => void } | null>(null);

  const saveNow = useCallback(() => {
    const waiting = waitingSave.current;
    if (waiting === null) return;
    clearTimeout(waiting.timer);
    waitingSave.current = null;
    waiting.save();
  }, []);

  useEffect(() => {
    return () => saveNow();
  }, [saveNow]);

  function type(text: string): void {
    if (waitingSave.current !== null) clearTimeout(waitingSave.current.timer);
    setDraft(text);
    onShow(text);
    waitingSave.current = { timer: setTimeout(saveNow, SAVE_DELAY_MS), save: () => onSave(text) };
  }

  function leave(): void {
    saveNow();
    setDraft(null);
  }

  return { value: draft ?? storedTitle, type, leave };
}
