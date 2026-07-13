import type { User } from '../contexts/types';
import { getDefaultLandingPath } from './default-landing';
import { needsOnboarding } from './onboarding-utils';
import { getAndClearPendingApplication, getAndClearReturnUrl } from './safe-session-json';

/** Resolve the post-authentication path, consuming stored session redirect keys. */
export function resolvePostAuthPath(lang: string, user: User | null): string {
  const returnUrl = getAndClearReturnUrl();
  if (returnUrl) return returnUrl;

  const pendingApplication = getAndClearPendingApplication();
  if (pendingApplication) return pendingApplication.redirectTo;

  if (needsOnboarding(user)) {
    return `/${lang}/onboarding`;
  }

  return getDefaultLandingPath(lang, user);
}
