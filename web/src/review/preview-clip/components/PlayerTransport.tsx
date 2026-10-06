import type { CSSProperties } from 'react';

import { formatClock } from '@/shared/lib/format-timecode';
import { Icon } from '@/shared/ui';

import type { Playback } from '../hooks/use-playback';

interface PlayerTransportProps {
  playback: Playback;
  duration: number;
}

export function PlayerTransport({ playback, duration }: PlayerTransportProps) {
  const { seconds, isPlaying } = playback;
  const playedShare = duration > 0 ? seconds / duration : 0;
  return (
    <div className="player__controls">
      <button
        type="button"
        className="player__play"
        id="preview-play"
        aria-label={isPlaying ? 'Pause' : 'Play'}
        onClick={playback.toggle}
      >
        <Icon name={isPlaying ? 'pause' : 'play'} />
      </button>
      <input
        type="range"
        className="slider"
        id="preview-scrubber"
        min="0"
        max={duration.toFixed(1)}
        step="0.1"
        value={seconds.toFixed(1)}
        style={{ '--value': `${(100 * playedShare).toFixed(2)}%` } as CSSProperties}
        aria-label="Position in clip"
        onChange={(event) => playback.seek(Number(event.target.value))}
      />
      <span className="player__clock numeric" id="preview-clock">
        {formatClock(seconds)} / {formatClock(duration)}
      </span>
    </div>
  );
}
