import useMediaQuery from '@mui/material/useMediaQuery';
import { useLocation } from 'react-router-dom';

/** Matches SCSS `@mixin mobile` (max-width: 767.98px). */
export const ATHLETE_TAB_BAR_MQ = '(max-width: 767.98px)';

const AUTH_ROUTES = new Set(['signin', 'signup', 'reset-password']);

/**
 * Athlete bottom tabs: mobile viewport, not auth screens, not admin routes.
 */
export function useAthleteTabBarVisible(): boolean {
  const isMobile = useMediaQuery(ATHLETE_TAB_BAR_MQ);
  const { pathname } = useLocation();

  if (!isMobile) return false;

  const segments = pathname.split('/').filter(Boolean);
  // /:lang/... → segments[0] = lang, segments[1] = first route segment
  const route = segments[1] ?? '';

  if (AUTH_ROUTES.has(route)) return false;
  if (route === 'admin' || route.startsWith('admin')) return false;

  return true;
}
