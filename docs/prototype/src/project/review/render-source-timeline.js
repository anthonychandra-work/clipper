import { formatTimecode } from '../../format-timecode.js';
import { rankOf, totalScore } from '../clip-review.js';
import { clipRange } from '../clip-timing.js';
import { SOURCE_DURATION_SECONDS } from '../sample-clips.js';

const WINDOW_SECONDS = 90;
const SHORTLIST_SCORE = 70;
const AXIS_STEPS = 4;
const DECISION_WORDS = { undecided: 'not decided', keep: 'kept', reject: 'rejected' };

export function renderSourceTimeline(state) {
  const bars = scoreWindows(state.clips).map(renderWindowBar).join('');
  const pins = sortByStart(state).map((clip, index) => renderPin(clip, index, state)).join('');
  return `
    <section class="group-section" aria-label="Where the clips sit in the source video">
      <h2 class="list-header">Source Video</h2>
      <div class="group timeline__card">
        <div class="timeline__bars" aria-hidden="true">${bars}</div>
        <div class="timeline__pins">${pins}</div>
        <div class="timeline__axis numeric" aria-hidden="true">${renderAxis()}</div>
      </div>
      <p class="list-footer">
        Each bar is a 90-second window of the transcript. Highlighted bars scored ${SHORTLIST_SCORE} or more
        and were searched for clips. Numbers are the clips, by rank.
      </p>
    </section>`;
}

function scoreWindows(clips) {
  const windowCount = Math.ceil(SOURCE_DURATION_SECONDS / WINDOW_SECONDS);
  return Array.from({ length: windowCount }, (_, index) => scoreWindow(index, clips));
}

function scoreWindow(index, clips) {
  const start = index * WINDOW_SECONDS;
  const inside = clips.filter((clip) => {
    const offset = clip.sourceStartSeconds - start;
    return offset >= 0 && offset < WINDOW_SECONDS;
  });
  return inside.length > 0 ? Math.max(...inside.map(totalScore)) : fillerScore(index);
}

function fillerScore(index) {
  return 12 + ((index * 37) % 29);
}

function renderWindowBar(score) {
  const shortlisted = score >= SHORTLIST_SCORE ? ' is-shortlisted' : '';
  return `<span class="timeline__bar${shortlisted}" style="height:${score}%"></span>`;
}

function sortByStart(state) {
  return [...state.clips].sort((first, second) => first.sourceStartSeconds - second.sourceStartSeconds);
}

function renderPin(clip, index, state) {
  const review = state.reviews[clip.id];
  const range = clipRange(clip, review);
  const middle = ((range.start + range.duration / 2) / SOURCE_DURATION_SECONDS) * 100;
  const rank = rankOf(clip, state.clips);
  const classes = [
    'timeline__pin',
    `timeline__pin--${review.decision}`,
    index % 2 === 1 ? 'timeline__pin--low' : '',
    clip.id === state.selectedClipId ? 'is-selected' : '',
  ].join(' ');
  return `
    <button type="button" class="${classes}" id="pin-${clip.id}" style="left:${middle.toFixed(2)}%"
      data-action="select-clip" data-clip-id="${clip.id}"
      aria-label="Clip ranked ${rank}, at ${formatTimecode(range.start)}, ${DECISION_WORDS[review.decision]}">${rank}</button>`;
}

function renderAxis() {
  return Array.from({ length: AXIS_STEPS + 1 }, (_, step) => {
    const seconds = (SOURCE_DURATION_SECONDS / AXIS_STEPS) * step;
    return `<span>${formatTimecode(seconds)}</span>`;
  }).join('');
}
