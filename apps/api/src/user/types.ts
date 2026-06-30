export {
  ROLES,
  ADMIN_CAPABLE_ROLES,
  ROLES_CAN_MANAGE_REFERENCE_DATA,
  VALID_ROLES,
  AuthProviders,
  ProfileVisibilities,
  VALID_PROFILE_VISIBILITIES,
} from '@sokil/shared-types';

export type {
  Role,
  AuthProvider,
  ProfileVisibility,
} from '@sokil/shared-types';

import { ROLES } from '@sokil/shared-types';

/** @deprecated Use ROLES instead. */
export const Roles = ROLES;

/** @deprecated Use ROLES.Admin instead. */
export const UserRoles = ROLES;

/** Roles that can change user roles (Access Control). */
export const ROLES_CAN_CHANGE_ROLE = [ROLES.GeneralAdmin] as const;

/** Roles that can delete users or tournaments. */
export const ROLES_CAN_DELETE = [
  ROLES.GeneralAdmin,
  ROLES.FederationAdmin,
] as const;

/** Roles that can edit/delete applications and generate PDFs. */
export const ROLES_CAN_MANAGE_APPLICATIONS_AND_PDFS = [
  ROLES.GeneralAdmin,
  ROLES.FederationAdmin,
] as const;
