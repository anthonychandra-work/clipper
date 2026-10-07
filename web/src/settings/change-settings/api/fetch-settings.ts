import { requestJson } from '@/shared/lib/request-json';

import type { Settings } from '../lib/setting-options';

export function fetchSettings(): Promise<Settings> {
  return requestJson<Settings>('/settings');
}
