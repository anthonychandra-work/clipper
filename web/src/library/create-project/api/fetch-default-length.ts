import { requestJson } from '@/shared/lib/request-json';

import type { ClipLength } from '../lib/clip-lengths';

export async function fetchDefaultLength(): Promise<ClipLength | null> {
  try {
    const settings = await requestJson<{ defaultLength: ClipLength }>('/settings');
    return settings.defaultLength;
  } catch {
    // The sheet keeps the length it opened with when Settings cannot be read.
    return null;
  }
}
