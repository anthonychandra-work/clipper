const WORDS_PER_SECOND = 2.7;
const SENTENCE_GAP_SECONDS = 0.3;
const SENTENCE_ROLES = ['before', 'core', 'after'];

export const DURATION_BAND = { min: 15, idealMin: 25, idealMax: 50, max: 60 };

export function layOutSentences(clip) {
  let cursor = clip.sourceStartSeconds;
  return labelSentences(clip).map((labelled) => {
    const timed = timeSentence(labelled, cursor);
    cursor = timed.end + SENTENCE_GAP_SECONDS;
    return timed;
  });
}

function labelSentences(clip) {
  return SENTENCE_ROLES.flatMap((role) => clip[role].map((text) => ({ text, role })));
}

function timeSentence(labelled, start) {
  const secondsPerWord = 1 / WORDS_PER_SECOND;
  const words = labelled.text.split(' ').map((text, index) => ({
    text,
    start: start + index * secondsPerWord,
    end: start + (index + 1) * secondsPerWord,
  }));
  return { ...labelled, words, start, end: words[words.length - 1].end };
}

export function clipRange(clip, review) {
  const sentences = layOutSentences(clip);
  const start = sentences[review.startIndex].start + review.startNudge;
  const end = sentences[review.endIndex].end + review.endNudge;
  return { start, end, duration: end - start };
}

export function spokenWords(clip, review) {
  const { start } = clipRange(clip, review);
  return layOutSentences(clip)
    .slice(review.startIndex, review.endIndex + 1)
    .flatMap((sentence) => sentence.words.map((word, index) => ({
      text: word.text,
      start: word.start - start,
      end: word.end - start,
      endsSentence: index === sentence.words.length - 1,
    })));
}

export function rateDuration(duration) {
  if (duration < DURATION_BAND.min) return 'short';
  if (duration > DURATION_BAND.max) return 'long';
  const isIdeal = duration >= DURATION_BAND.idealMin && duration <= DURATION_BAND.idealMax;
  return isIdeal ? 'ideal' : 'allowed';
}
