import { describe, expect, it } from 'vitest';

import { chooseReason, pressKeep, undoReject } from './apply-decision';
import { NO_REASON_LABEL, REJECT_REASONS } from './reject-reasons';

describe('pressKeep', () => {
  it('keeps a clip that is not decided', () => {
    expect(pressKeep('undecided')).toEqual({ decision: 'keep' });
  });

  it('keeps a clip that was rejected', () => {
    expect(pressKeep('reject')).toEqual({ decision: 'keep' });
  });

  it('leaves a kept clip undecided when it is pressed again', () => {
    expect(pressKeep('keep')).toEqual({ decision: 'undecided' });
  });
});

describe('chooseReason', () => {
  it.each(['cut-off', 'not-interesting', 'needs-context', 'repeat'] as const)(
    'rejects the clip with the reason “%s”',
    (reason) => {
      expect(chooseReason(reason)).toEqual({ decision: 'reject', rejectReason: reason });
    },
  );

  it('rejects the clip with no reason, and says so, so that an earlier reason is not kept', () => {
    expect(chooseReason(null)).toEqual({ decision: 'reject', rejectReason: null });
  });
});

describe('undoReject', () => {
  it('leaves the clip undecided', () => {
    expect(undoReject()).toEqual({ decision: 'undecided' });
  });
});

describe('the reasons of the reject menu', () => {
  it('names the four reasons in the order of the menu, and “No Reason” after them', () => {
    expect(REJECT_REASONS).toEqual([
      { value: 'cut-off', label: 'Cut Off Mid-Thought' },
      { value: 'not-interesting', label: 'Not Interesting' },
      { value: 'needs-context', label: 'Needs Earlier Context' },
      { value: 'repeat', label: 'Repeats Another Clip' },
    ]);
    expect(NO_REASON_LABEL).toBe('No Reason');
  });
});
