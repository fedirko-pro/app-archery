import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService } from './permissions.service';
import { RolePermissionsService } from './role-permissions.service';
import { Roles } from '../user/types';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let rolePermissions: jest.Mocked<RolePermissionsService>;

  const generalAdmin = { sub: 'admin-1', role: Roles.GeneralAdmin };
  const clubAdmin = { sub: 'club-admin-1', role: Roles.ClubAdmin };
  const federationAdmin = { sub: 'fed-admin-1', role: Roles.FederationAdmin };
  const regularUser = { sub: 'user-1', role: Roles.User };
  const tournament = { createdBy: { id: 'club-admin-1' } };

  beforeEach(async () => {
    rolePermissions = {
      hasPermission: jest.fn(),
      getMatrix: jest.fn(),
      setPermission: jest.fn(),
      getMatrixAsync: jest.fn(),
      onModuleInit: jest.fn(),
    } as unknown as jest.Mocked<RolePermissionsService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        { provide: RolePermissionsService, useValue: rolePermissions },
      ],
    }).compile();

    service = module.get(PermissionsService);
  });

  it('checks canApplyOtherUsers via permApplyOtherUsers', () => {
    rolePermissions.hasPermission.mockReturnValue(true);
    expect(service.canApplyOtherUsers(clubAdmin)).toBe(true);
    expect(rolePermissions.hasPermission).toHaveBeenCalledWith(
      Roles.ClubAdmin,
      'permApplyOtherUsers',
    );
  });

  it('checks canManagePatrols via permPatrolsPdf', () => {
    rolePermissions.hasPermission.mockReturnValue(true);
    expect(service.canManagePatrols(federationAdmin)).toBe(true);
    expect(rolePermissions.hasPermission).toHaveBeenCalledWith(
      Roles.FederationAdmin,
      'permPatrolsPdf',
    );
  });

  it('allows patrol viewing for tournament organizers', () => {
    rolePermissions.hasPermission.mockImplementation((role, permission) => {
      if (permission === 'permPatrolsPdf') return false;
      if (permission === 'permViewApplications') return true;
      return false;
    });

    expect(service.canViewPatrols(clubAdmin, tournament)).toBe(true);
  });

  it('allows applicants to view their own applications', () => {
    rolePermissions.hasPermission.mockReturnValue(false);
    expect(service.canViewApplication(regularUser, 'user-1', tournament)).toBe(true);
  });

  it('scopes club admin user visibility to their club', () => {
    rolePermissions.hasPermission.mockImplementation((role, permission) => {
      return permission === 'permCreateEditUser';
    });

    expect(
      service.canViewUserAsAdmin(clubAdmin, { club: { id: 'club-1' } }, { adminClubId: 'club-1' }),
    ).toBe(true);
    expect(
      service.canViewUserAsAdmin(clubAdmin, { club: { id: 'club-2' } }, { adminClubId: 'club-1' }),
    ).toBe(false);
  });

  it('scopes federation management to managed federation', () => {
    expect(service.canManageFederation(federationAdmin, 'fed-1', 'fed-1')).toBe(true);
    expect(service.canManageFederation(federationAdmin, 'fed-2', 'fed-1')).toBe(false);
    expect(service.canManageFederation(generalAdmin, 'fed-2')).toBe(true);
  });
});
