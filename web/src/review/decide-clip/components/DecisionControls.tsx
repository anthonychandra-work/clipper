'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';

import { Icon } from '@/shared/ui';

import type { ClipChange, Decision, ReviewClip } from '../../review.types';
import { pressKeep } from '../lib/apply-decision';
import { RejectMenu } from './RejectMenu';

const REJECT_BUTTON_ID = 'decision-reject';
const KEEP_STYLES: Record<Decision, string> = {
  undecided: 'bar-button bar-button--tinted',
  keep: 'bar-button bar-button--kept',
  reject: 'bar-button',
};

interface DecisionControlsProps {
  clip: ReviewClip;
  nextHref: string;
  onDecide: (change: ClipChange) => void;
}

export function DecisionControls({ clip, nextHref, onDecide }: DecisionControlsProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const isRejected = clip.decision === 'reject';
  const isKept = clip.decision === 'keep';
  return (
    <>
      <button
        type="button"
        className={isRejected ? 'bar-button bar-button--rejected' : 'bar-button'}
        id={REJECT_BUTTON_ID}
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isRejected ? <Icon name="xmark" /> : null}
        {isRejected ? 'Rejected' : 'Reject'}
      </button>
      <button
        type="button"
        className={KEEP_STYLES[clip.decision]}
        id="decision-keep"
        aria-pressed={isKept}
        onClick={() => onDecide(pressKeep(clip.decision))}
      >
        {isKept ? <Icon name="checkmark" /> : null}
        {isKept ? 'Kept' : 'Keep'}
      </button>
      <Link
        className={clip.decision === 'undecided' ? 'bar-button' : 'bar-button bar-button--tinted'}
        id="decision-next"
        href={nextHref}
      >
        Next
        <Icon name="chevron-right" />
      </Link>
      {isMenuOpen ? (
        <RejectMenu clip={clip} anchorId={REJECT_BUTTON_ID} onDecide={onDecide} onClose={closeMenu} />
      ) : null}
    </>
  );
}
