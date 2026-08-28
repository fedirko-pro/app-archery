import type { Metadata } from 'next';

import type {
  PublicAchievementShareDto,
  PublicProfileDto,
  PublicProgressShareDto,
} from '@/services/types';
import { displayName } from '@/utils/user-display';
import { alternateOgLocales, toOgLocale } from './og-locale';
import type { ServerTranslate } from './server-i18n';
import { resolveAchievementShareOgImage } from './share-og-image';

export const DEFAULT_PROFILE_OG_IMAGE_PATH = '/og/default-tournament-banner.png';

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
  t: ServerTranslate,
): Metadata {
  const name = displayName(profile);
  const pageUrl = `${siteUrl}/${lang}/archers/${profile.id}`;
  const streak = profile.progress?.currentStreakWeeks ?? 0;
  const weeklyArrows = profile.progress?.shotsThisWeek ?? 0;
  const description =
    profile.bio?.trim() ||
    t('publicProfile.ogDescription', { arrows: weeklyArrows, weeks: streak });
  const shareTitle = t('publicProfile.shareText', { name });

  const imageUrl = resolveOgImageUrl(profile.picture, siteUrl);

  return {
    title: `${name} | Sokil`,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: shareTitle,
      description,
      url: pageUrl,
      siteName: 'Sokil',
      type: 'profile',
      locale: toOgLocale(lang),
      alternateLocale: alternateOgLocales(lang),
      images: [{ url: imageUrl, width: 1200, height: 630, alt: name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: shareTitle,
      description,
      images: [imageUrl],
    },
  };
}

export function buildAchievementShareMetadata(
  achievement: PublicAchievementShareDto,
  lang: string,
  siteUrl: string,
  t: ServerTranslate,
): Metadata {
  const ownerName = displayName(achievement.owner);
  const pageUrl = `${siteUrl}/${lang}/archers/${achievement.owner.id}/achievements/${achievement.id}`;
  const title = t(achievement.titleKey);
  const description = t(achievement.descriptionKey);
  const imageUrl = resolveAchievementShareOgImage(
    achievement.icon,
    achievement.owner.picture,
    siteUrl,
  );

  return {
    title: `${title} · ${ownerName} | Sokil`,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: `${title} — ${ownerName}`,
      description,
      url: pageUrl,
      siteName: 'Sokil',
      type: 'website',
      locale: toOgLocale(lang),
      alternateLocale: alternateOgLocales(lang),
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — ${ownerName}`,
      description,
      images: [imageUrl],
    },
  };
}

export function buildProgressShareMetadata(
  progress: PublicProgressShareDto,
  lang: string,
  siteUrl: string,
  t: ServerTranslate,
): Metadata {
  const ownerName = displayName(progress.owner);
  const pageUrl = `${siteUrl}/${lang}/archers/${progress.owner.id}/progress`;
  const description = `${t('progressShare.shareText', {
    earned: progress.earnedCount,
    total: progress.totalCount,
  })} (${progress.percent}%)`;
  const shareTitle = t('progressShare.shareTitle', { name: ownerName });
  const imageUrl = resolveOgImageUrl(progress.owner.picture, siteUrl);

  return {
    title: `${t('userAchievements.title', { name: ownerName })} · ${progress.percent}% | Sokil`,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: shareTitle,
      description,
      url: pageUrl,
      siteName: 'Sokil',
      type: 'website',
      locale: toOgLocale(lang),
      alternateLocale: alternateOgLocales(lang),
      images: [{ url: imageUrl, width: 1200, height: 630, alt: ownerName }],
    },
    twitter: {
      card: 'summary_large_image',
      title: shareTitle,
      description,
      images: [imageUrl],
    },
  };
}

export function buildShareNotFoundMetadata(t: ServerTranslate): Metadata {
  return {
    title: `${t('notFound.title')} | Sokil`,
    robots: { index: false, follow: false },
  };
}
