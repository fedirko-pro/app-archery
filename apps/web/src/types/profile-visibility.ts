export type ProfileVisibility = 'personal' | 'limited' | 'public';

export const PROFILE_VISIBILITY_OPTIONS: ProfileVisibility[] = ['personal', 'limited', 'public'];

export function getProfileVisibilityLabelKey(visibility: ProfileVisibility): string {
  return `privacy.visibility.${visibility}.label`;
}

export function getProfileVisibilityHelperKey(visibility: ProfileVisibility): string {
  return `privacy.visibility.${visibility}.helper`;
}
