export const ROLES = {
  User: 'user',
  GeneralAdmin: 'general_admin',
  ClubAdmin: 'club_admin',
  FederationAdmin: 'federation_admin',
  Admin: 'general_admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ADMIN_CAPABLE_ROLES: readonly Role[] = [
  ROLES.GeneralAdmin,
  ROLES.ClubAdmin,
  ROLES.FederationAdmin,
] as const;

export const ROLES_CAN_MANAGE_REFERENCE_DATA: readonly Role[] = [ROLES.GeneralAdmin] as const;

export const VALID_ROLES: readonly Role[] = [
  ROLES.User,
  ROLES.GeneralAdmin,
  ROLES.ClubAdmin,
  ROLES.FederationAdmin,
] as const;
