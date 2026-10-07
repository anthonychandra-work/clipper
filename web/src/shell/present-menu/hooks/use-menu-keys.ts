'use client';

import { useEffect } from 'react';

const FOCUS_STEPS: Record<string, number> = { ArrowDown: 1, ArrowUp: -1 };
const CLOSING_KEYS = ['Escape', 'Tab'];
const CHOICES = '[role^="menuitem"]';

export function useMenuKeys(layer: HTMLElement | null, anchorId: string, onClose: () => void): void {
  useEffect(() => {
    if (layer === null) return undefined;
    const handleKey = (event: KeyboardEvent) => {
      if (CLOSING_KEYS.includes(event.key)) onClose();
      else moveFocus(layer, event);
    };
    const closeOnOutsideClick = (event: MouseEvent) => {
      const isInside = event.target instanceof Node && layer.contains(event.target);
      const isOnAnchor = event.target instanceof Element && event.target.closest(`#${anchorId}`) !== null;
      if (!isInside && !isOnAnchor) onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('click', closeOnOutsideClick);
    window.addEventListener('resize', onClose);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('click', closeOnOutsideClick);
      window.removeEventListener('resize', onClose);
    };
  }, [layer, anchorId, onClose]);
}

function moveFocus(layer: HTMLElement, event: KeyboardEvent): void {
  const step = FOCUS_STEPS[event.key];
  if (step === undefined) return;
  event.preventDefault();
  const choices = Array.from(layer.querySelectorAll<HTMLElement>(CHOICES));
  const current = choices.findIndex((choice) => choice === document.activeElement);
  choices[(current + step + choices.length) % choices.length]?.focus();
}
