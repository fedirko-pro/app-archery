import { describe, expect, it } from 'vitest';

import type { User } from '../contexts/types';
import { needsOnboarding } from './onboarding-utils';

function user(overrides: Partial<User> = {}): User {
  return {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: 'user',
    authProvider: 'local',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    ...overrides,
  };
}

describe('needsOnboarding', () => {
  it('returns false for null user', () => {
    expect(needsOnboarding(null)).toBe(false);
  });

  it('returns false for undefined user', () => {
    expect(needsOnboarding(undefined)).toBe(false);
  });

  it('returns false when onboardingCompletedAt is set', () => {
    expect(needsOnboarding(user({ onboardingCompletedAt: '2026-01-01' }))).toBe(false);
  });

  it('returns true when onboardingCompletedAt is undefined', () => {
    expect(needsOnboarding(user({ onboardingCompletedAt: undefined }))).toBe(true);
  });

  it('returns true when onboardingCompletedAt is null', () => {
    expect(needsOnboarding(user({ onboardingCompletedAt: null }))).toBe(true);
  });
});
