import { afterEach, describe, expect, it } from 'vitest';

import type { User } from '../contexts/types';
import { getCachedUser, setCachedUser } from './cached-user';

const sampleUser = {
  id: 'u1',
  email: 'a@b.c',
  firstName: 'Archer',
  lastName: 'Test',
  role: 'user',
  authProvider: 'local',
} as unknown as User;

describe('cached-user', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('stores and reads a cached user', () => {
    setCachedUser(sampleUser);
    expect(getCachedUser()).toEqual(sampleUser);
  });

  it('clears the cached user when set to null', () => {
    setCachedUser(sampleUser);
    setCachedUser(null);
    expect(getCachedUser()).toBeNull();
  });

  it('returns null for invalid JSON', () => {
    localStorage.setItem('sokil_cached_user', '{not-json');
    expect(getCachedUser()).toBeNull();
  });
});
