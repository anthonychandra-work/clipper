'use client';

import { useState } from 'react';

import type { Problem } from '@/shared/lib/read-problem';

import type { SourceKind } from '../../library.types';
import type { ClipLength } from '../lib/clip-lengths';
import { createDraft, type Draft, type Platform } from '../lib/create-draft';
import { findInvalidFieldId } from '../lib/find-draft-problem';

export interface DraftEditor {
  draft: Draft;
  setSourceKind: (sourceKind: SourceKind) => void;
  setLength: (length: ClipLength) => void;
  togglePlatform: (platform: Platform) => void;
  editLink: (link: string) => void;
  editBrief: (brief: string) => void;
  pickFile: (file: File | null) => void;
  showProblem: (problem: Problem) => void;
}

export function useDraft(): DraftEditor {
  const [draft, setDraft] = useState(createDraft);
  const change = (changes: Partial<Draft>) => setDraft((current) => ({ ...current, problem: null, ...changes }));

  function showProblem(problem: Problem): void {
    setDraft((current) => ({ ...current, problem }));
    const invalidFieldId = findInvalidFieldId({ ...draft, problem });
    if (invalidFieldId !== null) document.getElementById(invalidFieldId)?.focus();
  }

  return {
    draft,
    setSourceKind: (sourceKind) => change({ sourceKind }),
    setLength: (length) => setDraft((current) => ({ ...current, length })),
    togglePlatform: (platform) => change({ platforms: toggle(draft.platforms, platform) }),
    editLink: (link) => change({ link }),
    editBrief: (brief) => change({ brief }),
    pickFile: (file) => change({ file }),
    showProblem,
  };
}

function toggle(platforms: Platform[], platform: Platform): Platform[] {
  const isChosen = platforms.includes(platform);
  return isChosen ? platforms.filter((chosen) => chosen !== platform) : [...platforms, platform];
}
