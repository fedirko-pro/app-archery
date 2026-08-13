'use client';

import { useEffect, useRef } from 'react';

import { useAuth } from '../../contexts/auth-context';
import { setUserId } from './gtag';

export function UserIdentityTracker() {
  const { user, initializing } = useAuth();
  const previousUserId = useRef<string | null>(null);

  useEffect(() => {
    if (initializing) {
      return;
    }

    const userId = user?.id ?? null;
    if (userId === previousUserId.current) {
      return;
    }

    previousUserId.current = userId;
    setUserId(userId);
  }, [initializing, user]);

  return null;
}
