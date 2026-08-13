'use client';

import { env } from '../../config/env';

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

export const isAnalyticsEnabled = Boolean(GA_MEASUREMENT_ID) && env.SITE_MODE === 'prod';

function getGtag(): ((...args: unknown[]) => void) | null {
  if (!isAnalyticsEnabled || typeof window === 'undefined') {
    return null;
  }
  if (!window.gtag) {
    window.dataLayer = window.dataLayer ?? [];
    window.gtag = (...args: unknown[]) => {
      window.dataLayer.push(args);
    };
  }
  return window.gtag;
}

export function gtag(...args: unknown[]): void {
  getGtag()?.(...args);
}

export function trackEvent(name: string, params?: Record<string, unknown>): void {
  gtag('event', name, params);
}

export function setUserId(userId: string | null): void {
  gtag('set', { user_id: userId });
}
