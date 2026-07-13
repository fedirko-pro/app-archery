import { ProfileVisibilityService } from './profile-visibility.service';
import { ProfileVisibilities, Roles } from './types';
import { User } from './entity/user.entity';

describe('ProfileVisibilityService', () => {
  const service = new ProfileVisibilityService();

  const target = {
    id: 'target-1',
    profileVisibility: ProfileVisibilities.Limited,
    club: { id: 'club-1' },
  } as User;

  it('returns none for personal profiles to strangers', () => {
    expect(
      service.resolveViewLevel(
        { ...target, profileVisibility: ProfileVisibilities.Personal } as User,
        { sub: 'viewer-1', role: Roles.User, clubId: 'club-2' },
      ),
    ).toBe('none');
  });

  it('returns limited for club mates', () => {
    expect(
      service.resolveViewLevel(target, {
        sub: 'viewer-1',
        role: Roles.User,
        clubId: 'club-1',
      }),
    ).toBe('limited');
  });

  it('returns limited for federation admins only within managed federation clubs', () => {
    expect(
      service.resolveViewLevel(target, {
        sub: 'fed-admin-1',
        role: Roles.FederationAdmin,
        federationClubIds: ['club-1'],
      }),
    ).toBe('limited');

    expect(
      service.resolveViewLevel(target, {
        sub: 'fed-admin-1',
        role: Roles.FederationAdmin,
        federationClubIds: ['club-2'],
      }),
    ).toBe('none');
  });

  it('returns public for public profiles without authentication', () => {
    expect(
      service.resolveViewLevel(
        { ...target, profileVisibility: ProfileVisibilities.Public } as User,
        null,
      ),
    ).toBe('public');
  });
});
