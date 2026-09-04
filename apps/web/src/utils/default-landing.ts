import type { User } from '../contexts/types';

export function getDefaultLandingPath(lang: string, user: User | null): string {
  if (user) {
    return `/${lang}/home`;
  }
  return `/${lang}/about`;
}
