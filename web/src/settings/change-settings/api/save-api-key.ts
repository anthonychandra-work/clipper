import { requestJson } from '@/shared/lib/request-json';

import type { Settings } from '../lib/setting-options';

export function saveApiKey(apiKey: string): Promise<Settings> {
  return requestJson<Settings>('/settings/api-key', { method: 'PUT', json: { apiKey } });
}
