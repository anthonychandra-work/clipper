import { afterEach, describe, expect, it, vi } from 'vitest';

import { RequestFailed, ServiceUnreachable, requestJson } from './request-json';

function answerWith(body: string, status: number) {
  const fetchStub = vi.fn(async () => new Response(body === '' ? null : body, { status }));
  vi.stubGlobal('fetch', fetchStub);
  return fetchStub;
}

async function refusalOf(request: Promise<unknown>): Promise<RequestFailed> {
  const outcome = await request.then(
    () => null,
    (error: unknown) => error,
  );
  if (outcome instanceof RequestFailed) return outcome;
  throw new Error('The request was not refused by the service.');
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('requestJson', () => {
  it('asks under the /api prefix and returns the parsed answer', async () => {
    const fetchStub = answerWith('{"status":"ok"}', 200);

    const answer = await requestJson<{ status: string }>('/health');

    expect(answer).toEqual({ status: 'ok' });
    expect(fetchStub).toHaveBeenCalledWith('/api/health', expect.objectContaining({ method: 'GET' }));
  });

  it('sends a JSON body with its content type', async () => {
    const fetchStub = answerWith('{"id":"p1"}', 201);

    await requestJson('/projects', { method: 'POST', json: { title: 'Talk' } });

    expect(fetchStub).toHaveBeenCalledWith('/api/projects', {
      method: 'POST',
      signal: undefined,
      headers: { 'Content-Type': 'application/json' },
      body: '{"title":"Talk"}',
    });
  });

  it('sends a raw body untouched', async () => {
    const fetchStub = answerWith('{"receivedBytes":3}', 200);
    const part = new Blob(['abc']);

    await requestJson('/projects/p1/upload?offset=0', { method: 'PUT', body: part });

    expect(fetchStub).toHaveBeenCalledWith(
      '/api/projects/p1/upload?offset=0',
      expect.objectContaining({ method: 'PUT', body: part }),
    );
  });

  it('returns null for an empty answer', async () => {
    answerWith('', 204);

    await expect(requestJson('/projects/p1', { method: 'DELETE' })).resolves.toBeNull();
  });

  it('throws the status and the body when the service refuses', async () => {
    answerWith('{"problem":{"section":"source","message":"Choose a video file first."}}', 422);

    const refusal = await refusalOf(requestJson('/projects', { method: 'POST', json: {} }));

    expect(refusal.status).toBe(422);
    expect(refusal.body).toEqual({ problem: { section: 'source', message: 'Choose a video file first.' } });
  });

  it('keeps an answer that is not JSON as text', async () => {
    answerWith('Internal Server Error', 500);

    const refusal = await refusalOf(requestJson('/projects'));

    expect(refusal.body).toBe('Internal Server Error');
  });

  it('reports an unreachable service by name', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));

    await expect(requestJson('/health')).rejects.toBeInstanceOf(ServiceUnreachable);
  });

  it('lets a cancelled request end as cancelled', async () => {
    const cancelled = new AbortController();
    cancelled.abort();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError')));

    await expect(requestJson('/health', { signal: cancelled.signal })).rejects.toHaveProperty('name', 'AbortError');
  });
});
