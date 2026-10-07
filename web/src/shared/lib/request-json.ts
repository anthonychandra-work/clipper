const API_PREFIX = '/api';
const JSON_HEADERS = { 'Content-Type': 'application/json' };

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  json?: unknown;
  body?: BodyInit;
  signal?: AbortSignal;
}

export class RequestFailed extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    super(`The service answered with status ${status}.`);
    this.name = 'RequestFailed';
    this.status = status;
    this.body = body;
  }
}

export class ServiceUnreachable extends Error {
  constructor(cause: unknown) {
    super('Clipper did not answer.', { cause });
    this.name = 'ServiceUnreachable';
  }
}

export async function requestJson<Answer>(path: string, options: RequestOptions = {}): Promise<Answer> {
  const response = await send(`${API_PREFIX}${path}`, options);
  const body = await readBody(response);
  if (!response.ok) throw new RequestFailed(response.status, body);
  return body as Answer;
}

async function send(address: string, options: RequestOptions): Promise<Response> {
  try {
    return await fetch(address, describeRequest(options));
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new ServiceUnreachable(error);
  }
}

function describeRequest(options: RequestOptions): RequestInit {
  const base = { method: options.method ?? 'GET', signal: options.signal };
  if (options.json === undefined) return { ...base, body: options.body };
  return { ...base, headers: JSON_HEADERS, body: JSON.stringify(options.json) };
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text === '') return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
