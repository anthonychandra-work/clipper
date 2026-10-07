'use client';

import { formatPreciseTimecode } from '@/shared/lib/format-timecode';

import type { ClipEdge, ClipPoints, ReviewSentence } from '../../review.types';
import type { ClipRange } from '../../time-clips';
import { type HandleEvents, type TrimmedClip, useTrimDrag } from '../hooks/use-trim-drag';
import { placeSelection } from '../lib/place-selection';

const EDGE_LABELS: Record<ClipEdge, string> = { start: 'In point', end: 'Out point' };

interface FilmstripProps extends TrimmedClip {
  frames: readonly (string | null)[];
  range: ClipRange;
}

export function Filmstrip({ frames, range, ...trimmed }: FilmstripProps) {
  const reach = trimmed.limits.reach;
  const place = placeSelection(range, reach);
  const drag = useTrimDrag(trimmed);
  return (
    <div className={drag.isTrimming ? 'filmstrip is-trimming' : 'filmstrip'} id="filmstrip">
      <div className="filmstrip__frames" aria-hidden="true">
        {frames.map((address, frame) => (
          <FilmFrame key={frame} address={address} />
        ))}
      </div>
      <span
        className="filmstrip__shade filmstrip__shade--before"
        id="trim-shade-before"
        style={{ width: `${place.before.toFixed(2)}%` }}
      />
      <span
        className="filmstrip__shade filmstrip__shade--after"
        id="trim-shade-after"
        style={{ width: `${place.after.toFixed(2)}%` }}
      />
      <div
        className="filmstrip__selection"
        id="trim-selection"
        style={{ left: `${place.before.toFixed(2)}%`, right: `${place.after.toFixed(2)}%` }}
      >
        <TrimHandle edge="start" seconds={range.start} reach={reach} points={trimmed.points} events={drag.bindHandle('start')} />
        <TrimHandle edge="end" seconds={range.end} reach={reach} points={trimmed.points} events={drag.bindHandle('end')} />
      </div>
    </div>
  );
}

function FilmFrame({ address }: { address: string | null }) {
  if (address === null) return <span className="filmstrip__frame filmstrip__frame--missing" />;
  return (
    <span className="filmstrip__frame">
      {/* eslint-disable-next-line @next/next/no-img-element -- the service already cut this frame to size */}
      <img src={address} alt="" draggable={false} />
    </span>
  );
}

interface TrimHandleProps {
  edge: ClipEdge;
  seconds: number;
  reach: readonly ReviewSentence[];
  points: ClipPoints;
  events: HandleEvents;
}

function TrimHandle({ edge, seconds, reach, points, events }: TrimHandleProps) {
  const sentence = edge === 'start' ? points.startSentence : points.endSentence;
  const place = reach.findIndex((reached) => reached.number === sentence);
  return (
    <button
      type="button"
      className={`filmstrip__handle filmstrip__handle--${edge}`}
      id={`trim-handle-${edge}`}
      role="slider"
      aria-label={EDGE_LABELS[edge]}
      aria-orientation="horizontal"
      aria-valuemin={0}
      aria-valuemax={reach.length - 1}
      aria-valuenow={place}
      aria-valuetext={`Sentence ${place + 1} of ${reach.length}, ${formatPreciseTimecode(seconds)}`}
      {...events}
    />
  );
}
