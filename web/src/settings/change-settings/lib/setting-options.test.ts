import { describe, expect, it } from 'vitest';

import {
  describeDiskUse,
  describeSavedKey,
  REJECT_REASONS,
  SETTING_FIELDS,
  type Settings,
} from './setting-options';

const DEFAULTS: Settings = {
  scoringModel: 'claude-sonnet-5-5',
  cuttingModel: 'claude-opus-5-5',
  whisperModel: 'large-v3-turbo',
  defaultLength: 'standard',
  clipsPerVideo: 'auto',
  sourceRetention: '7',
  freeDiskGb: 29,
  totalDiskGb: 460,
  phoneAddress: 'http://192.168.1.24:3000',
  hasApiKey: false,
  apiKeyEnding: null,
};

function labelsOf(name: keyof typeof SETTING_FIELDS): string[] {
  return SETTING_FIELDS[name].options.map((option) => option.label);
}

function shownDefault(name: keyof typeof SETTING_FIELDS): string | undefined {
  return SETTING_FIELDS[name].options.find((option) => option.value === DEFAULTS[name])?.label;
}

describe('the setting options', () => {
  it('offers the four Claude models for each pass, stored under their identifiers', () => {
    const models = ['Claude Fable 5.1', 'Claude Opus 5.5', 'Claude Sonnet 5.5', 'Claude Haiku 4.5'];

    expect(labelsOf('scoringModel')).toEqual(models);
    expect(labelsOf('cuttingModel')).toEqual(models);
    expect(SETTING_FIELDS.scoringModel.options.map((option) => option.value)).toEqual([
      'claude-fable-5-1',
      'claude-opus-5-5',
      'claude-sonnet-5-5',
      'claude-haiku-4-5',
    ]);
  });

  it('offers the three Whisper models', () => {
    expect(labelsOf('whisperModel')).toEqual(['Whisper large-v3-turbo', 'Whisper medium', 'Whisper small']);
  });

  it('offers the lengths, the clip counts and the retention periods of the prototype', () => {
    expect(labelsOf('defaultLength')).toEqual(['15–30 s', '25–60 s', '60–180 s']);
    expect(labelsOf('clipsPerVideo')).toEqual(['Auto', '4', '8', '12']);
    expect(labelsOf('sourceRetention')).toEqual(['3 days', '7 days', '30 days', 'Never']);
  });

  it('labels every row as the prototype does', () => {
    expect(Object.values(SETTING_FIELDS).map((field) => field.label)).toEqual([
      'Scoring Model',
      'Cutting Model',
      'Transcription Model',
      'Clip Length',
      'Clips per Video',
      'Delete Source Videos After',
    ]);
  });

  it('shows the defaults under the labels the prototype starts with', () => {
    expect(shownDefault('scoringModel')).toBe('Claude Sonnet 5.5');
    expect(shownDefault('cuttingModel')).toBe('Claude Opus 5.5');
    expect(shownDefault('whisperModel')).toBe('Whisper large-v3-turbo');
    expect(shownDefault('defaultLength')).toBe('25–60 s');
    expect(shownDefault('clipsPerVideo')).toBe('Auto');
    expect(shownDefault('sourceRetention')).toBe('7 days');
  });

  it('names the four reasons a clip can be rejected for', () => {
    expect(REJECT_REASONS.map((reason) => reason.label)).toEqual([
      'Cut Off Mid-Thought',
      'Not Interesting',
      'Needs Earlier Context',
      'Repeats Another Clip',
    ]);
  });
});

describe('describeSavedKey', () => {
  it('reads "Saved · ends in" with the last four characters of the saved key', () => {
    expect(describeSavedKey('4f2a')).toBe('Saved · ends in 4f2a');
  });

  it('reads "Saved" alone for a key too short to show an ending of', () => {
    expect(describeSavedKey(null)).toBe('Saved');
  });
});

describe('describeDiskUse', () => {
  it('gives the used share of the disk in percent', () => {
    expect(describeDiskUse(DEFAULTS)).toBeCloseTo(93.7, 1);
  });

  it('is empty for a disk whose size is not known', () => {
    expect(describeDiskUse({ ...DEFAULTS, totalDiskGb: 0 })).toBe(0);
  });
});
