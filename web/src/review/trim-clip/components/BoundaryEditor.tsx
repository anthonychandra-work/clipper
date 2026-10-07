'use client';

import type { ClipPoints, ClipSeconds, ReviewClip } from '../../review.types';
import { clipRange, edgeLimits, moveEdge, nudgeEdge, readPoints } from '../../time-clips';
import { EdgeRow, type EdgeStep } from './EdgeRow';
import { Filmstrip } from './Filmstrip';
import { LengthBand } from './LengthBand';

interface BoundaryEditorProps {
  clip: ReviewClip;
  clipSeconds: ClipSeconds;
  videoSeconds: number;
  onDrag: (points: ClipPoints) => void;
  onMove: (points: ClipPoints) => void;
}

export function BoundaryEditor({ clip, clipSeconds, videoSeconds, onDrag, onMove }: BoundaryEditorProps) {
  const points = readPoints(clip);
  const limits = { reach: clip.sentences, videoSeconds };
  const range = clipRange(points, clip.sentences);
  const step = ({ edge, kind, step: by }: EdgeStep) => {
    onMove(kind === 'move-edge' ? moveEdge(points, edge, by) : nudgeEdge(points, edge, by));
  };
  return (
    <div className="group-section">
      <h2 className="list-header">In and Out Points</h2>
      <div className="group group--padded">
        <div id="trim-band">
          <LengthBand seconds={range.duration} limits={clipSeconds} />
        </div>
        <Filmstrip frames={clip.frames} range={range} points={points} limits={limits} onDrag={onDrag} onDrop={onMove} />
        <div id="trim-edges">
          <EdgeRow edge="start" seconds={range.start} limits={edgeLimits('start', points, limits)} onStep={step} />
          <EdgeRow edge="end" seconds={range.end} limits={edgeLimits('end', points, limits)} onStep={step} />
        </div>
      </div>
      <p className="list-footer">Drag a handle to move the cut to another sentence, or step it below.</p>
    </div>
  );
}
