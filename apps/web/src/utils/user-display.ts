export interface HasName {
  firstName?: string;
  lastName?: string;
}

export function displayName(user: HasName): string {
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || 'Archer';
}

export function getOrigin(): string {
  return typeof window !== 'undefined' ? window.location.origin : '';
}
