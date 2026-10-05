import { describe, expect, it } from 'vitest';

import { createDraft, type Draft } from './create-draft';
import { findDraftProblem, findInvalidFieldId } from './find-draft-problem';

const CHOSEN_FILE = new File(['video'], 'talk.mp4');

function draftWith(changes: Partial<Draft>): Draft {
  return { ...createDraft(), link: 'https://www.youtube.com/watch?v=abc123', ...changes };
}

describe('findDraftProblem', () => {
  it('finds nothing wrong with a full link and a platform', () => {
    expect(findDraftProblem(draftWith({}))).toBeNull();
  });

  it('finds nothing wrong with a chosen file and a platform', () => {
    expect(findDraftProblem(draftWith({ sourceKind: 'file', link: '', file: CHOSEN_FILE }))).toBeNull();
  });

  it.each(['', '   ', 'youtube.com/watch?v=abc123', 'https://nodots', 'not a link'])(
    'asks for the full link when it is "%s"',
    (link) => {
      expect(findDraftProblem(draftWith({ link }))).toEqual({
        section: 'source',
        message: 'Paste the full link, starting with https://',
      });
    },
  );

  it('accepts a link with spaces around it', () => {
    expect(findDraftProblem(draftWith({ link: '  http://127.0.0.1:8000/talk.mp4  ' }))).toBeNull();
  });

  it('asks for a file when none was chosen', () => {
    expect(findDraftProblem(draftWith({ sourceKind: 'file', file: null }))).toEqual({
      section: 'source',
      message: 'Choose a video file first.',
    });
  });

  it('asks for a platform when every one is off', () => {
    expect(findDraftProblem(draftWith({ platforms: [] }))).toEqual({
      section: 'platforms',
      message: 'Turn on at least one platform.',
    });
  });

  it('reports the source before the platforms when both are wrong', () => {
    expect(findDraftProblem(draftWith({ link: '', platforms: [] }))?.section).toBe('source');
  });
});

describe('findInvalidFieldId', () => {
  it('points at the link field for a problem with a link', () => {
    const problem = { section: 'source', message: 'Paste the full link, starting with https://' };

    expect(findInvalidFieldId(draftWith({ problem }))).toBe('draft-link');
  });

  it('points at the file field for a problem with a file', () => {
    const problem = { section: 'source', message: 'Choose a video file first.' };

    expect(findInvalidFieldId(draftWith({ sourceKind: 'file', problem }))).toBe('draft-file');
  });

  it('points at the first platform switch for a problem with the platforms', () => {
    const problem = { section: 'platforms', message: 'Turn on at least one platform.' };

    expect(findInvalidFieldId(draftWith({ problem }))).toBe('platform-tiktok');
  });

  it('points nowhere when the draft has no problem', () => {
    expect(findInvalidFieldId(draftWith({}))).toBeNull();
  });
});
