'use client';

import { env } from '../../config/env';
import { canAccessAdminSection } from '../../config/roles';
import {
  type ConsentChoice,
  type ConsentState,
  clearAnalyticsCookies,
  getConsent,
  saveConsent,
} from './consent';

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

export const isAnalyticsEnabled = Boolean(GA_MEASUREMENT_ID) && env.SITE_MODE === 'prod';

/**
 * Show the cookie banner whenever a GA ID is configured. On the test site this lets the
 * banner be checked without sending anything, because isAnalyticsEnabled stays false there.
 */
export const isConsentRequired = Boolean(GA_MEASUREMENT_ID);

export type AuthMethod = 'email' | 'google';

export interface AnalyticsEventParams {
  sign_up: { method: AuthMethod };
  login: { method: AuthMethod };
  training_session_logged: {
    shots_count: number;
    arrows_per_set?: number;
    has_score: boolean;
    has_mood: boolean;
  };
}

export type AnalyticsEventName = keyof AnalyticsEventParams;

export type AnalyticsAccess = 'pending' | 'allowed' | 'excluded';

/** Admin route/role decision from AnalyticsAccessTracker; 'pending' until auth has loaded. */
export type AdminDecision = 'pending' | 'allowed' | 'excluded';

interface PendingEvent {
  name: AnalyticsEventName;
  params: Record<string, unknown>;
  at: number;
}

const PENDING_EVENTS_KEY = 'sokil_ga_pending_events';
const PENDING_EVENT_TTL_MS = 30 * 60 * 1000;
const MAX_PENDING_EVENTS = 10;
const RECENT_SIGN_UP_MS = 10 * 60 * 1000;
const ADMIN_PATH_RE = /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?admin(?:\/|$)/i;

let access: AnalyticsAccess = 'pending';
let adminDecision: AdminDecision = 'pending';
let configured = false;
let consentDefaultSet = false;
let analyticsConsentGranted = false;
const accessListeners = new Set<() => void>();

function ensureGtag(): (...args: unknown[]) => void {
  window.dataLayer = window.dataLayer ?? [];
  if (!window.gtag) {
    window.gtag = function gtagShim() {
      // biome-ignore lint/complexity/noArguments: gtag.js only reads Arguments objects from dataLayer
      window.dataLayer.push(arguments);
    };
  }
  if (!consentDefaultSet) {
    // Consent Mode v2: everything denied until the visitor accepts. This is always the
    // first command in dataLayer, so it runs before gtag('config') when gtag.js loads.
    consentDefaultSet = true;
    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  }
  return window.gtag;
}

function getGtag(): ((...args: unknown[]) => void) | null {
  if (!isAnalyticsEnabled || typeof window === 'undefined') {
    return null;
  }
  return ensureGtag();
}

export function gtag(...args: unknown[]): void {
  getGtag()?.(...args);
}

export function isAdminPath(pathname: string): boolean {
  return ADMIN_PATH_RE.test(pathname);
}

export function isAnalyticsExcluded(pathname: string, role?: string | null): boolean {
  return isAdminPath(pathname) || (role ? canAccessAdminSection(role) : false);
}

export function isRecentSignUp(createdAt: string | undefined, now: number = Date.now()): boolean {
  if (!createdAt) return false;
  const created = Date.parse(createdAt);
  if (Number.isNaN(created)) return false;
  return now - created >= -60_000 && now - created <= RECENT_SIGN_UP_MS;
}

function readPendingEvents(): PendingEvent[] {
  try {
    const raw = sessionStorage.getItem(PENDING_EVENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as PendingEvent[]) : [];
  } catch {
    return [];
  }
}

function writePendingEvents(events: PendingEvent[]): void {
  try {
    if (events.length === 0) {
      sessionStorage.removeItem(PENDING_EVENTS_KEY);
    } else {
      sessionStorage.setItem(PENDING_EVENTS_KEY, JSON.stringify(events));
    }
  } catch {
    // storage unavailable
  }
}

function cleanParams(params: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined));
}

function sendEvent(name: string, params: Record<string, unknown>): void {
  gtag('event', name, params);
}

function flushPendingEvents(): void {
  const now = Date.now();
  const events = readPendingEvents().filter((event) => now - event.at <= PENDING_EVENT_TTL_MS);
  writePendingEvents([]);
  for (const event of events) {
    sendEvent(event.name, event.params);
  }
}

export function getAnalyticsAccess(): AnalyticsAccess {
  return access;
}

export function subscribeAnalyticsAccess(listener: () => void): () => void {
  accessListeners.add(listener);
  return () => {
    accessListeners.delete(listener);
  };
}

/**
 * GA runs only when the visitor consented AND is not an admin (route or role).
 * A rejection or an admin decision excludes; anything still undecided stays pending.
 */
export function resolveAnalyticsAccess(
  admin: AdminDecision,
  consent: ConsentState,
): AnalyticsAccess {
  if (admin === 'excluded' || consent === 'denied') return 'excluded';
  if (admin === 'allowed' && consent === 'granted') return 'allowed';
  return 'pending';
}

function applyAccess(): void {
  if (!isAnalyticsEnabled || typeof window === 'undefined') {
    return;
  }

  const consent = getConsent();
  const next = resolveAnalyticsAccess(adminDecision, consent);
  (window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`] =
    next !== 'allowed';

  if (next === 'allowed') {
    if (!analyticsConsentGranted) {
      analyticsConsentGranted = true;
      gtag('consent', 'update', { analytics_storage: 'granted' });
    }
    if (!configured) {
      configured = true;
      gtag('js', new Date());
      gtag('config', GA_MEASUREMENT_ID);
    }
    flushPendingEvents();
  } else if (next === 'excluded') {
    writePendingEvents([]);
    if (consent === 'denied') {
      if (analyticsConsentGranted) {
        analyticsConsentGranted = false;
        gtag('consent', 'update', { analytics_storage: 'denied' });
      }
      clearAnalyticsCookies();
    }
  }

  if (next !== access) {
    access = next;
    for (const listener of accessListeners) {
      listener();
    }
  }
}

export function setAnalyticsExcluded(excluded: boolean): void {
  adminDecision = excluded ? 'excluded' : 'allowed';
  applyAccess();
}

/** Store the visitor's cookie choice and apply it right away. */
export function setAnalyticsConsent(choice: ConsentChoice): void {
  saveConsent(choice);
  applyAccess();
}

export function trackEvent<N extends AnalyticsEventName>(
  name: N,
  params: AnalyticsEventParams[N],
): void {
  if (
    !isAnalyticsEnabled ||
    typeof window === 'undefined' ||
    access === 'excluded' ||
    getConsent() === 'denied'
  ) {
    return;
  }

  const cleaned = cleanParams({ ...params });

  if (access === 'pending') {
    const events = readPendingEvents();
    events.push({ name, params: cleaned, at: Date.now() });
    writePendingEvents(events.slice(-MAX_PENDING_EVENTS));
    return;
  }

  sendEvent(name, cleaned);
}

export function trackAuthEvent(
  name: 'sign_up' | 'login',
  method: AuthMethod,
  user: { role?: string | null } | null | undefined,
): void {
  if (user?.role && canAccessAdminSection(user.role)) {
    setAnalyticsExcluded(true);
    return;
  }
  trackEvent(name, { method });
}

export function setUserId(userId: string | null): void {
  gtag('set', { user_id: userId });
}

export function resetAnalyticsStateForTests(): void {
  access = 'pending';
  adminDecision = 'pending';
  configured = false;
  consentDefaultSet = false;
  analyticsConsentGranted = false;
  accessListeners.clear();
}
