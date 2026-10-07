import type { SegmentedOption } from '@/shared/ui';

import type { CaptionStyle, Framing, Look } from '../../review.types';

export type LookSwitch = 'showHookTitle' | 'showSafeZones';

export const CAPTION_STYLES: readonly SegmentedOption<CaptionStyle>[] = [
  { value: 'keyword', label: 'Keyword' },
  { value: 'word-by-word', label: 'Each Word' },
  { value: 'plain', label: 'Plain' },
];

export const FRAMINGS: readonly SegmentedOption<Framing>[] = [
  { value: 'follow-speaker', label: 'Speaker' },
  { value: 'stack-two', label: 'Stacked' },
  { value: 'whole-frame', label: 'Full Frame' },
];

export const LOOK_SWITCHES: readonly { option: LookSwitch; label: string }[] = [
  { option: 'showHookTitle', label: 'Hook Title' },
  { option: 'showSafeZones', label: 'Platform Safe Zones' },
];

export function flipSwitch(look: Look, option: LookSwitch): Look {
  return { ...look, [option]: !look[option] };
}
