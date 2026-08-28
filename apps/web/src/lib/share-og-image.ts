import { isExternalPlaceholderUrl } from '@/utils/placeholder-images';

import { resolveSiteOgImage, SITE_OG_IMAGE_PATH } from './site-metadata';

export const SHARE_OG_IMAGE_PROXY_PATH = '/og/share-image';

const GOOGLE_AVATAR_HOST_SUFFIX = 'googleusercontent.com';

export function isShareImageUrl(value?: string | null): boolean {
  if (!value) {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed || isExternalPlaceholderUrl(trimmed) || trimmed.startsWith('data:')) {
    return false;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const protocol = new URL(trimmed).protocol;
      return protocol === 'http:' || protocol === 'https:';
    } catch {
      return false;
    }
  }

  return (
    trimmed.startsWith('/') && /\.(png|jpe?g|webp|gif|avif)$/i.test(trimmed.split(/[?#]/, 1)[0])
  );
}

export function enlargeGoogleAvatarUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.toLowerCase().endsWith(GOOGLE_AVATAR_HOST_SUFFIX)) {
      return url;
    }

    parsed.pathname = parsed.pathname.replace(/=s\d+(-c)?$/i, '=s512$1');
    return parsed.toString();
  } catch {
    return url;
  }
}

export function isOgImageProxyAllowed(src: string): boolean {
  try {
    const parsed = new URL(src);
    if (parsed.protocol !== 'https:') {
      return false;
    }
    const host = parsed.hostname.toLowerCase();
    return host === GOOGLE_AVATAR_HOST_SUFFIX || host.endsWith(`.${GOOGLE_AVATAR_HOST_SUFFIX}`);
  } catch {
    return false;
  }
}

export function toAbsoluteImageUrl(pathOrUrl: string, siteUrl: string): string {
  try {
    return new URL(pathOrUrl).toString();
  } catch {
    return new URL(pathOrUrl, `${siteUrl.replace(/\/$/, '')}/`).toString();
  }
}

export function toCrawlerSafeOgImageUrl(imageUrl: string, siteUrl: string): string {
  const absolute = toAbsoluteImageUrl(enlargeGoogleAvatarUrl(imageUrl), siteUrl);
  if (!isOgImageProxyAllowed(absolute)) {
    return absolute;
  }

  const origin = siteUrl.replace(/\/$/, '');
  return `${origin}${SHARE_OG_IMAGE_PROXY_PATH}?src=${encodeURIComponent(absolute)}`;
}

/** Client-safe pick: achievement image → avatar → branded site OG path. */
export function pickAchievementShareImage(
  achievementImage?: string | null,
  avatar?: string | null,
): string {
  if (achievementImage && isShareImageUrl(achievementImage)) {
    return achievementImage.trim();
  }
  if (avatar && isShareImageUrl(avatar)) {
    return avatar.trim();
  }
  return SITE_OG_IMAGE_PATH;
}

export function resolveAchievementShareOgImage(
  achievementImage: string | undefined,
  avatar: string | undefined,
  siteUrl: string,
): string {
  const picked = pickAchievementShareImage(achievementImage, avatar);
  if (picked === SITE_OG_IMAGE_PATH) {
    return resolveSiteOgImage(siteUrl);
  }
  return toCrawlerSafeOgImageUrl(picked, siteUrl);
}
