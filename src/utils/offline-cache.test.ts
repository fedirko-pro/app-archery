import { describe, expect, it } from 'vitest';

import { isNetworkError } from './offline-cache';

describe('isNetworkError', () => {
  it('returns true for TypeError with "Failed to fetch"', () => {
    expect(isNetworkError(new TypeError('Failed to fetch'))).toBe(true);
  });

  it('returns true for TypeError with "Load failed"', () => {
    expect(isNetworkError(new TypeError('Load failed'))).toBe(true);
  });

  it('returns true for TypeError with "NetworkError"', () => {
    expect(isNetworkError(new TypeError('NetworkError'))).toBe(true);
  });

  it('returns true for Error with "network" in message (lowercase)', () => {
    expect(isNetworkError(new Error('network timeout'))).toBe(true);
  });

  it('returns true for Error with "Failed to fetch" (exact case)', () => {
    expect(isNetworkError(new Error('Failed to fetch'))).toBe(true);
  });

  it('returns false for Error with "failed to fetch" (wrong case)', () => {
    expect(isNetworkError(new Error('Request failed to fetch'))).toBe(false);
  });

  it('returns false for unrelated Error', () => {
    expect(isNetworkError(new Error('Something else'))).toBe(false);
  });

  it('returns false for non-Error values', () => {
    expect(isNetworkError('string')).toBe(false);
    expect(isNetworkError(null)).toBe(false);
    expect(isNetworkError(42)).toBe(false);
  });
});
