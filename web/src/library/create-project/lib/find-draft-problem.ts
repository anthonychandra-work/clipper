import type { Problem } from '@/shared/lib/read-problem';

import type { Draft } from './create-draft';

const LINK_PATTERN = /^https?:\/\/\S+\.\S+/;
const FIRST_PLATFORM_SWITCH = 'platform-tiktok';

export function findDraftProblem(draft: Draft): Problem | null {
  if (draft.sourceKind === 'link' && !LINK_PATTERN.test(draft.link.trim())) {
    return { section: 'source', message: 'Paste the full link, starting with https://' };
  }
  if (draft.sourceKind === 'file' && draft.file === null) {
    return { section: 'source', message: 'Choose a video file first.' };
  }
  if (draft.platforms.length === 0) {
    return { section: 'platforms', message: 'Turn on at least one platform.' };
  }
  return null;
}

export function findInvalidFieldId(draft: Draft): string | null {
  if (draft.problem === null) return null;
  return draft.problem.section === 'platforms' ? FIRST_PLATFORM_SWITCH : `draft-${draft.sourceKind}`;
}
