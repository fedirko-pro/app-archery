import { ROLES, ADMIN_CAPABLE_ROLES, ROLES_CAN_MANAGE_REFERENCE_DATA } from '@sokil/shared-types';
import type { Role } from '@sokil/shared-types';

export { ROLES, ADMIN_CAPABLE_ROLES, ROLES_CAN_MANAGE_REFERENCE_DATA };
export type { Role };

/** Only General Admin can access Access Control and change roles. */
export const ROLES_CAN_ACCESS_CONTROL: Role[] = [ROLES.GeneralAdmin];

/** General Admin and Federation Admin can delete users/tournaments and manage applications/PDFs. */
export const ROLES_CAN_DELETE_AND_MANAGE_APPS: Role[] = [ROLES.GeneralAdmin, ROLES.FederationAdmin];

export function isGeneralAdmin(role: string): boolean {
  return role === ROLES.GeneralAdmin;
}

export function isFederationAdmin(role: string): boolean {
  return role === ROLES.FederationAdmin;
}

export function isClubAdmin(role: string): boolean {
  return role === ROLES.ClubAdmin;
}

export function canAccessAdminSection(role: string): boolean {
  return ADMIN_CAPABLE_ROLES.includes(role as Role);
}

export interface NavItemConfig {
  link: string;
  labelKey: string;
}

export const ORGANIZER_NAV_ITEMS: NavItemConfig[] = [
  { link: '/admin/users', labelKey: 'nav.users' },
  { link: '/admin/applications', labelKey: 'nav.userApplications' },
];

export const ADMIN_NAV_ITEMS: NavItemConfig[] = [
  { link: '/admin/access-control', labelKey: 'nav.accessControl' },
];

export const FIELD_GUIDE_NAV_ITEMS: NavItemConfig[] = [
  { link: '/converter', labelKey: 'nav.converter' },
  { link: '/glossary', labelKey: 'nav.glossary' },
  { link: '/rules', labelKey: 'nav.rules' },
  { link: '/divisions', labelKey: 'nav.divisions' },
  { link: '/categories', labelKey: 'nav.categories' },
];

export const PUBLIC_DEMO_NAV_ITEMS: NavItemConfig[] = [
  { link: '/competition/user', labelKey: 'nav.scoringDemo' },
];

export const USER_DEMO_NAV_ITEMS: NavItemConfig[] = [];

export function canSeeOrganizerTools(role: string): boolean {
  return canAccessAdminSection(role);
}

export function canSeeAdminNavSection(role: string): boolean {
  return canAccessAccessControl(role);
}

export function canAccessAccessControl(role: string): boolean {
  return ROLES_CAN_ACCESS_CONTROL.includes(role as Role);
}

export function canChangeRole(role: string): boolean {
  return ROLES_CAN_ACCESS_CONTROL.includes(role as Role);
}

export function canDeleteUser(role: string): boolean {
  return ROLES_CAN_DELETE_AND_MANAGE_APPS.includes(role as Role);
}

export function canManageApplicationsAndPdfs(role: string): boolean {
  return ROLES_CAN_DELETE_AND_MANAGE_APPS.includes(role as Role);
}

export function canApplyOtherUsers(role: string): boolean {
  return ADMIN_CAPABLE_ROLES.includes(role as Role);
}

export function canManageReferenceData(role: string): boolean {
  return ROLES_CAN_MANAGE_REFERENCE_DATA.includes(role as Role);
}

export function canCreateTournament(role: string): boolean {
  return ADMIN_CAPABLE_ROLES.includes(role as Role);
}

export function canDeleteTournament(role: string): boolean {
  return ROLES_CAN_DELETE_AND_MANAGE_APPS.includes(role as Role);
}

export function canEditTournament(
  role: string,
  tournamentCreatedById: string,
  userId: string,
): boolean {
  if (role === ROLES.GeneralAdmin || role === ROLES.FederationAdmin) return true;
  if (role === ROLES.ClubAdmin && tournamentCreatedById === userId) return true;
  return false;
}

export const ROLE_LABEL_KEYS: Record<string, string> = {
  [ROLES.User]: 'accessControl.roleUser',
  [ROLES.ClubAdmin]: 'accessControl.roleClubAdmin',
  [ROLES.FederationAdmin]: 'accessControl.roleFederationAdmin',
  [ROLES.GeneralAdmin]: 'accessControl.roleGeneralAdmin',
};

export const ROLE_PERMISSIONS_MATRIX: Array<{ permissionKey: string; roles: Role[] }> = [
  {
    permissionKey: 'accessControl.permCreateEditTournament',
    roles: [ROLES.GeneralAdmin, ROLES.ClubAdmin, ROLES.FederationAdmin],
  },
  {
    permissionKey: 'accessControl.permDeleteTournament',
    roles: [ROLES.GeneralAdmin, ROLES.FederationAdmin],
  },
  {
    permissionKey: 'accessControl.permCreateEditUser',
    roles: [ROLES.GeneralAdmin, ROLES.ClubAdmin, ROLES.FederationAdmin],
  },
  {
    permissionKey: 'accessControl.permDeleteUser',
    roles: [ROLES.GeneralAdmin, ROLES.FederationAdmin],
  },
  {
    permissionKey: 'accessControl.permViewApplications',
    roles: [ROLES.GeneralAdmin, ROLES.ClubAdmin, ROLES.FederationAdmin],
  },
  {
    permissionKey: 'accessControl.permEditApplications',
    roles: [ROLES.GeneralAdmin, ROLES.FederationAdmin],
  },
  {
    permissionKey: 'accessControl.permPatrolsPdf',
    roles: [ROLES.GeneralAdmin, ROLES.FederationAdmin],
  },
  { permissionKey: 'accessControl.permReferenceData', roles: [ROLES.GeneralAdmin] },
  { permissionKey: 'accessControl.permAccessControl', roles: [ROLES.GeneralAdmin] },
];
