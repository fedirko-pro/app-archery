import { describe, expect, it } from 'vitest';

import {
  formatDate,
  formatDateTime,
  formatShortDate,
  getApplicationDeadline,
  isApplicationDeadlinePassed,
} from './date-utils';

describe('formatDate', () => {
  it('formats ISO date string with default format', () => {
    const result = formatDate('2025-01-15');
    expect(result).not.toBe('Invalid date');
    expect(result).toMatch(/January|Jan/);
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2025/);
  });

  it('formats with custom format string', () => {
    const result = formatDate('2025-01-15', 'yyyy-MM-dd');
    expect(result).toBe('2025-01-15');
  });

  it('returns "Invalid date" for invalid string', () => {
    expect(formatDate('not-a-date')).toBe('Invalid date');
    expect(formatDate('')).toBe('Invalid date');
  });

  it('accepts Date object', () => {
    const result = formatDate(new Date('2025-06-20'), 'yyyy-MM-dd');
    expect(result).toBe('2025-06-20');
  });
});

describe('formatShortDate', () => {
  it('formats as MM/dd/yyyy', () => {
    const result = formatShortDate('2025-03-10');
    expect(result).toBe('03/10/2025');
  });
});

describe('formatDateTime', () => {
  it('formats date and time', () => {
    const result = formatDateTime('2025-01-15T14:30:00');
    expect(result).not.toBe('Invalid date');
    expect(result).toMatch(/2025|15|January|Jan/);
  });
});

describe('getApplicationDeadline', () => {
  it('returns 5 days before start date', () => {
    const start = new Date('2025-02-10');
    const deadline = getApplicationDeadline(start);
    expect(deadline.getFullYear()).toBe(2025);
    expect(deadline.getMonth()).toBe(1); // February = 1
    expect(deadline.getDate()).toBe(5);
  });

  it('accepts ISO string', () => {
    const deadline = getApplicationDeadline('2025-03-20');
    expect(deadline.getDate()).toBe(15);
    expect(deadline.getMonth()).toBe(2); // March = 2
  });
});

describe('isApplicationDeadlinePassed', () => {
  const now = new Date(2026, 9, 9, 15, 0, 0);

  it('stays open on the deadline day', () => {
    expect(isApplicationDeadlinePassed('2026-10-09', now)).toBe(false);
  });

  it('is passed the day after the deadline', () => {
    expect(isApplicationDeadlinePassed('2026-10-08', now)).toBe(true);
  });

  it('stays open when no deadline is set', () => {
    expect(isApplicationDeadlinePassed(null, now)).toBe(false);
    expect(isApplicationDeadlinePassed(undefined, now)).toBe(false);
  });
});
