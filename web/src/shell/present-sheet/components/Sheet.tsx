'use client';

import { type ReactNode, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';

import { useShell } from '../../frame-screens';
import { useModalDialog } from '../hooks/use-modal-dialog';

interface SheetProps {
  onDismiss: () => void;
  children: ReactNode;
}

const DismissSheetContext = createContext<(() => void) | null>(null);

export function Sheet({ onDismiss, children }: SheetProps) {
  const { sheetElement, readOpenerId } = useShell();
  const dismiss = useModalDialog({ element: sheetElement, readOpenerId }, onDismiss);
  if (sheetElement === null) return null;
  return createPortal(<DismissSheetContext value={dismiss}>{children}</DismissSheetContext>, sheetElement);
}

export function useDismissSheet(): () => void {
  const dismiss = useContext(DismissSheetContext);
  if (dismiss === null) throw new Error('This component must be rendered inside a sheet.');
  return dismiss;
}
