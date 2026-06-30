export interface ArcherRouteMatch {
  userId: string;
  achievementId?: string;
}

/** Returns archer share route info for /{lang}/archers/{userId} or .../achievements/{id}. */
export function getArcherRouteFromPath(path?: string[]): ArcherRouteMatch | null {
  if (!path || path[0] !== 'archers' || !path[1]) {
    return null;
  }

  const userId = path[1];
  if (path.length === 2) {
    return { userId };
  }

  if (path.length === 4 && path[2] === 'achievements' && path[3]) {
    return { userId, achievementId: path[3] };
  }

  return null;
}
