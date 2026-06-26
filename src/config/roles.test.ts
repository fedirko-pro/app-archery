import { describe, expect, it } from 'vitest';

import {
  canAccessAccessControl,
  canAccessAdminSection,
  canApplyOtherUsers,
  canChangeRole,
  canCreateTournament,
  canDeleteTournament,
  canDeleteUser,
  canEditTournament,
  canManageApplicationsAndPdfs,
  canManageReferenceData,
  canSeeAdminNavSection,
  canSeeOrganizerTools,
  isClubAdmin,
  isFederationAdmin,
  isGeneralAdmin,
  ROLES,
} from './roles';

describe('isGeneralAdmin', () => {
  it('returns true for general_admin', () => {
    expect(isGeneralAdmin(ROLES.GeneralAdmin)).toBe(true);
  });

  it('returns false for other roles', () => {
    expect(isGeneralAdmin(ROLES.User)).toBe(false);
    expect(isGeneralAdmin(ROLES.ClubAdmin)).toBe(false);
    expect(isGeneralAdmin(ROLES.FederationAdmin)).toBe(false);
  });
});

describe('isFederationAdmin', () => {
  it('returns true for federation_admin', () => {
    expect(isFederationAdmin(ROLES.FederationAdmin)).toBe(true);
  });

  it('returns false for other roles', () => {
    expect(isFederationAdmin(ROLES.User)).toBe(false);
    expect(isFederationAdmin(ROLES.GeneralAdmin)).toBe(false);
  });
});

describe('isClubAdmin', () => {
  it('returns true for club_admin', () => {
    expect(isClubAdmin(ROLES.ClubAdmin)).toBe(true);
  });

  it('returns false for other roles', () => {
    expect(isClubAdmin(ROLES.User)).toBe(false);
    expect(isClubAdmin(ROLES.FederationAdmin)).toBe(false);
  });
});

describe('canAccessAdminSection', () => {
  it('allows admin-capable roles', () => {
    expect(canAccessAdminSection(ROLES.GeneralAdmin)).toBe(true);
    expect(canAccessAdminSection(ROLES.ClubAdmin)).toBe(true);
    expect(canAccessAdminSection(ROLES.FederationAdmin)).toBe(true);
  });

  it('denies regular user', () => {
    expect(canAccessAdminSection(ROLES.User)).toBe(false);
  });
});

describe('canSeeOrganizerTools', () => {
  it('mirrors canAccessAdminSection', () => {
    expect(canSeeOrganizerTools(ROLES.GeneralAdmin)).toBe(true);
    expect(canSeeOrganizerTools(ROLES.ClubAdmin)).toBe(true);
    expect(canSeeOrganizerTools(ROLES.User)).toBe(false);
  });
});

describe('canSeeAdminNavSection', () => {
  it('only allows general_admin', () => {
    expect(canSeeAdminNavSection(ROLES.GeneralAdmin)).toBe(true);
    expect(canSeeAdminNavSection(ROLES.FederationAdmin)).toBe(false);
    expect(canSeeAdminNavSection(ROLES.ClubAdmin)).toBe(false);
    expect(canSeeAdminNavSection(ROLES.User)).toBe(false);
  });
});

describe('canAccessAccessControl', () => {
  it('only allows general_admin', () => {
    expect(canAccessAccessControl(ROLES.GeneralAdmin)).toBe(true);
    expect(canAccessAccessControl(ROLES.FederationAdmin)).toBe(false);
    expect(canAccessAccessControl(ROLES.User)).toBe(false);
  });
});

describe('canChangeRole', () => {
  it('only allows general_admin', () => {
    expect(canChangeRole(ROLES.GeneralAdmin)).toBe(true);
    expect(canChangeRole(ROLES.FederationAdmin)).toBe(false);
    expect(canChangeRole(ROLES.User)).toBe(false);
  });
});

describe('canDeleteUser', () => {
  it('allows general_admin and federation_admin', () => {
    expect(canDeleteUser(ROLES.GeneralAdmin)).toBe(true);
    expect(canDeleteUser(ROLES.FederationAdmin)).toBe(true);
  });

  it('denies others', () => {
    expect(canDeleteUser(ROLES.ClubAdmin)).toBe(false);
    expect(canDeleteUser(ROLES.User)).toBe(false);
  });
});

describe('canManageApplicationsAndPdfs', () => {
  it('allows general_admin and federation_admin', () => {
    expect(canManageApplicationsAndPdfs(ROLES.GeneralAdmin)).toBe(true);
    expect(canManageApplicationsAndPdfs(ROLES.FederationAdmin)).toBe(true);
  });

  it('denies others', () => {
    expect(canManageApplicationsAndPdfs(ROLES.ClubAdmin)).toBe(false);
  });
});

describe('canApplyOtherUsers', () => {
  it('allows all admin-capable roles', () => {
    expect(canApplyOtherUsers(ROLES.GeneralAdmin)).toBe(true);
    expect(canApplyOtherUsers(ROLES.ClubAdmin)).toBe(true);
    expect(canApplyOtherUsers(ROLES.FederationAdmin)).toBe(true);
  });

  it('denies regular user', () => {
    expect(canApplyOtherUsers(ROLES.User)).toBe(false);
  });
});

describe('canManageReferenceData', () => {
  it('only allows general_admin', () => {
    expect(canManageReferenceData(ROLES.GeneralAdmin)).toBe(true);
    expect(canManageReferenceData(ROLES.FederationAdmin)).toBe(false);
    expect(canManageReferenceData(ROLES.User)).toBe(false);
  });
});

describe('canCreateTournament', () => {
  it('allows all admin-capable roles', () => {
    expect(canCreateTournament(ROLES.GeneralAdmin)).toBe(true);
    expect(canCreateTournament(ROLES.ClubAdmin)).toBe(true);
    expect(canCreateTournament(ROLES.FederationAdmin)).toBe(true);
  });

  it('denies regular user', () => {
    expect(canCreateTournament(ROLES.User)).toBe(false);
  });
});

describe('canDeleteTournament', () => {
  it('allows general_admin and federation_admin', () => {
    expect(canDeleteTournament(ROLES.GeneralAdmin)).toBe(true);
    expect(canDeleteTournament(ROLES.FederationAdmin)).toBe(true);
  });

  it('denies club_admin and user', () => {
    expect(canDeleteTournament(ROLES.ClubAdmin)).toBe(false);
    expect(canDeleteTournament(ROLES.User)).toBe(false);
  });
});

describe('canEditTournament', () => {
  it('always allows general_admin', () => {
    expect(canEditTournament(ROLES.GeneralAdmin, 'any', 'any')).toBe(true);
  });

  it('always allows federation_admin', () => {
    expect(canEditTournament(ROLES.FederationAdmin, 'any', 'any')).toBe(true);
  });

  it('allows club_admin only if they are the creator', () => {
    expect(canEditTournament(ROLES.ClubAdmin, 'user1', 'user1')).toBe(true);
  });

  it('denies club_admin if they are not the creator', () => {
    expect(canEditTournament(ROLES.ClubAdmin, 'user1', 'user2')).toBe(false);
  });

  it('denies regular user', () => {
    expect(canEditTournament(ROLES.User, 'user1', 'user1')).toBe(false);
  });
});
