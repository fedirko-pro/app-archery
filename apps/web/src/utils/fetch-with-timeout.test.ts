import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiAbortError, ApiTimeoutError, fetchWithTimeout } from './fetch-with-timeout';

describe('fetchWithTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('resolves when fetch completes before timeout', async () => {
    const response = new Response('ok', { status: 200 });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));

    const promise = fetchWithTimeout('https://example.com/test');
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toBe(response);
  });

  it('rejects with ApiTimeoutError when fetch hangs', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init?: RequestInit) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => {
              reject(new DOMException('Aborted', 'AbortError'));
            });
          }),
      ),
    );

    const promise = fetchWithTimeout('https://example.com/slow', undefined, {
      timeoutMs: 1000,
    });
    const expectation = expect(promise).rejects.toBeInstanceOf(ApiTimeoutError);
    await vi.advanceTimersByTimeAsync(1000);
    await expectation;
  });

  it('rejects with ApiAbortError when external signal aborts', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init?: RequestInit) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => {
              reject(new DOMException('Aborted', 'AbortError'));
            });
          }),
      ),
    );

    const controller = new AbortController();
    const promise = fetchWithTimeout('https://example.com/test', undefined, {
      signal: controller.signal,
      timeoutMs: 10_000,
    });
    controller.abort();
    await expect(promise).rejects.toBeInstanceOf(ApiAbortError);
  });
});
