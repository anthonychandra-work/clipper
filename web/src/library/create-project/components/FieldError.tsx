import { Icon } from '@/shared/ui';

import type { Draft } from '../lib/create-draft';

const PROBLEM_ID = 'draft-problem';

export type DraftSection = 'source' | 'platforms';

interface InvalidMark {
  'aria-invalid'?: true;
  'aria-describedby'?: string;
}

export function FieldError({ draft, section }: { draft: Draft; section: DraftSection }) {
  if (draft.problem?.section !== section) return null;
  return (
    <p className="field-error" id={PROBLEM_ID} role="alert">
      <Icon name="warning" />
      {draft.problem.message}
    </p>
  );
}

export function markInvalid(draft: Draft, section: DraftSection): InvalidMark {
  return draft.problem?.section === section ? { 'aria-invalid': true, 'aria-describedby': PROBLEM_ID } : {};
}
