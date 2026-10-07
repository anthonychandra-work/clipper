'use client';

import { type PointerEvent, useRef } from 'react';

const DISMISS_DISTANCE = 96;

export interface SheetDrag {
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
  onPointerCancel: () => void;
}

export function useSheetDrag(sheet: HTMLDialogElement | null, dismiss: () => void): SheetDrag {
  const startY = useRef<number | null>(null);

  function endDrag(distance: number): void {
    startY.current = null;
    if (sheet === null) return;
    if (distance < DISMISS_DISTANCE) {
      sheet.removeAttribute('style');
      return;
    }
    sheet.style.setProperty('--sheet-drag', `${distance}px`);
    dismiss();
  }

  return {
    onPointerDown: (event) => {
      startY.current = event.clientY;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove: (event) => {
      if (sheet === null || startY.current === null) return;
      sheet.style.setProperty('transform', `translateY(${Math.max(0, event.clientY - startY.current)}px)`);
    },
    onPointerUp: (event) => endDrag(startY.current === null ? 0 : event.clientY - startY.current),
    onPointerCancel: () => endDrag(0),
  };
}
