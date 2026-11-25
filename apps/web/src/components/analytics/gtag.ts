'use client';

import { env } from '../../config/env';
import { canAccessAdminSection } from '../../config/roles';

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

export const isAnalyticsEnabled = Boolean(GA_MEASUREMENT_ID) && env.SITE_MODE === 'prod';

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
let configured = false;
const accessListeners = new Set<() => void>();

function ensureGtag(): (...args: unknown[]) => void {
  window.dataLayer = window.dataLayer ?? [];
  if (!window.gtag) {
    window.gtag = function gtagShim() {
      // biome-ignore lint/complexity/noArguments: gtag.js only reads Arguments objects from dataLayer
      window.dataLayer.push(arguments);
    };
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

export function setAnalyticsExcluded(excluded: boolean): void {
  if (!isAnalyticsEnabled || typeof window === 'undefined') {
    return;
  }

  const next: AnalyticsAccess = excluded ? 'excluded' : 'allowed';
  (window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`] = excluded;

  if (excluded) {
    writePendingEvents([]);
  } else {
    if (!configured) {
      configured = true;
      gtag('js', new Date());
      gtag('config', GA_MEASUREMENT_ID);
    }
    flushPendingEvents();
  }

  if (next !== access) {
    access = next;
    for (const listener of accessListeners) {
      listener();
    }
  }
}

export function trackEvent<N extends AnalyticsEventName>(
  name: N,
  params: AnalyticsEventParams[N],
): void {
  if (!isAnalyticsEnabled || typeof window === 'undefined' || access === 'excluded') {
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
  configured = false;
  accessListeners.clear();
}
