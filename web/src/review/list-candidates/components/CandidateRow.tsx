import Link from 'next/link';

import { formatDuration, formatTimecode } from '@/shared/lib/format-timecode';
import { Icon } from '@/shared/ui';

import type { HookType, ReviewClip } from '../../review.types';
import { clipRange, findOpenFlagLabel } from '../../time-clips';

const HOOK_WORDS: Record<HookType, string> = {
  number: 'Number',
  story: 'Story',
  list: 'List',
  'hot-take': 'Hot take',
  confession: 'Confession',
  contrarian: 'Contrarian',
  none: 'No hook',
};

interface CandidateRowProps {
  clip: ReviewClip;
  href: string;
  isShown: boolean;
}

export function CandidateRow({ clip, href, isShown }: CandidateRowProps) {
  const range = clipRange(clip, clip.sentences);
  return (
    <li className={`candidate candidate--${clip.decision}${isShown ? ' is-selected' : ''}`}>
      <Link className="candidate__open" id={`candidate-${clip.id}`} href={href} aria-current={isShown}>
        <span className="candidate__rank numeric">{String(clip.rank).padStart(2, '0')}</span>
        <span className="candidate__body">
          <span className="candidate__title">{clip.title}</span>
          <span className="candidate__meta numeric">
            {formatTimecode(range.start)} · {formatDuration(range.duration)}
          </span>
          <CandidateTags clip={clip} />
        </span>
        <span className="candidate__score numeric">
          <span className="visually-hidden">Score </span>
          {clip.total}
        </span>
        <Icon name="chevron-right" />
      </Link>
    </li>
  );
}

function CandidateTags({ clip }: { clip: ReviewClip }) {
  const flagLabel = findOpenFlagLabel(clip);
  return (
    <span className="candidate__tags">
      <span className="tag">{HOOK_WORDS[clip.hookType]}</span>
      {clip.isReplayPeak ? (
        <span className="tag">
          <Icon name="replay" />
          Replay peak
        </span>
      ) : null}
      {flagLabel === null ? null : (
        <span className="tag tag--warn">
          <Icon name="warning" />
          {flagLabel}
        </span>
      )}
      <DecisionTag decision={clip.decision} />
    </span>
  );
}

function DecisionTag({ decision }: { decision: ReviewClip['decision'] }) {
  if (decision === 'undecided') return null;
  return (
    <span className={`tag tag--${decision}`}>
      <Icon name={decision === 'keep' ? 'checkmark' : 'xmark'} />
      {decision === 'keep' ? 'Kept' : 'Rejected'}
    </span>
  );
}
