import { DEFAULT_COUNTRY_CODE } from '../config/countries';
import type { User } from '../contexts/types';

const COUNTRY_FILTER_KEY = 'archery-tournament-country-filter';

export function getSavedCountryFilter(): string | null {
  try {
    return sessionStorage.getItem(COUNTRY_FILTER_KEY);
  } catch {
    return null;
  }
}

export function saveCountryFilter(value: string): void {
  try {
    sessionStorage.setItem(COUNTRY_FILTER_KEY, value);
  } catch {
    // ignore storage errors
  }
}

/** Profile country → Portugal. Does not use saved list filter. */
export function resolveDefaultCountryCode(user: Pick<User, 'country'> | null): string {
  return user?.country ?? DEFAULT_COUNTRY_CODE;
}
