import type { RejectReason } from '../../review.types';

export interface RejectReasonChoice {
  value: RejectReason;
  label: string;
}

export const REJECT_REASONS: readonly RejectReasonChoice[] = [
  { value: 'cut-off', label: 'Cut Off Mid-Thought' },
  { value: 'not-interesting', label: 'Not Interesting' },
  { value: 'needs-context', label: 'Needs Earlier Context' },
  { value: 'repeat', label: 'Repeats Another Clip' },
];

export const NO_REASON_LABEL = 'No Reason';
