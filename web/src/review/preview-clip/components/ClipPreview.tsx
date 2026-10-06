'use client';

import { useRef } from 'react';

import type { Look, ReviewClip } from '../../review.types';
import { clipRange, readPoints } from '../../time-clips';
import { usePlayback } from '../hooks/use-playback';
import { PlayerPicture } from './PlayerPicture';
import { PlayerTransport } from './PlayerTransport';
import { SourceGoneNotice } from './SourceGoneNotice';

interface ClipPreviewProps {
  clip: ReviewClip;
  look: Look;
  source: string | null;
}

export function ClipPreview({ clip, look, source }: ClipPreviewProps) {
  if (source === null) return <SourceGoneNotice />;
  return <PlayingPreview clip={clip} look={look} source={source} />;
}

function PlayingPreview({ clip, look, source }: ClipPreviewProps & { source: string }) {
  const range = clipRange(readPoints(clip), clip.sentences);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playback = usePlayback(videoRef, range);
  return (
    <section className="preview" aria-label="Clip preview">
      <div className={playback.isPlaying ? 'player-shell is-playing' : 'player-shell'}>
        <PlayerPicture source={source} clip={clip} look={look} videoRef={videoRef} playback={playback} />
        <PlayerTransport playback={playback} duration={range.duration} />
      </div>
    </section>
  );
}
