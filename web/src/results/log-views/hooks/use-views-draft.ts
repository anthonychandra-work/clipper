'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { ResultClip } from '../../results.types';
import { readTypedViews } from '../lib/read-typed-views';

const SAVE_DELAY_MS = 500;

export interface ViewsSink {
  onShow: (clipId: string, views: number | null) => void;
  onSave: (clipId: string, views: number | null) => void;
}

export interface ViewsDraft {
  value: string;
  type: (text: string) => void;
  leave: () => void;
}

export function useViewsDraft(clip: ResultClip, { onShow, onSave }: ViewsSink): ViewsDraft {
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
    const views = readTypedViews(text);
    setDraft(text);
    onShow(clip.id, views);
    waitingSave.current = { timer: setTimeout(saveNow, SAVE_DELAY_MS), save: () => onSave(clip.id, views) };
  }

  function leave(): void {
    saveNow();
    setDraft(null);
  }

  return { value: draft ?? (clip.views === null ? '' : String(clip.views)), type, leave };
}
