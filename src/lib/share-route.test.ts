import { describe, expect, it } from 'vitest';

import { getArcherRouteFromPath } from './share-route';

describe('getArcherRouteFromPath', () => {
  it('returns null for undefined', () => {
    expect(getArcherRouteFromPath(undefined)).toBeNull();
  });

  it('returns null for empty array', () => {
    expect(getArcherRouteFromPath([])).toBeNull();
  });

  it('returns null when first segment is not "archers"', () => {
    expect(getArcherRouteFromPath(['tournaments', '123'])).toBeNull();
  });

  it('returns null when userId is missing', () => {
    expect(getArcherRouteFromPath(['archers'])).toBeNull();
  });

  it('returns userId for /archers/{userId}', () => {
    const result = getArcherRouteFromPath(['archers', 'user123']);
    expect(result).toEqual({ userId: 'user123' });
  });

  it('returns userId and achievementId for /archers/{userId}/achievements/{id}', () => {
    const result = getArcherRouteFromPath(['archers', 'user123', 'achievements', 'ach456']);
    expect(result).toEqual({ userId: 'user123', achievementId: 'ach456' });
  });

  it('returns null for /archers/{userId}/other/{id} (non-achievements)', () => {
    expect(getArcherRouteFromPath(['archers', 'user123', 'other', 'something'])).toBeNull();
  });

  it('returns null for /archers/{userId}/achievements (missing achievement id)', () => {
    expect(getArcherRouteFromPath(['archers', 'user123', 'achievements'])).toBeNull();
  });
});
