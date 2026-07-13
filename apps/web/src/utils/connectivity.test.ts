import { afterEach, describe, expect, it, vi } from 'vitest';

import { isReachable } from './connectivity';

vi.mock('../config/env', () => ({
  default: { API_BASE_URL: 'https://api.test' },
}));

describe('isReachable', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns false when navigator reports offline', async () => {
    vi.stubGlobal('navigator', { onLine: false });
    await expect(isReachable()).resolves.toBe(false);
  });

  it('returns true when health check succeeds', async () => {
    vi.stubGlobal('navigator', { onLine: true });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('ok', { status: 200 })));

    await expect(isReachable()).resolves.toBe(true);
  });

  it('returns false when health check fails', async () => {
    vi.stubGlobal('navigator', { onLine: true });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(isReachable()).resolves.toBe(false);
  });
});
