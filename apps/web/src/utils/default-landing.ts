import { canAccessAdminSection } from '../config/roles';
import type { User } from '../contexts/types';

export function getDefaultLandingPath(lang: string, user: User | null): string {
  if (user && !canAccessAdminSection(user.role)) {
    return `/${lang}/home`;
  }
  return `/${lang}/tournaments`;
}
