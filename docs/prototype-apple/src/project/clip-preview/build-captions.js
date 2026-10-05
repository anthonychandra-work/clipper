import { escapeHtml } from '../../escape-html.js';

const WORDS_PER_CHUNK = { keyword: 3, pop: 1, clean: 6 };
const KEYWORD_MIN_LETTERS = 6;
const EDGE_PUNCTUATION = /^[“"]+|[.,?!:;”"]+$/g;

export function buildCaptionChunks(words, style) {
  const chunks = [];
  let group = [];
  for (const word of words) {
    group.push(word);
    if (group.length < WORDS_PER_CHUNK[style] && !word.endsSentence) continue;
    chunks.push(toChunk(group, style));
    group = [];
  }
  return chunks;
}

export function captionAt(chunks, seconds) {
  return chunks.findLast((chunk) => seconds >= chunk.start) ?? chunks[0] ?? null;
}

function toChunk(group, style) {
  const keyword = style === 'keyword' ? pickKeyword(group) : null;
  return {
    start: group[0].start,
    html: group.map((word) => renderCaptionWord(word, keyword)).join(' '),
  };
}

function pickKeyword(group) {
  const strong = group.filter((word) => /\d/.test(word.text) || bareWord(word).length >= KEYWORD_MIN_LETTERS);
  return strong.sort((first, second) => second.text.length - first.text.length)[0] ?? null;
}

function renderCaptionWord(word, keyword) {
  const text = escapeHtml(bareWord(word));
  return word === keyword ? `<mark>${text}</mark>` : text;
}

function bareWord(word) {
  return word.text.replace(EDGE_PUNCTUATION, '');
}
