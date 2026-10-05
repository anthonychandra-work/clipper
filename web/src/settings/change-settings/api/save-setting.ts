import { requestJson } from '@/shared/lib/request-json';

import type { ChoiceName, Settings } from '../lib/setting-options';

export function saveSetting(name: ChoiceName, value: string): Promise<Settings> {
  return requestJson<Settings>('/settings', { method: 'PATCH', json: { [name]: value } });
}
