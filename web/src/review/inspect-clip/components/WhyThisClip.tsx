import { Icon } from '@/shared/ui';

import type { ReviewClip, Subscores } from '../../review.types';

const MOST_POINTS = 25;
const SCORE_PARTS: readonly { part: keyof Subscores; label: string }[] = [
  { part: 'hook', label: 'Hook' },
  { part: 'arc', label: 'Arc' },
  { part: 'value', label: 'Value' },
  { part: 'share', label: 'Share' },
];

interface WhyThisClipProps {
  clip: ReviewClip;
  clipCount: number;
}

export function WhyThisClip({ clip, clipCount }: WhyThisClipProps) {
  return (
    <div className="group-section">
      <h2 className="list-header">Why This Clip</h2>
      <div className="group group--padded">
        <p>{clip.reason}</p>
        <div className="scores">
          {SCORE_PARTS.map(({ part, label }) => (
            <ScoreBar key={part} label={label} points={clip.scores[part]} />
          ))}
        </div>
        {clip.isReplayPeak ? <ReplayNote /> : null}
      </div>
      <p className="list-footer">
        <span className="numeric">{clip.total}</span> of 100, rank {clip.rank} of {clipCount}. The score orders clips
        inside this video. It does not forecast views.
      </p>
    </div>
  );
}

function ScoreBar({ label, points }: { label: string; points: number }) {
  return (
    <div className="score">
      <span>{label}</span>
      <span className="score__track">
        <span className="score__fill" style={{ width: `${(points / MOST_POINTS) * 100}%` }} />
      </span>
      <span className="score__value numeric">
        {points}/{MOST_POINTS}
      </span>
    </div>
  );
}

function ReplayNote() {
  return (
    <p className="replay-note">
      <Icon name="replay" />
      <span>
        <strong>Replay peak.</strong> Viewers of the source video rewatched this part more than the rest.
      </span>
    </p>
  );
}
