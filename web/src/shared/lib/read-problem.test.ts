import { describe, expect, it } from 'vitest';

import { readProblem } from './read-problem';
import { RequestFailed, ServiceUnreachable } from './request-json';

const NO_ANSWER = 'Clipper did not answer. Check that it is still running, then try again.';

describe('readProblem', () => {
  it('reads the section and the message the service refused with', () => {
    const refusal = new RequestFailed(422, {
      problem: { section: 'source', message: 'Choose a video file first.' },
    });

    expect(readProblem(refusal)).toEqual({ section: 'source', message: 'Choose a video file first.' });
  });

  it('reads a problem that belongs to no section', () => {
    const refusal = new RequestFailed(409, {
      problem: { section: null, message: 'This project is not being processed, so there is nothing to stop.' },
    });

    expect(readProblem(refusal).section).toBeNull();
  });

  it.each([
    ['an answer without a problem', new RequestFailed(500, 'Internal Server Error')],
    ['a problem without a message', new RequestFailed(422, { problem: { section: 'source' } })],
    ['a tool that does not answer', new ServiceUnreachable(new TypeError('fetch failed'))],
    ['an error of another kind', new Error('unexpected')],
  ])('says the tool did not answer for %s', (_case, error) => {
    expect(readProblem(error)).toEqual({ section: null, message: NO_ANSWER });
  });
});
