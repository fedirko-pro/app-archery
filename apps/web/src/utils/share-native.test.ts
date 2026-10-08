import { afterEach, describe, expect, it, vi } from 'vitest';

import { shareTournamentNative } from './share-native';

describe('shareTournamentNative', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns false when Web Share API is unavailable', async () => {
    vi.stubGlobal('navigator', {});
    await expect(
      shareTournamentNative({ title: 'Test', url: 'https://example.com' }),
    ).resolves.toBe(false);
  });

  it('returns true when share succeeds', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', {
      share,
      canShare: () => true,
    });

    await expect(
      shareTournamentNative({
        title: 'Test',
        description: 'See https://maps.app.goo.gl/abc',
        url: 'https://example.com',
      }),
    ).resolves.toBe(true);
    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://example.com',
        text: expect.stringMatching(/^https:\/\/example\.com\n/),
      }),
    );
    const text = share.mock.calls[0][0].text as string;
    expect(text.indexOf('https://example.com')).toBeLessThan(
      text.indexOf('https://maps.app.goo.gl/abc'),
    );
  });

  it('returns false when user cancels share (AbortError)', async () => {
    const share = vi
      .fn()
      .mockRejectedValue(Object.assign(new Error('Aborted'), { name: 'AbortError' }));
    vi.stubGlobal('navigator', {
      share,
      canShare: () => true,
    });

    await expect(
      shareTournamentNative({ title: 'Test', url: 'https://example.com' }),
    ).resolves.toBe(false);
  });

  it('returns false on other share errors', async () => {
    const share = vi.fn().mockRejectedValue(new Error('Share failed'));
    vi.stubGlobal('navigator', {
      share,
      canShare: () => true,
    });

    await expect(
      shareTournamentNative({ title: 'Test', url: 'https://example.com' }),
    ).resolves.toBe(false);
  });
});
