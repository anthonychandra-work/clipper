'use client';

import { useState } from 'react';

import { refreshProjects } from '@/library';
import { readProblem } from '@/shared/lib/read-problem';
import { showToast } from '@/shell';

import { sendHaltAction } from '../api/halt-project';
import type { HaltAction } from '../lib/describe-status';

const RESTART_LABELS = { resume: 'Resume', retry: 'Retry' };

interface HaltActionsProps {
  projectId: string;
  action: HaltAction;
}

export function HaltActions({ projectId, action }: HaltActionsProps) {
  const [isSending, setIsSending] = useState(false);

  async function send() {
    setIsSending(true);
    try {
      await sendHaltAction(projectId, action);
    } catch (error) {
      showToast(readProblem(error).message);
    }
    await refreshProjects();
    setIsSending(false);
  }

  if (action === 'stop') {
    return (
      <button type="button" className="button" id="stop-project" disabled={isSending} onClick={send}>
        Stop
      </button>
    );
  }
  return (
    <div className="status-card__actions">
      <button
        type="button"
        className="button button--prominent"
        id="retry-project"
        disabled={isSending}
        onClick={send}
      >
        {RESTART_LABELS[action]}
      </button>
    </div>
  );
}
