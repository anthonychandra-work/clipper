'use client';

import { useCallback, useEffect, useRef } from 'react';

export function useOpenerMemory(): () => string | null {
  const lastFocusedId = useRef<string | null>(null);

  useEffect(() => {
    const remember = (event: FocusEvent) => {
      if (event.target instanceof HTMLElement && event.target.id) lastFocusedId.current = event.target.id;
    };
    document.addEventListener('focusin', remember);
    return () => document.removeEventListener('focusin', remember);
  }, []);

  return useCallback(() => {
    const focused = document.activeElement;
    const isOnAControl = focused instanceof HTMLElement && focused !== document.body;
    return isOnAControl && focused.id ? focused.id : lastFocusedId.current;
  }, []);
}
