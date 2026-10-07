'use client';

import { useEffect, useState } from 'react';

export function useElementWidth(element: HTMLElement | null): number | null {
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    if (element === null) return undefined;
    const observer = new ResizeObserver((entries) => {
      setWidth(entries[entries.length - 1].contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return width;
}
