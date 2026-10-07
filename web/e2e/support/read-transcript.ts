import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const TALK_SCRIPT = resolve(import.meta.dirname, '..', '..', '..', 'fixtures', 'talk-script.txt');
const TRANSCRIPT_NAME = 'transcript.json';

export interface StoredWord {
  text: string;
  start: number;
  end: number;
}

export interface StoredTranscript {
  language: string;
  model: string;
  words: StoredWord[];
}

export function readTranscript(dataDir: string, projectId: string): StoredTranscript {
  return JSON.parse(readFileSync(join(dataDir, 'projects', projectId, TRANSCRIPT_NAME), 'utf8'));
}

export function countWordsWrongInHundred(transcript: StoredTranscript): number {
  const spoken = splitWords(readFileSync(TALK_SCRIPT, 'utf8'));
  const heard = splitWords(transcript.words.map((word) => word.text).join(''));
  return (100 * countWrongWords(heard, spoken)) / spoken.length;
}

function splitWords(text: string): string[] {
  return text.toLowerCase().replaceAll('’', "'").match(/[a-z0-9']+/g) ?? [];
}

function countWrongWords(heard: string[], spoken: string[]): number {
  let row = Array.from({ length: heard.length + 1 }, (_, index) => index);
  spoken.forEach((spokenWord, count) => {
    const below = [count + 1];
    heard.forEach((heardWord, at) => {
      const swapped = row[at] + (spokenWord === heardWord ? 0 : 1);
      below.push(Math.min(row[at + 1] + 1, below[at] + 1, swapped));
    });
    row = below;
  });
  return row[heard.length];
}
