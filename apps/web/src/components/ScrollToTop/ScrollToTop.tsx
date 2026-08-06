'use client';

import { useEffect } from 'react';
import { useLocation } from 'react-router';

/** Reset window scroll whenever the route path changes (page / tab switches). */
export function ScrollToTop() {
  const { pathname } = useLocation();

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally re-scrolls on every route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
