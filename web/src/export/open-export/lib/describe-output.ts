import type { CaptionStyle, ExportClip, ExportLook, Framing } from '../../export.types';

const CAPTION_WORDS: Record<CaptionStyle, string> = {
  keyword: 'Keyword',
  'word-by-word': 'Each Word',
  plain: 'Plain',
};

const FRAMING_WORDS: Record<Framing, string> = {
  'follow-speaker': 'speaker',
  'stack-two': 'stacked',
  'whole-frame': 'full frame',
};

export const FORMAT_LINE = '1080 × 1920, 30 fps, H.264 MP4';

export function describeLook(look: ExportLook): string {
  const hookTitle = look.showHookTitle ? 'on' : 'off';
  return `${CAPTION_WORDS[look.captionStyle]} captions, ${FRAMING_WORDS[look.framing]} framing, hook title ${hookTitle}`;
}

export function describeFile(clip: ExportClip): string {
  return `${clip.file} · ${clip.seconds.toFixed(1)} s`;
}
