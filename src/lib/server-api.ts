import type { PublicAchievementShareDto, PublicProfileDto, TournamentDto } from '@/services/types';

/** Absolute API base URL for server-side fetches (dev proxy `/api` is client-only). */
export function getServerApiBaseUrl(): string {
  const publicUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (publicUrl?.startsWith('http')) {
    return publicUrl.replace(/\/$/, '');
  }
  return (process.env.API_INTERNAL_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export async function fetchTournamentForMetadata(id: string): Promise<TournamentDto | null> {
  try {
    const response = await fetch(`${getServerApiBaseUrl()}/tournaments/${id}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as TournamentDto;
  } catch {
    return null;
  }
}

export async function fetchPublicProfileForMetadata(
  userId: string,
): Promise<PublicProfileDto | null> {
  try {
    const response = await fetch(`${getServerApiBaseUrl()}/users/public/${userId}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 },
    });

    if (response.status === 404 || !response.ok) {
      return null;
    }

    return (await response.json()) as PublicProfileDto;
  } catch {
    return null;
  }
}

export async function fetchAchievementShareForMetadata(
  userId: string,
  achievementId: string,
): Promise<PublicAchievementShareDto | null> {
  try {
    const response = await fetch(
      `${getServerApiBaseUrl()}/users/public/${userId}/achievements/${achievementId}`,
      {
        headers: { Accept: 'application/json' },
        next: { revalidate: 60 },
      },
    );

    if (response.status === 404 || !response.ok) {
      return null;
    }

    return (await response.json()) as PublicAchievementShareDto;
  } catch {
    return null;
  }
}
