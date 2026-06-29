import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { isMonthlySummaryWindow } from './re-engagement-utils';

describe('isMonthlySummaryWindow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true on day 1 of month', () => {
    vi.setSystemTime(new Date('2026-06-01T12:00:00'));
    expect(isMonthlySummaryWindow()).toBe(true);
  });

  it('returns true on day 7 of month', () => {
    vi.setSystemTime(new Date('2026-06-07T12:00:00'));
    expect(isMonthlySummaryWindow()).toBe(true);
  });

  it('returns false on day 8 of month', () => {
    vi.setSystemTime(new Date('2026-06-08T12:00:00'));
    expect(isMonthlySummaryWindow()).toBe(false);
  });

  it('returns false on last day of month', () => {
    vi.setSystemTime(new Date('2026-06-30T12:00:00'));
    expect(isMonthlySummaryWindow()).toBe(false);
  });

  it('accepts a reference date parameter', () => {
    expect(isMonthlySummaryWindow(new Date('2026-03-05T12:00:00'))).toBe(true);
    expect(isMonthlySummaryWindow(new Date('2026-03-10T12:00:00'))).toBe(false);
  });
});
