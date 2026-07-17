'use client';

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Reset window scroll whenever the route path changes (page / tab switches). */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
