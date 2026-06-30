import type { User } from '../contexts/types';

export function needsOnboarding(user: User | null | undefined): boolean {
  if (!user || user.onboardingCompletedAt) return false;
  return true;
}
