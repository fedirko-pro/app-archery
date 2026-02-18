/**
 * Simple localStorage-backed cache for public API data so the app can show
 * last loaded data when offline (e.g. after closing and reopening in airplane mode).
 */

const CACHE_PREFIX = 'uarchery_offline_';
const CACHE_KEYS = [
  'tournaments',
  'divisions',
  'rules',
  'clubs',
  'bow-categories',
] as const;

export type OfflineCacheKey = (typeof CACHE_KEYS)[number];

const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

let lastServedFromCache = false;

export const OFFLINE_CACHE_USED_EVENT = 'uarchery-offline-cache-used';

export function setLastServedFromCache(value: boolean): void {
  lastServedFromCache = value;
  if (value && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(OFFLINE_CACHE_USED_EVENT));
  }
}

export function wasLastServedFromCache(): boolean {
  return lastServedFromCache;
}

function storageKey(key: OfflineCacheKey): string {
  return `${CACHE_PREFIX}${key}`;
}

export function getOfflineCache<T>(key: OfflineCacheKey): T | null {
  try {
    const raw = localStorage.getItem(storageKey(key));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data: T; at: number };
    if (Date.now() - parsed.at > CACHE_MAX_AGE_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

export function setOfflineCache<T>(key: OfflineCacheKey, data: T): void {
  try {
    localStorage.setItem(
      storageKey(key),
      JSON.stringify({ data, at: Date.now() }),
    );
  } catch {
    // quota or disabled localStorage
  }
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return (
      error.message === 'Failed to fetch' ||
      error.message.includes('Load failed') ||
      error.message.includes('NetworkError')
    );
  }
  if (error instanceof Error) {
    return (
      error.message.includes('Failed to fetch') ||
      error.message.includes('Load failed') ||
      error.message.includes('network')
    );
  }
  return false;
}

export { CACHE_KEYS };
