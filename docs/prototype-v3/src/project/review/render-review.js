import { isCompact } from '../../read-layout.js';
import { rankOf, selectedClip } from '../clip-review.js';
import { renderClipInspector, renderDecisionControls } from '../clip-inspector/index.js';
import { renderClipPreview } from '../clip-preview/index.js';
import { renderCandidateList } from './render-candidate-list.js';
import { renderSourceTimeline } from './render-source-timeline.js';

export function renderReview(state) {
  const isClipPushed = isCompact() && state.isDetailOpen;
  const decision = renderDecisionControls(state);
  return {
    ...(isClipPushed ? describePushedClip(state) : {}),
    actions: isCompact() ? '' : decision,
    bottomBar: isClipPushed ? decision : '',
    body: renderSplitView(state),
  };
}

function describePushedClip(state) {
  const rank = rankOf(selectedClip(state), state.clips);
  return {
    key: 'clip',
    depth: 2,
    title: `Clip ${rank} of ${state.clips.length}`,
    subtitle: '',
    hasLargeTitle: false,
    centre: '',
    back: { label: 'Clips', action: 'close-detail' },
  };
}

function renderSplitView(state) {
  return `
    <div class="split${state.isDetailOpen ? ' is-detail-open' : ''}">
      <div class="pane pane--list" data-keep-scroll="clips">${renderListPane(state)}</div>
      <div class="pane pane--detail" id="clip-detail" data-keep-scroll="clip-${state.selectedClipId}">
        <div class="detail">
          ${renderClipPreview(state)}
          ${renderClipInspector(state)}
        </div>
      </div>
    </div>`;
}

function renderListPane(state) {
  const sections = [renderSourceTimeline(state), renderCandidateList(state)];
  return (isCompact() ? sections.reverse() : sections).join('');
}
