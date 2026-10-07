'use client';

import { useState } from 'react';

interface AddressTrail {
  current: string;
  previous: string | null;
}

export function usePreviousAddress(pathname: string): string | null {
  const [trail, setTrail] = useState<AddressTrail>({ current: pathname, previous: null });
  if (trail.current === pathname) return trail.previous;
  setTrail({ current: pathname, previous: trail.current });
  return trail.current;
}
