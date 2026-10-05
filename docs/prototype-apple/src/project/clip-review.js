export function createReview(clip) {
  return {
    startIndex: clip.before.length,
    endIndex: clip.before.length + clip.core.length - 1,
    startNudge: 0,
    endNudge: 0,
    decision: 'undecided',
    rejectReason: null,
    title: clip.title,
    views: null,
    ...clip.seed,
  };
}

export function totalScore(clip) {
  return Object.values(clip.scores).reduce((sum, part) => sum + part, 0);
}

export function rankClips(clips) {
  return [...clips].sort((first, second) => totalScore(second) - totalScore(first));
}

export function rankOf(clip, rankedClips) {
  return rankedClips.indexOf(clip) + 1;
}

export function selectedClip(state) {
  return state.clips.find((clip) => clip.id === state.selectedClipId);
}

export function visibleClips(state) {
  if (state.filter === 'all') return state.clips;
  return state.clips.filter((clip) => state.reviews[clip.id].decision === state.filter);
}

export function keptClips(state) {
  return state.clips.filter((clip) => state.reviews[clip.id].decision === 'keep');
}

export function isFlagOpen(clip, review) {
  if (!clip.flag) return false;
  if (clip.flag.kind !== 'context') return true;
  return review.startIndex >= clip.before.length;
}
