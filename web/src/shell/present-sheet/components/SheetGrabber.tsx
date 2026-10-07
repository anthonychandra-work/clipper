'use client';

import { useShell } from '../../frame-screens';
import { useSheetDrag } from '../hooks/use-sheet-drag';
import { useDismissSheet } from './Sheet';

export function SheetGrabber() {
  const { sheetElement } = useShell();
  const drag = useSheetDrag(sheetElement, useDismissSheet());
  return (
    <div className="sheet__grabber" aria-hidden="true" {...drag}>
      <span />
    </div>
  );
}
