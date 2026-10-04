import { renderClipInspector, renderDecisionBar } from '../clip-inspector/index.js';
import { renderClipPreview } from '../clip-preview/index.js';
import { renderCandidateList } from './render-candidate-list.js';
import { renderSourceTimeline } from './render-source-timeline.js';

export function renderReview(state) {
  return `
    ${renderSourceTimeline(state)}
    <div class="workbench${state.isDetailOpen ? ' is-detail-open' : ''}">
      ${renderCandidateList(state)}
      <div class="detail" id="clip-detail">
        <button type="button" class="button button--quiet detail__back" data-action="close-detail">
          ‹ All clips
        </button>
        ${renderClipPreview(state)}
        ${renderClipInspector(state)}
      </div>
    </div>
    ${renderDecisionBar(state)}`;
}
