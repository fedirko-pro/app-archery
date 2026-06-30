export const ProfileVisibilities = {
  Personal: 'personal',
  Limited: 'limited',
  Public: 'public',
} as const;

export type ProfileVisibility = (typeof ProfileVisibilities)[keyof typeof ProfileVisibilities];

export const VALID_PROFILE_VISIBILITIES: readonly ProfileVisibility[] = [
  ProfileVisibilities.Personal,
  ProfileVisibilities.Limited,
  ProfileVisibilities.Public,
] as const;
