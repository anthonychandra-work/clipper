import { createReview, rankClips } from './clip-review.js';
import { createPlayback } from './clip-preview/index.js';
import { exportActions } from './export/index.js';
import { tabActions } from './render-project.js';
import { resultsInputs } from './render-results.js';
import { reviewActions, reviewInputs } from './review/index.js';
import { sampleClips } from './sample-clips.js';

export { REJECT_REASONS, renderRejectMenu } from './clip-inspector/index.js';
export { paintPlayhead, paintPreviewDock } from './clip-preview/index.js';
export { trimDrags as projectDrags } from './clip-trim/index.js';
export { renderProjectScreen } from './render-project.js';

export const projectActions = {
  ...tabActions,
  ...reviewActions,
  ...exportActions,
};

export const projectInputs = {
  ...reviewInputs,
  ...resultsInputs,
};

export function createProjectState() {
  const clips = rankClips(sampleClips);
  return {
    clips,
    reviews: Object.fromEntries(clips.map((clip) => [clip.id, createReview(clip)])),
    selectedClipId: clips[0].id,
    isDetailOpen: false,
    filter: 'all',
    tab: 'review',
    look: { captions: 'keyword', layout: 'follow', showHookTitle: true, showSafeZones: false },
    playback: createPlayback(),
    renderJobs: {},
  };
}
