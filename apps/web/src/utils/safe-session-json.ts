export const RETURN_URL_KEY = 'returnUrl';
export const PENDING_APPLICATION_KEY = 'pendingApplication';

export interface PendingApplication {
  tournamentId: string;
  redirectTo: string;
}

/** Relative in-app path only — blocks open redirects. */
export function isSafeRelativePath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//') && !path.includes('://');
}

export function isPendingApplication(value: unknown): value is PendingApplication {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.tournamentId === 'string' &&
    typeof record.redirectTo === 'string' &&
    isSafeRelativePath(record.redirectTo)
  );
}

export function getSessionJson<T>(key: string, validate: (value: unknown) => value is T): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!validate(parsed)) {
      sessionStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    sessionStorage.removeItem(key);
    return null;
  }
}

export function setSessionJson(key: string, value: unknown): void {
  sessionStorage.setItem(key, JSON.stringify(value));
}

export function removeSessionItem(key: string): void {
  sessionStorage.removeItem(key);
}

export function setReturnUrl(url: string): void {
  if (isSafeRelativePath(url)) {
    sessionStorage.setItem(RETURN_URL_KEY, url);
  }
}

export function getAndClearReturnUrl(): string | null {
  const url = sessionStorage.getItem(RETURN_URL_KEY);
  sessionStorage.removeItem(RETURN_URL_KEY);
  if (url && isSafeRelativePath(url)) return url;
  return null;
}

export function setPendingApplication(data: PendingApplication): void {
  if (isPendingApplication(data)) {
    setSessionJson(PENDING_APPLICATION_KEY, data);
  }
}

export function getPendingApplication(): PendingApplication | null {
  return getSessionJson(PENDING_APPLICATION_KEY, isPendingApplication);
}

export function getAndClearPendingApplication(): PendingApplication | null {
  const data = getPendingApplication();
  if (data) removeSessionItem(PENDING_APPLICATION_KEY);
  return data;
}
