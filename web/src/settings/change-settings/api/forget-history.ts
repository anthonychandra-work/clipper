import { requestJson } from '@/shared/lib/request-json';

import type { Settings } from '../lib/setting-options';

export function forgetHistory(): Promise<Settings> {
  return requestJson<Settings>('/settings/history', { method: 'DELETE' });
}
