import type { ClipChange, Decision, RejectReason } from '../../review.types';

export function pressKeep(decision: Decision): ClipChange {
  return { decision: decision === 'keep' ? 'undecided' : 'keep' };
}

export function chooseReason(reason: RejectReason | null): ClipChange {
  return { decision: 'reject', rejectReason: reason };
}

export function undoReject(): ClipChange {
  return { decision: 'undecided' };
}
