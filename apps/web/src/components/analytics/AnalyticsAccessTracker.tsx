'use client';

import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { useAuth } from '../../contexts/auth-context';
import { isAnalyticsExcluded, setAnalyticsExcluded } from './gtag';

export function AnalyticsAccessTracker() {
  const { user, initializing } = useAuth();
  const { pathname } = useLocation();
  const role = user?.role ?? null;

  useEffect(() => {
    if (initializing) {
      return;
    }
    setAnalyticsExcluded(isAnalyticsExcluded(pathname, role));
  }, [initializing, pathname, role]);

  return null;
}
