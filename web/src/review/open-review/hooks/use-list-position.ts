'use client';

import { useLayoutEffect, useRef } from 'react';

export function useListPosition(isPhone: boolean, shownClipId: string | null): void {
  const listTop = useRef(0);
  const hasLeftList = useRef(false);

  useLayoutEffect(() => {
    if (!isPhone) return undefined;
    if (shownClipId !== null) {
      hasLeftList.current = true;
      window.scrollTo(0, 0);
      return undefined;
    }
    if (hasLeftList.current) window.scrollTo(0, listTop.current);
    hasLeftList.current = false;
    const keepPosition = () => {
      listTop.current = window.scrollY;
    };
    window.addEventListener('scroll', keepPosition, { passive: true });
    return () => window.removeEventListener('scroll', keepPosition);
  }, [isPhone, shownClipId]);
}
