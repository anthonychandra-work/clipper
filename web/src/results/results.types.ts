export interface ResultClip {
  id: string;
  rank: number;
  title: string;
  views: number | null;
}

export interface ProjectResults {
  clips: ResultClip[];
}
