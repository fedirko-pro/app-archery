/** Returns tournament ID when URL is exactly /{lang}/tournaments/{id} (not create, edit, etc.). */
export function getTournamentIdFromPath(path?: string[]): string | null {
  if (!path || path[0] !== 'tournaments' || path.length !== 2) {
    return null;
  }

  const id = path[1];
  if (!id || id === 'create') {
    return null;
  }

  return id;
}
