export type ClipLength = 'short' | 'standard' | 'long';

export interface ClipLengthOption {
  value: ClipLength;
  label: string;
  hint: string;
}

export const CLIP_LENGTHS: readonly ClipLengthOption[] = [
  { value: 'short', label: '15–30 s', hint: 'One line or one reaction. Easiest to watch to the end.' },
  { value: 'standard', label: '25–60 s', hint: 'One point with its setup and payoff.' },
  { value: 'long', label: '60–180 s', hint: 'A full story or argument. Long enough for TikTok payouts.' },
];
