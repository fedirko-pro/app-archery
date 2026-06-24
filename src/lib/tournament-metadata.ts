import type { Metadata } from 'next';

import type { TournamentDto } from '@/services/types';
import { formatDate } from '@/utils/date-utils';
import { isExternalPlaceholderUrl } from '@/utils/placeholder-images';

export const DEFAULT_OG_IMAGE_PATH = '/og/default-tournament-banner.png';

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

function resolveOgImageUrl(tournament: TournamentDto, siteUrl: string): string {
  const banner = tournament.banner;
  if (banner && !isExternalPlaceholderUrl(banner)) {
    try {
      return new URL(banner).toString();
    } catch {
      return new URL(banner, siteUrl).toString();
    }
  }
  return new URL(DEFAULT_OG_IMAGE_PATH, siteUrl).toString();
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
  const description = tournament.description?.trim() || buildDescriptionFallback(tournament);
  const imageUrl = resolveOgImageUrl(tournament, siteUrl);

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
      locale: lang,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: tournament.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: tournament.title,
      description,
      images: [imageUrl],
    },
  };
}

export function buildTournamentNotFoundMetadata(): Metadata {
  return {
    title: 'Tournament not found | Sokil',
    robots: { index: false, follow: false },
  };
}
