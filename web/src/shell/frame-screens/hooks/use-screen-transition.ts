'use client';

import { useCallback, useRef, useState } from 'react';

import { type ScreenPlace, type ScreenTransition, describeTransition } from '../lib/describe-transition';

const SCREEN_ID = 'screen';

export interface ScreenEntry {
  enter: ScreenTransition;
  announceScreen: (screen: ScreenPlace) => void;
}

export function useScreenTransition(): ScreenEntry {
  const [enter, setEnter] = useState<ScreenTransition>('none');
  const previousScreen = useRef<ScreenPlace | null>(null);

  const announceScreen = useCallback((screen: ScreenPlace) => {
    const transition = describeTransition(previousScreen.current, screen);
    previousScreen.current = screen;
    setEnter(transition);
    if (transition !== 'none') focusScreenIfFocusWasLost();
  }, []);

  return { enter, announceScreen };
}

function focusScreenIfFocusWasLost(): void {
  if (document.activeElement === document.body) {
    document.getElementById(SCREEN_ID)?.focus({ preventScroll: true });
  }
}
