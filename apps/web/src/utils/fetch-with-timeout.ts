export class ApiTimeoutError extends Error {
  constructor(message = 'Request timed out') {
    super(message);
    this.name = 'ApiTimeoutError';
  }
}

export class ApiAbortError extends Error {
  constructor(message = 'Request aborted') {
    super(message);
    this.name = 'ApiAbortError';
  }
}

export interface FetchWithTimeoutOptions {
  timeoutMs?: number;
  signal?: AbortSignal;
}

const DEFAULT_TIMEOUT_MS = 20_000;

function linkAbortSignals(controller: AbortController, externalSignal?: AbortSignal): void {
  if (!externalSignal) return;
  if (externalSignal.aborted) {
    controller.abort();
    return;
  }
  externalSignal.addEventListener('abort', () => controller.abort(), { once: true });
}

/**
 * fetch wrapper with timeout and optional external abort signal.
 */
export async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
  options: FetchWithTimeoutOptions = {},
): Promise<Response> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  linkAbortSignals(controller, options.signal);

  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      if (options.signal?.aborted) {
        throw new ApiAbortError();
      }
      throw new ApiTimeoutError();
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
