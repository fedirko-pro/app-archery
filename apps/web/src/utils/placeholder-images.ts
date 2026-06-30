import defaultBannerImport from '../img/default_turnament_bg.png';
import defaultClubLogoImport from '../img/icons/club-default.svg';
import { assetUrl } from './asset-url';

export const LOCAL_CLUB_LOGO = assetUrl(defaultClubLogoImport);
export const LOCAL_TOURNAMENT_BANNER = assetUrl(defaultBannerImport);

const EXTERNAL_PLACEHOLDER_HOSTS = [
  'i.pravatar.cc',
  'images.unsplash.com',
  'picsum.photos',
  'placehold.co',
  'via.placeholder.com',
];

export function isExternalPlaceholderUrl(url?: string | null): boolean {
  if (!url) return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return EXTERNAL_PLACEHOLDER_HOSTS.some(
      (placeholderHost) => host === placeholderHost || host.endsWith(`.${placeholderHost}`),
    );
  } catch {
    return false;
  }
}

/** Returns a usable avatar URL, or undefined so Avatar can fall back to initials. */
export function resolveUserAvatar(url?: string | null): string | undefined {
  if (!url || isExternalPlaceholderUrl(url)) {
    return undefined;
  }
  return url;
}

export function resolveClubLogo(url?: string | null): string {
  if (!url || isExternalPlaceholderUrl(url)) {
    return LOCAL_CLUB_LOGO;
  }
  return url;
}

export function resolveTournamentBanner(url?: string | null): string {
  if (!url || isExternalPlaceholderUrl(url)) {
    return LOCAL_TOURNAMENT_BANNER;
  }
  return url;
}

export function getAvatarInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.trim()[0] ?? '';
  const last = lastName?.trim()[0] ?? '';
  return (first + last).toUpperCase() || '?';
}

/** Cache-bust remote avatar URLs; omit src for missing/placeholder URLs. */
export function resolveUserAvatarWithCacheBust(
  url: string | null | undefined,
  updatedAt?: string | null,
): string | undefined {
  const resolved = resolveUserAvatar(url);
  if (!resolved) return undefined;
  if (resolved.startsWith('data:')) return resolved;
  const sep = resolved.includes('?') ? '&' : '?';
  return `${resolved}${sep}t=${updatedAt || ''}`;
}
