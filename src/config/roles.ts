/**
 * Role constants and permission helpers for RBAC.
 * Must match backend src/user/types.ts and auth/permissions.ts.
 */

export const ROLES = {
  User: 'user',
  GeneralAdmin: 'general_admin',
  ClubAdmin: 'club_admin',
  FederationAdmin: 'federation_admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Roles that can access admin-style features (users, applications, tournaments). */
export const ADMIN_CAPABLE_ROLES: Role[] = [
  ROLES.GeneralAdmin,
  ROLES.ClubAdmin,
  ROLES.FederationAdmin,
];

/** Only General Admin can access Access Control and change roles. */
export const ROLES_CAN_ACCESS_CONTROL: Role[] = [ROLES.GeneralAdmin];

/** General Admin and Federation Admin can delete users/tournaments and manage applications/PDFs. */
export const ROLES_CAN_DELETE_AND_MANAGE_APPS: Role[] = [
  ROLES.GeneralAdmin,
  ROLES.FederationAdmin,
];

/** Only General Admin can manage reference data (categories, clubs, divisions, rules). */
export const ROLES_CAN_MANAGE_REFERENCE_DATA: Role[] = [ROLES.GeneralAdmin];

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

export function canManageReferenceData(role: string): boolean {
  return ROLES_CAN_MANAGE_REFERENCE_DATA.includes(role as Role);
}

export function canCreateTournament(role: string): boolean {
  return ADMIN_CAPABLE_ROLES.includes(role as Role);
}

export function canDeleteTournament(role: string): boolean {
  return ROLES_CAN_DELETE_AND_MANAGE_APPS.includes(role as Role);
}

export function canEditTournament(role: string, tournamentCreatedById: string, userId: string): boolean {
  if (role === ROLES.GeneralAdmin || role === ROLES.FederationAdmin) return true;
  if (role === ROLES.ClubAdmin && tournamentCreatedById === userId) return true;
  return false;
}

/** i18n key for each role (use with t(key)). */
export const ROLE_LABEL_KEYS: Record<string, string> = {
  [ROLES.User]: 'accessControl.roleUser',
  [ROLES.ClubAdmin]: 'accessControl.roleClubAdmin',
  [ROLES.FederationAdmin]: 'accessControl.roleFederationAdmin',
  [ROLES.GeneralAdmin]: 'accessControl.roleGeneralAdmin',
};

/**
 * Permission matrix for display: each key is a permission label key,
 * value is array of role values that have it.
 */
export const ROLE_PERMISSIONS_MATRIX: Array<{ permissionKey: string; roles: Role[] }> = [
  { permissionKey: 'accessControl.permCreateEditTournament', roles: [ROLES.GeneralAdmin, ROLES.ClubAdmin, ROLES.FederationAdmin] },
  { permissionKey: 'accessControl.permDeleteTournament', roles: [ROLES.GeneralAdmin, ROLES.FederationAdmin] },
  { permissionKey: 'accessControl.permCreateEditUser', roles: [ROLES.GeneralAdmin, ROLES.ClubAdmin, ROLES.FederationAdmin] },
  { permissionKey: 'accessControl.permDeleteUser', roles: [ROLES.GeneralAdmin, ROLES.FederationAdmin] },
  { permissionKey: 'accessControl.permViewApplications', roles: [ROLES.GeneralAdmin, ROLES.ClubAdmin, ROLES.FederationAdmin] },
  { permissionKey: 'accessControl.permEditApplications', roles: [ROLES.GeneralAdmin, ROLES.FederationAdmin] },
  { permissionKey: 'accessControl.permPatrolsPdf', roles: [ROLES.GeneralAdmin, ROLES.FederationAdmin] },
  { permissionKey: 'accessControl.permReferenceData', roles: [ROLES.GeneralAdmin] },
  { permissionKey: 'accessControl.permAccessControl', roles: [ROLES.GeneralAdmin] },
];
