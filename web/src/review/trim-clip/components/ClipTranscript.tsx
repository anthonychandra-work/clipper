import type { ClipPoints, ReviewSentence } from '../../review.types';

interface ClipTranscriptProps {
  reach: readonly ReviewSentence[];
  points: ClipPoints;
}

export function ClipTranscript({ reach, points }: ClipTranscriptProps) {
  return (
    <div className="group-section">
      <h2 className="list-header">Transcript</h2>
      <ol className="group divided" id="trim-transcript">
        {reach.map((sentence) => (
          <li key={sentence.number} className={`transcript__line transcript__line--${placeLine(sentence, points)}`}>
            <span className="transcript__edge">{nameEdge(sentence, points)}</span>
            <span>{sentence.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function placeLine(sentence: ReviewSentence, points: ClipPoints): 'in' | 'out' {
  const isIncluded = sentence.number >= points.startSentence && sentence.number <= points.endSentence;
  return isIncluded ? 'in' : 'out';
}

function nameEdge(sentence: ReviewSentence, points: ClipPoints): string {
  if (sentence.number === points.startSentence) return 'In';
  return sentence.number === points.endSentence ? 'Out' : '';
}
