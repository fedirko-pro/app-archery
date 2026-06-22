import { DEFAULT_COUNTRY_CODE } from '../config/countries';
import type { User } from '../contexts/types';

const GEO_COUNTRY_KEY = 'archery-geo-country';
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

async function detectCountryFromGeolocation(): Promise<string | null> {
  if (!navigator.geolocation) return null;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void (async () => {
          try {
            const { latitude, longitude } = pos.coords;
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
            );
            if (!res.ok) {
              resolve(null);
              return;
            }
            const data = (await res.json()) as { countryCode?: string };
            const code = data.countryCode;
            resolve(code && code.length === 2 ? code : null);
          } catch {
            resolve(null);
          }
        })();
      },
      () => resolve(null),
      { timeout: 5000, maximumAge: 600_000 },
    );
  });
}

/** Profile country → geolocation → Portugal. Does not use saved list filter. */
export async function resolveDefaultCountryCode(
  user: Pick<User, 'country' | 'nationality'> | null,
): Promise<string> {
  if (user?.country) return user.country;
  if (user?.nationality === 'Portuguesa') return DEFAULT_COUNTRY_CODE;

  try {
    const cached = sessionStorage.getItem(GEO_COUNTRY_KEY);
    if (cached) return cached;
  } catch {
    // ignore
  }

  const geoCountry = await detectCountryFromGeolocation();
  if (geoCountry) {
    try {
      sessionStorage.setItem(GEO_COUNTRY_KEY, geoCountry);
    } catch {
      // ignore
    }
    return geoCountry;
  }

  return DEFAULT_COUNTRY_CODE;
}
