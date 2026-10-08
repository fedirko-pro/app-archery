import type { Metadata } from 'next';

import type { TournamentDto } from '@/services/types';
import { formatDate } from '@/utils/date-utils';
import { isExternalPlaceholderUrl } from '@/utils/placeholder-images';
import { alternateOgLocales, toOgLocale } from './og-locale';
import { toAbsoluteImageUrl } from './share-og-image';

export const DEFAULT_OG_IMAGE_PATH = '/og/default-tournament-banner.png';
export const TOURNAMENT_BANNER_OG_WIDTH = 1200;
export const TOURNAMENT_BANNER_OG_HEIGHT = 400;

const BANNER_WEBP_PATH = /\/uploads\/images\/banners\/([A-Za-z0-9._-]+)\.webp$/i;
const HTTP_URL = /https?:\/\/[^\s<>"']+/gi;

function buildDescriptionFallback(tournament: TournamentDto): string {
  const parts: string[] = [];
  const start = formatDate(tournament.startDate);
  const end = formatDate(tournament.endDate);
  if (start && start !== 'Invalid date') {
    parts.push(start === end ? start : `${start} – ${end}`);
  }
  if (tournament.address) {
    parts.push(tournament.address);
  }
  return parts.join(' · ') || tournament.title;
}

export function descriptionForLinkPreview(text: string): string {
  return text
    .replace(HTTP_URL, '')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function toBannerJpegUrl(bannerUrl: string): string | null {
  try {
    const parsed = new URL(bannerUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return null;
    }
    const match = parsed.pathname.match(BANNER_WEBP_PATH);
    if (!match) {
      return null;
    }
    return `${parsed.origin}/tournaments/${match[1]}/og-image.jpg`;
  } catch {
    return null;
  }
}

function resolveOgImage(
  tournament: TournamentDto,
  siteUrl: string,
): { url: string; width: number; height: number; type: string } {
  const banner = tournament.banner;
  if (banner && !isExternalPlaceholderUrl(banner)) {
    const absolute = toAbsoluteImageUrl(banner, siteUrl);
    const jpeg = toBannerJpegUrl(absolute);
    if (jpeg) {
      return {
        url: jpeg,
        width: TOURNAMENT_BANNER_OG_WIDTH,
        height: TOURNAMENT_BANNER_OG_HEIGHT,
        type: 'image/jpeg',
      };
    }
    return {
      url: absolute,
      width: TOURNAMENT_BANNER_OG_WIDTH,
      height: TOURNAMENT_BANNER_OG_HEIGHT,
      type: /\.png(?:$|\?)/i.test(absolute) ? 'image/png' : 'image/jpeg',
    };
  }
  return {
    url: new URL(DEFAULT_OG_IMAGE_PATH, siteUrl).toString(),
    width: 400,
    height: 400,
    type: 'image/png',
  };
}

export function resolveSiteUrl(headersList: Headers): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  const host = headersList.get('x-forwarded-host') || headersList.get('host') || 'localhost:3001';
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  return `${protocol}://${host}`;
}

export function buildTournamentMetadata(
  tournament: TournamentDto,
  lang: string,
  siteUrl: string,
): Metadata {
  const pageUrl = `${siteUrl}/${lang}/tournaments/${tournament.id}`;
  const rawDescription = tournament.shortDescription?.trim() ?? '';
  const fromDescription = rawDescription ? descriptionForLinkPreview(rawDescription) : '';
  const description = fromDescription || buildDescriptionFallback(tournament);
  const image = resolveOgImage(tournament, siteUrl);

  return {
    title: `${tournament.title} | Sokil`,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: tournament.title,
      description,
      url: pageUrl,
      siteName: 'Sokil',
      type: 'website',
      locale: toOgLocale(lang),
      alternateLocale: alternateOgLocales(lang),
      images: [
        {
          url: image.url,
          width: image.width,
          height: image.height,
          alt: tournament.title,
          type: image.type,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: tournament.title,
      description,
      images: [image.url],
    },
  };
}

export function buildTournamentNotFoundMetadata(): Metadata {
  return {
    title: 'Tournament not found | Sokil',
    robots: { index: false, follow: false },
  };
}
