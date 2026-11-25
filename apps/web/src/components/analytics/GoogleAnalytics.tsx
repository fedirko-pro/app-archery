'use client';

import Script from 'next/script';
import { useEffect, useState, useSyncExternalStore } from 'react';

import {
  GA_MEASUREMENT_ID,
  getAnalyticsAccess,
  isAnalyticsEnabled,
  subscribeAnalyticsAccess,
} from './gtag';

const getServerAccess = () => 'pending' as const;

export function GoogleAnalytics() {
  const access = useSyncExternalStore(
    subscribeAnalyticsAccess,
    getAnalyticsAccess,
    getServerAccess,
  );
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (access === 'allowed') {
      setShouldLoad(true);
    }
  }, [access]);

  if (!isAnalyticsEnabled || !shouldLoad) {
    return null;
  }

  return (
    <Script
      id="ga-script"
      strategy="afterInteractive"
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
    />
  );
}
