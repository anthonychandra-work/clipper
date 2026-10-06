export type Decision = 'undecided' | 'keep' | 'reject';

export type RejectReason = 'cut-off' | 'not-interesting' | 'needs-context' | 'repeat';

export type CaptionStyle = 'keyword' | 'word-by-word' | 'plain';

export type Framing = 'follow-speaker' | 'stack-two' | 'whole-frame';

export type HookType = 'number' | 'story' | 'list' | 'hot-take' | 'confession' | 'contrarian' | 'none';

export type ClipFlag = 'needs-context' | 'not-recommended';

export type ClipEdge = 'start' | 'end';

export interface Look {
  captionStyle: CaptionStyle;
  framing: Framing;
  showHookTitle: boolean;
  showSafeZones: boolean;
}

export interface LengthBand {
  min: number;
  max: number;
}

export interface ClipSeconds extends LengthBand {
  preferred: LengthBand | null;
}

export interface ReviewWindow {
  id: string;
  startSeconds: number;
  endSeconds: number;
  score: number;
  isShortlisted: boolean;
}

export interface ReviewSentence {
  number: number;
  startSeconds: number;
  endSeconds: number;
  text: string;
}

export interface CaptionWord {
  text: string;
  isHighlighted: boolean;
}

export interface Caption {
  startSeconds: number;
  words: CaptionWord[];
}

export interface ClipCaptions {
  keyword: Caption[];
  wordByWord: Caption[];
  plain: Caption[];
}

export interface Subscores {
  hook: number;
  arc: number;
  value: number;
  share: number;
}

export interface ClipPoints {
  startSentence: number;
  startNudge: number;
  endSentence: number;
  endNudge: number;
}

export interface ReviewClip extends ClipPoints {
  id: string;
  rank: number;
  startSeconds: number;
  endSeconds: number;
  scores: Subscores;
  total: number;
  reason: string;
  title: string;
  hookTitle: string;
  hookType: HookType;
  flag: ClipFlag | null;
  flagNote: string | null;
  isReplayPeak: boolean;
  decision: Decision;
  rejectReason: RejectReason | null;
  cutStartSentence: number;
  cutEndSentence: number;
  sentences: ReviewSentence[];
  captions: ClipCaptions;
  frames: (string | null)[];
}

export interface Review {
  look: Look;
  hasPreview: boolean;
  clipSeconds: ClipSeconds;
  windows: ReviewWindow[];
  clips: ReviewClip[];
}

export interface ClipChange extends Partial<ClipPoints> {
  decision?: Decision;
  rejectReason?: RejectReason | null;
  title?: string;
}
