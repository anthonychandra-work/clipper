import { escapeHtml } from '../../escape-html.js';
import { layOutSentences } from '../clip-timing.js';

export function renderTranscript(clip, review) {
  return layOutSentences(clip).map((sentence, index) => renderLine(sentence, index, review)).join('');
}

function renderLine(sentence, index, review) {
  const isIncluded = index >= review.startIndex && index <= review.endIndex;
  return `
    <li class="transcript__line transcript__line--${isIncluded ? 'in' : 'out'}">
      <span class="transcript__edge">${nameEdge(index, review)}</span>
      <span>${escapeHtml(sentence.text)}</span>
    </li>`;
}

function nameEdge(index, review) {
  if (index === review.startIndex) return 'In';
  return index === review.endIndex ? 'Out' : '';
}
