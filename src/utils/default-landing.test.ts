import { describe, expect, it } from 'vitest';

import type { User } from '../contexts/types';
import { getDefaultLandingPath } from './default-landing';

function user(role: string): User {
  return {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role,
    authProvider: 'local',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  };
}

describe('getDefaultLandingPath', () => {
  it('returns /{lang}/tournaments for general_admin', () => {
    expect(getDefaultLandingPath('en', user('general_admin'))).toBe('/en/tournaments');
  });

  it('returns /{lang}/tournaments for federation_admin', () => {
    expect(getDefaultLandingPath('en', user('federation_admin'))).toBe('/en/tournaments');
  });

  it('returns /{lang}/tournaments for club_admin', () => {
    expect(getDefaultLandingPath('en', user('club_admin'))).toBe('/en/tournaments');
  });

  it('returns /{lang}/home for regular user', () => {
    expect(getDefaultLandingPath('en', user('user'))).toBe('/en/home');
  });

  it('returns /{lang}/tournaments for null user', () => {
    expect(getDefaultLandingPath('en', null)).toBe('/en/tournaments');
  });

  it('uses the provided language', () => {
    expect(getDefaultLandingPath('ua', user('user'))).toBe('/ua/home');
  });
});
