import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import {
  buildAchievementShareMetadata,
  buildProgressShareMetadata,
  buildPublicProfileMetadata,
  buildShareNotFoundMetadata,
} from '@/lib/public-profile-metadata';
import {
  fetchAchievementShareForMetadata,
  fetchProgressShareForMetadata,
  fetchPublicProfileForMetadata,
  fetchTournamentForMetadata,
} from '@/lib/server-api';
import { getArcherRouteFromPath } from '@/lib/share-route';
import { buildSiteMetadata } from '@/lib/site-metadata';
import {
  buildTournamentMetadata,
  buildTournamentNotFoundMetadata,
  resolveSiteUrl,
} from '@/lib/tournament-metadata';
import { getTournamentIdFromPath } from '@/lib/tournament-route';
import LangCatchAllClient from './LangCatchAllClient';

interface LangCatchAllPageProps {
  params: Promise<{ lang: string; path?: string[] }>;
}

export async function generateMetadata({ params }: LangCatchAllPageProps): Promise<Metadata> {
  const { lang, path } = await params;
  const headersList = await headers();
  const siteUrl = resolveSiteUrl(headersList);

  const archerRoute = getArcherRouteFromPath(path);
  if (archerRoute) {
    if (archerRoute.achievementId) {
      const achievement = await fetchAchievementShareForMetadata(
        archerRoute.userId,
        archerRoute.achievementId,
      );
      if (!achievement) {
        return buildShareNotFoundMetadata();
      }
      return buildAchievementShareMetadata(achievement, lang, siteUrl);
    }

    if (archerRoute.progress) {
      const progress = await fetchProgressShareForMetadata(archerRoute.userId);
      if (!progress) {
        return buildShareNotFoundMetadata();
      }
      return buildProgressShareMetadata(progress, lang, siteUrl);
    }

    const profile = await fetchPublicProfileForMetadata(archerRoute.userId);
    if (!profile) {
      return buildShareNotFoundMetadata();
    }
    return buildPublicProfileMetadata(profile, lang, siteUrl);
  }

  const tournamentId = getTournamentIdFromPath(path);

  if (!tournamentId) {
    const isTournamentsList = !path || (path.length === 1 && path[0] === 'tournaments');
    if (isTournamentsList) {
      return buildSiteMetadata({
        lang,
        siteUrl,
        url: `${siteUrl}/${lang}/tournaments`,
      });
    }
    return {};
  }

  const tournament = await fetchTournamentForMetadata(tournamentId);
  if (!tournament) {
    return buildTournamentNotFoundMetadata();
  }

  return buildTournamentMetadata(tournament, lang, siteUrl);
}

export default async function LangCatchAllPage({ params }: LangCatchAllPageProps) {
  const { path } = await params;
  const tournamentId = getTournamentIdFromPath(path);

  if (tournamentId) {
    const tournament = await fetchTournamentForMetadata(tournamentId);
    if (!tournament) {
      notFound();
    }
  }

  return <LangCatchAllClient />;
}
