'use client';

import { type KeyboardEvent, type PointerEvent, useState } from 'react';

import type { ClipEdge, ClipPoints } from '../../review.types';
import { edgeLimits, moveEdge, moveEdgeTo, type TrimLimits } from '../../time-clips';
import { findNearestSentence } from '../lib/nearest-sentence';

const STRIP = '.filmstrip';
const KEY_STEPS: Record<string, -1 | 1> = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 };

export interface TrimmedClip {
  points: ClipPoints;
  limits: TrimLimits;
  onDrag: (points: ClipPoints) => void;
  onDrop: (points: ClipPoints) => void;
}

export interface HandleEvents {
  onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}

export interface TrimDrag {
  isTrimming: boolean;
  bindHandle: (edge: ClipEdge) => HandleEvents;
}

export function useTrimDrag({ points, limits, onDrag, onDrop }: TrimmedClip): TrimDrag {
  const [dragged, setDragged] = useState<{ edge: ClipEdge; hasMoved: boolean } | null>(null);

  function follow(edge: ClipEdge, event: PointerEvent<HTMLButtonElement>): void {
    const strip = event.currentTarget.closest(STRIP)?.getBoundingClientRect();
    if (dragged?.edge !== edge || strip === undefined) return;
    const share = Math.min(1, Math.max(0, (event.clientX - strip.left) / strip.width));
    const sentence = findNearestSentence({ edge, share, points }, limits);
    if (sentence === (edge === 'start' ? points.startSentence : points.endSentence)) return;
    setDragged({ edge, hasMoved: true });
    onDrag(moveEdgeTo(points, edge, sentence));
  }

  function letGo(): void {
    if (dragged?.hasMoved) onDrop(points);
    setDragged(null);
  }

  function stepWithKey(edge: ClipEdge, event: KeyboardEvent<HTMLButtonElement>): void {
    const step = KEY_STEPS[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const allowed = edgeLimits(edge, points, limits);
    if (step < 0 ? allowed.canMoveEarlier : allowed.canMoveLater) onDrop(moveEdge(points, edge, step));
  }

  const bindHandle = (edge: ClipEdge): HandleEvents => ({
    onPointerDown: (event) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragged({ edge, hasMoved: false });
    },
    onPointerMove: (event) => follow(edge, event),
    onPointerUp: letGo,
    onPointerCancel: letGo,
    onKeyDown: (event) => stepWithKey(edge, event),
  });

  return { isTrimming: dragged !== null, bindHandle };
}
