import type { Metadata } from 'next';

import type { PublicAchievementShareDto, PublicProfileDto } from '@/services/types';
import { displayName } from '@/utils/user-display';

export const DEFAULT_PROFILE_OG_IMAGE_PATH = '/og/default-tournament-banner.png';
export const DEFAULT_ACHIEVEMENT_OG_IMAGE_PATH = '/og/default-tournament-banner.png';

function resolveOgImageUrl(picture: string | undefined, siteUrl: string): string {
  if (picture) {
    try {
      return new URL(picture).toString();
    } catch {
      return new URL(picture, siteUrl).toString();
    }
  }
  return new URL(DEFAULT_PROFILE_OG_IMAGE_PATH, siteUrl).toString();
}

export function buildPublicProfileMetadata(
  profile: PublicProfileDto,
  lang: string,
  siteUrl: string,
): Metadata {
  const name = displayName(profile);
  const pageUrl = `${siteUrl}/${lang}/archers/${profile.id}`;
  const streak = profile.progress?.currentStreakWeeks ?? 0;
  const weeklyArrows = profile.progress?.shotsThisWeek ?? 0;
  const description =
    profile.bio?.trim() || `${weeklyArrows} arrows this week · ${streak}-week streak on Sokil`;

  const imageUrl = resolveOgImageUrl(profile.picture, siteUrl);

  return {
    title: `${name} | Sokil`,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: `${name} on Sokil`,
      description,
      url: pageUrl,
      siteName: 'Sokil',
      type: 'profile',
      locale: lang,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} on Sokil`,
      description,
      images: [imageUrl],
    },
  };
}

export function buildAchievementShareMetadata(
  achievement: PublicAchievementShareDto,
  lang: string,
  siteUrl: string,
): Metadata {
  const ownerName = displayName(achievement.owner);
  const pageUrl = `${siteUrl}/${lang}/archers/${achievement.owner.id}/achievements/${achievement.id}`;
  const description = achievement.description;
  const imageUrl = resolveOgImageUrl(achievement.owner.picture, siteUrl);

  return {
    title: `${achievement.title} · ${ownerName} | Sokil`,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: `${achievement.title} — ${ownerName}`,
      description,
      url: pageUrl,
      siteName: 'Sokil',
      type: 'website',
      locale: lang,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: achievement.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${achievement.title} — ${ownerName}`,
      description,
      images: [imageUrl],
    },
  };
}

export function buildShareNotFoundMetadata(): Metadata {
  return {
    title: 'Not found | Sokil',
    robots: { index: false, follow: false },
  };
}
