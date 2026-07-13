import env from '../config/env';
import { fetchWithTimeout } from './fetch-with-timeout';

/**
 * Best-effort reachability check. navigator.onLine alone is unreliable (lie-fi).
 */
export async function isReachable(timeoutMs = 5000): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }

  try {
    const response = await fetchWithTimeout(
      `${env.API_BASE_URL}/`,
      { method: 'GET', credentials: 'include' },
      { timeoutMs },
    );
    return response.ok || response.status < 500;
  } catch {
    return false;
  }
}
