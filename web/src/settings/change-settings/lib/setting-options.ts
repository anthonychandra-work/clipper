import { CLIP_LENGTHS } from '@/library';

export interface SettingOption {
  value: string;
  label: string;
}

export interface SettingField {
  label: string;
  options: readonly SettingOption[];
}

export interface Choices {
  scoringModel: string;
  cuttingModel: string;
  whisperModel: string;
  defaultLength: string;
  clipsPerVideo: string;
  sourceRetention: string;
}

export interface Settings extends Choices {
  freeDiskGb: number;
  totalDiskGb: number;
  phoneAddress: string;
}

export type ChoiceName = keyof Choices;

const CLAUDE_MODELS: readonly SettingOption[] = [
  { value: 'claude-fable-5-1', label: 'Claude Fable 5.1' },
  { value: 'claude-opus-5-5', label: 'Claude Opus 5.5' },
  { value: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5' },
  { value: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
];

const WHISPER_MODELS: readonly SettingOption[] = [
  { value: 'large-v3-turbo', label: 'Whisper large-v3-turbo' },
  { value: 'medium', label: 'Whisper medium' },
  { value: 'small', label: 'Whisper small' },
];

const CLIP_COUNTS: readonly SettingOption[] = [
  { value: 'auto', label: 'Auto' },
  { value: '4', label: '4' },
  { value: '8', label: '8' },
  { value: '12', label: '12' },
];

const RETENTIONS: readonly SettingOption[] = [
  { value: '3', label: '3 days' },
  { value: '7', label: '7 days' },
  { value: '30', label: '30 days' },
  { value: 'never', label: 'Never' },
];

export const SETTING_FIELDS: Record<ChoiceName, SettingField> = {
  scoringModel: { label: 'Scoring Model', options: CLAUDE_MODELS },
  cuttingModel: { label: 'Cutting Model', options: CLAUDE_MODELS },
  whisperModel: { label: 'Transcription Model', options: WHISPER_MODELS },
  defaultLength: { label: 'Clip Length', options: CLIP_LENGTHS.map(({ value, label }) => ({ value, label })) },
  clipsPerVideo: { label: 'Clips per Video', options: CLIP_COUNTS },
  sourceRetention: { label: 'Delete Source Videos After', options: RETENTIONS },
};

export const REJECT_REASONS: readonly SettingOption[] = [
  { value: 'cut-off', label: 'Cut Off Mid-Thought' },
  { value: 'dull', label: 'Not Interesting' },
  { value: 'context', label: 'Needs Earlier Context' },
  { value: 'repeat', label: 'Repeats Another Clip' },
];

export function describeDiskUse(settings: Settings): number {
  if (settings.totalDiskGb <= 0) return 0;
  return ((settings.totalDiskGb - settings.freeDiskGb) / settings.totalDiskGb) * 100;
}
