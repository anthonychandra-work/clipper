export type CaptionStyle = 'keyword' | 'word-by-word' | 'plain';

export type Framing = 'follow-speaker' | 'stack-two' | 'whole-frame';

export type Platform = 'tiktok' | 'reels' | 'shorts';

export type RenderState = 'none' | 'waiting' | 'rendering' | 'done' | 'failed';

export interface ExportLook {
  captionStyle: CaptionStyle;
  framing: Framing;
  showHookTitle: boolean;
}

export interface ClipRender {
  state: RenderState;
  percent: number;
  reason: string | null;
}

export interface PlatformText {
  platform: Platform;
  title: string;
  description: string;
}

export interface ExportClip {
  id: string;
  rank: number;
  title: string;
  seconds: number;
  file: string;
  render: ClipRender;
  download: string | null;
  texts: PlatformText[];
}

export interface ProjectExport {
  look: ExportLook;
  hasSource: boolean;
  platforms: Platform[];
  clips: ExportClip[];
}
