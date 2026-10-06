'use client';

import { Menu, MenuChoice, MenuDivider, MenuItem, MenuTitle } from '@/shell';

import type { ClipChange, ReviewClip } from '../../review.types';
import { chooseReason, undoReject } from '../lib/apply-decision';
import { NO_REASON_LABEL, REJECT_REASONS } from '../lib/reject-reasons';

interface RejectMenuProps {
  clip: ReviewClip;
  anchorId: string;
  onDecide: (change: ClipChange) => void;
  onClose: () => void;
}

export function RejectMenu({ clip, anchorId, onDecide, onClose }: RejectMenuProps) {
  const isRejected = clip.decision === 'reject';
  const decide = (change: ClipChange) => {
    onDecide(change);
    onClose();
  };
  return (
    <Menu label="Reject this clip" anchorId={anchorId} onClose={onClose}>
      <MenuTitle>Why? The selector uses the reason when it picks clips from your next video.</MenuTitle>
      {REJECT_REASONS.map((reason) => (
        <MenuChoice
          key={reason.value}
          id={`reject-reason-${reason.value}`}
          isChosen={isRejected && clip.rejectReason === reason.value}
          onSelect={() => decide(chooseReason(reason.value))}
        >
          {reason.label}
        </MenuChoice>
      ))}
      <MenuDivider />
      <MenuChoice
        id="reject-reason-none"
        isChosen={isRejected && clip.rejectReason === null}
        onSelect={() => decide(chooseReason(null))}
      >
        {NO_REASON_LABEL}
      </MenuChoice>
      {isRejected ? (
        <>
          <MenuDivider />
          <MenuItem id="reject-undo" isDestructive isAlignedWithChoices onSelect={() => decide(undoReject())}>
            Undo Reject
          </MenuItem>
        </>
      ) : null}
    </Menu>
  );
}
