'use client';

import { useCallback, useEffect, useRef } from 'react';

const EXIT_MS = 180;
const CLOSING_CLASS = 'is-closing';

export interface ModalDialog {
  element: HTMLDialogElement | null;
  readOpenerId: () => string | null;
}

export function useModalDialog({ element, readOpenerId }: ModalDialog, onDismiss: () => void): () => void {
  const latestOnDismiss = useRef(onDismiss);

  useEffect(() => {
    latestOnDismiss.current = onDismiss;
  }, [onDismiss]);

  const dismiss = useCallback(() => {
    if (element === null || element.classList.contains(CLOSING_CLASS)) return;
    element.classList.add(CLOSING_CLASS);
    window.setTimeout(() => latestOnDismiss.current(), EXIT_MS);
  }, [element]);

  useEffect(() => {
    if (element === null) return undefined;
    const openerId = readOpenerId();
    const dismissOnEscape = (event: Event) => {
      event.preventDefault();
      dismiss();
    };
    const dismissOnOutsideClick = (event: MouseEvent) => {
      if (event.target === element) dismiss();
    };
    element.classList.remove(CLOSING_CLASS);
    element.showModal();
    element.addEventListener('cancel', dismissOnEscape);
    element.addEventListener('click', dismissOnOutsideClick);
    return () => {
      element.removeEventListener('cancel', dismissOnEscape);
      element.removeEventListener('click', dismissOnOutsideClick);
      closeDialog(element, openerId);
    };
  }, [element, readOpenerId, dismiss]);

  return dismiss;
}

function closeDialog(dialog: HTMLDialogElement, openerId: string | null): void {
  dialog.classList.remove(CLOSING_CLASS);
  dialog.removeAttribute('style');
  dialog.close();
  if (openerId !== null) document.getElementById(openerId)?.focus();
}
