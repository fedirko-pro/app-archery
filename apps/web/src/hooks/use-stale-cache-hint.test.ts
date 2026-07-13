import { renderHook, act } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { OFFLINE_CACHE_USED_EVENT, setLastServedFromCache } from '../utils/offline-cache';
import { useStaleCacheHint, FRESH_DATA_EVENT } from './use-stale-cache-hint';

describe('useStaleCacheHint', () => {
  afterEach(() => {
    setLastServedFromCache(false);
  });

  it('shows stale hint when offline cache event fires', () => {
    const { result } = renderHook(() => useStaleCacheHint());

    expect(result.current.showStaleHint).toBe(false);

    act(() => {
      window.dispatchEvent(new CustomEvent(OFFLINE_CACHE_USED_EVENT));
    });

    expect(result.current.showStaleHint).toBe(true);
  });

  it('hides stale hint after dismiss', () => {
    const { result } = renderHook(() => useStaleCacheHint());

    act(() => {
      window.dispatchEvent(new CustomEvent(OFFLINE_CACHE_USED_EVENT));
    });
    expect(result.current.showStaleHint).toBe(true);

    act(() => {
      result.current.dismiss();
    });
    expect(result.current.showStaleHint).toBe(false);
  });

  it('clears stale hint on fresh data event', () => {
    const { result } = renderHook(() => useStaleCacheHint());

    act(() => {
      window.dispatchEvent(new CustomEvent(OFFLINE_CACHE_USED_EVENT));
    });
    expect(result.current.showStaleHint).toBe(true);

    act(() => {
      window.dispatchEvent(new CustomEvent(FRESH_DATA_EVENT));
    });
    expect(result.current.showStaleHint).toBe(false);
  });
});
