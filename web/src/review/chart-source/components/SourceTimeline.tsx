'use client';

import Link from 'next/link';
import { useState } from 'react';

import { formatTimecode } from '@/shared/lib/format-timecode';

import type { Decision, ReviewClip, ReviewWindow } from '../../review.types';
import { clipRange } from '../../time-clips';
import { useElementWidth } from '../hooks/use-element-width';
import { type PlacedPin, placePins } from '../lib/place-pins';

const AXIS_STEPS = 4;
const NARROWEST_BAR_WITH_GAP_PX = 3;
const DECISION_WORDS: Record<Decision, string> = { undecided: 'not decided', keep: 'kept', reject: 'rejected' };

interface SourceTimelineProps {
  windows: readonly ReviewWindow[];
  clips: readonly ReviewClip[];
  videoSeconds: number;
  shownClipId: string | null;
  hrefOfClip: (clipId: string) => string;
}

export function SourceTimeline({ windows, clips, videoSeconds, shownClipId, hrefOfClip }: SourceTimelineProps) {
  const [strip, setStrip] = useState<HTMLDivElement | null>(null);
  const width = useElementWidth(strip);
  const clipsByStart = [...clips].sort((first, second) => first.startSeconds - second.startSeconds);
  const pins = width === null ? [] : placeClipPins(clipsByStart, { strip, width, videoSeconds });
  const isTight = width !== null && windows.length * NARROWEST_BAR_WITH_GAP_PX > width;
  return (
    <section className="group-section" aria-label="Where the clips sit in the source video">
      <h2 className="list-header">Source Video</h2>
      <div className="group timeline__card">
        <div className={isTight ? 'timeline__bars timeline__bars--tight' : 'timeline__bars'} aria-hidden="true">
          {windows.map((scored) => (
            <span
              key={scored.id}
              className={scored.isShortlisted ? 'timeline__bar is-shortlisted' : 'timeline__bar'}
              style={{ height: `${scored.score}%` }}
            />
          ))}
        </div>
        <div className="timeline__pins" ref={setStrip}>
          {pins.map((pin) => (
            <TimelinePin
              key={pin.id}
              pin={pin}
              clip={findClip(clips, pin.id)}
              href={hrefOfClip(pin.id)}
              isShown={pin.id === shownClipId}
            />
          ))}
        </div>
        <TimelineAxis videoSeconds={videoSeconds} />
      </div>
      <p className="list-footer">
        Each bar is a window of about 90 seconds of the transcript. Highlighted bars scored highest and were searched
        for clips. Numbers are the clips, by rank.
      </p>
    </section>
  );
}

interface PinPlace {
  strip: HTMLDivElement | null;
  width: number;
  videoSeconds: number;
}

function placeClipPins(clipsByStart: readonly ReviewClip[], place: PinPlace): PlacedPin[] {
  const spots = clipsByStart.map((clip) => {
    const range = clipRange(clip, clip.sentences);
    return { id: clip.id, middle: ((range.start + range.duration / 2) / place.videoSeconds) * place.width };
  });
  return placePins(spots, { width: place.width, tapSize: readTapSize(place.strip) });
}

function readTapSize(strip: HTMLDivElement | null): number {
  if (strip === null) return 0;
  const style = getComputedStyle(strip);
  const pinSize = parseFloat(style.getPropertyValue('--pin-size'));
  const pinReach = parseFloat(style.getPropertyValue('--pin-reach'));
  return pinSize - 2 * pinReach;
}

function findClip(clips: readonly ReviewClip[], clipId: string): ReviewClip {
  const clip = clips.find((candidate) => candidate.id === clipId);
  if (clip === undefined) throw new Error(`The timeline has a pin for ${clipId}, which is not a clip of this review.`);
  return clip;
}

interface TimelinePinProps {
  pin: PlacedPin;
  clip: ReviewClip;
  href: string;
  isShown: boolean;
}

function TimelinePin({ pin, clip, href, isShown }: TimelinePinProps) {
  const classes = ['timeline__pin', `timeline__pin--${clip.decision}`];
  if (pin.isOnLowRow) classes.push('timeline__pin--low');
  if (isShown) classes.push('is-selected');
  const start = formatTimecode(clipRange(clip, clip.sentences).start);
  // Placed in pixels: as a share of the width a pin lands a fraction off, under the tap area of its neighbour.
  const place = { left: pin.middle };
  return (
    <Link
      className={classes.join(' ')}
      id={`pin-${clip.id}`}
      href={href}
      style={place}
      aria-current={isShown}
      aria-label={`Clip ranked ${clip.rank}, at ${start}, ${DECISION_WORDS[clip.decision]}`}
    >
      {clip.rank}
    </Link>
  );
}

function TimelineAxis({ videoSeconds }: { videoSeconds: number }) {
  const times = Array.from({ length: AXIS_STEPS + 1 }, (_, step) => (videoSeconds / AXIS_STEPS) * step);
  return (
    <div className="timeline__axis numeric" aria-hidden="true">
      {times.map((seconds) => (
        <span key={seconds}>{formatTimecode(seconds)}</span>
      ))}
    </div>
  );
}
