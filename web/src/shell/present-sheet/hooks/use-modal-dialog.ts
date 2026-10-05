'use client';

import { useCallback, useEffect, useRef } from 'react';

const EXIT_MS = 180;
const CLOSING_CLASS = 'is-closing';

export function useModalDialog(dialog: HTMLDialogElement | null, onDismiss: () => void): () => void {
  const latestOnDismiss = useRef(onDismiss);

  useEffect(() => {
    latestOnDismiss.current = onDismiss;
  }, [onDismiss]);

  const dismiss = useCallback(() => {
    if (dialog === null || dialog.classList.contains(CLOSING_CLASS)) return;
    dialog.classList.add(CLOSING_CLASS);
    window.setTimeout(() => latestOnDismiss.current(), EXIT_MS);
  }, [dialog]);

  useEffect(() => {
    if (dialog === null) return undefined;
    const opener = document.activeElement;
    const dismissOnEscape = (event: Event) => {
      event.preventDefault();
      dismiss();
    };
    const dismissOnOutsideClick = (event: MouseEvent) => {
      if (event.target === dialog) dismiss();
    };
    dialog.classList.remove(CLOSING_CLASS);
    dialog.showModal();
    dialog.addEventListener('cancel', dismissOnEscape);
    dialog.addEventListener('click', dismissOnOutsideClick);
    return () => {
      dialog.removeEventListener('cancel', dismissOnEscape);
      dialog.removeEventListener('click', dismissOnOutsideClick);
      closeDialog(dialog, opener);
    };
  }, [dialog, dismiss]);

  return dismiss;
}

function closeDialog(dialog: HTMLDialogElement, opener: Element | null): void {
  dialog.classList.remove(CLOSING_CLASS);
  dialog.removeAttribute('style');
  dialog.close();
  const sameControlNow = opener?.id ? document.getElementById(opener.id) : null;
  const returnTo = sameControlNow ?? opener;
  if (returnTo instanceof HTMLElement) returnTo.focus();
}
