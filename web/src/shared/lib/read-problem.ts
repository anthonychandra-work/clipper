import { RequestFailed } from './request-json';

export interface Problem {
  section: string | null;
  message: string;
}

const NO_ANSWER: Problem = {
  section: null,
  message: 'Clipper did not answer. Check that it is still running, then try again.',
};

export function readProblem(error: unknown): Problem {
  if (error instanceof RequestFailed && carriesProblem(error.body)) return error.body.problem;
  return NO_ANSWER;
}

function carriesProblem(body: unknown): body is { problem: Problem } {
  if (typeof body !== 'object' || body === null || !('problem' in body)) return false;
  const problem = body.problem;
  return typeof problem === 'object' && problem !== null && 'message' in problem && typeof problem.message === 'string';
}
