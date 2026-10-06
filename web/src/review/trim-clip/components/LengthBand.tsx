import { formatDuration } from '@/shared/lib/format-timecode';

import type { ClipSeconds } from '../../review.types';
import { describeLength, measureBandScale, rateLength } from '../../time-clips';

interface LengthBandProps {
  seconds: number;
  limits: ClipSeconds;
}

export function LengthBand({ seconds, limits }: LengthBandProps) {
  const scale = measureBandScale(limits);
  const toPercent = (length: number) => `${((length / scale) * 100).toFixed(2)}%`;
  const preferred = limits.preferred;
  const ticks = [...new Set([limits.min, preferred?.min, preferred?.max, limits.max])].filter(
    (tick): tick is number => tick !== undefined,
  );
  return (
    <div className={`band band--${rateLength(seconds, limits)}`}>
      <p className="band__reading">
        <span className="numeric">{formatDuration(seconds)}</span>, {describeLength(seconds, limits)}.
      </p>
      <div className="band__track" role="img" aria-label="Clip length against the allowed and preferred bands">
        <span className="band__allowed" style={{ left: toPercent(limits.min), width: toPercent(limits.max - limits.min) }} />
        {preferred === null ? null : (
          <span
            className="band__ideal"
            style={{ left: toPercent(preferred.min), width: toPercent(preferred.max - preferred.min) }}
          />
        )}
        <span className="band__now" style={{ left: toPercent(Math.min(seconds, scale)) }} />
      </div>
      <div className="band__ticks numeric" aria-hidden="true">
        {ticks.map((tick) => (
          <span key={tick} className="band__tick" style={{ left: toPercent(tick) }}>
            {tick}
          </span>
        ))}
      </div>
    </div>
  );
}
