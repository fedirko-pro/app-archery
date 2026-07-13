import { afterEach, describe, expect, it } from 'vitest';

import {
  PENDING_APPLICATION_KEY,
  RETURN_URL_KEY,
  getAndClearPendingApplication,
  getAndClearReturnUrl,
  getPendingApplication,
  getSessionJson,
  isPendingApplication,
  isSafeRelativePath,
  setPendingApplication,
  setReturnUrl,
} from './safe-session-json';

describe('safe-session-json', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  describe('isSafeRelativePath', () => {
    it('accepts relative in-app paths', () => {
      expect(isSafeRelativePath('/en/signin')).toBe(true);
      expect(isSafeRelativePath('/en/tournaments/1/apply')).toBe(true);
    });

    it('rejects absolute and protocol-relative URLs', () => {
      expect(isSafeRelativePath('//evil.com')).toBe(false);
      expect(isSafeRelativePath('https://evil.com')).toBe(false);
      expect(isSafeRelativePath('signin')).toBe(false);
    });
  });

  describe('returnUrl', () => {
    it('stores and clears a safe return URL', () => {
      setReturnUrl('/en/profile');
      expect(getAndClearReturnUrl()).toBe('/en/profile');
      expect(sessionStorage.getItem(RETURN_URL_KEY)).toBeNull();
    });

    it('ignores unsafe return URLs', () => {
      setReturnUrl('https://evil.com');
      expect(sessionStorage.getItem(RETURN_URL_KEY)).toBeNull();
    });
  });

  describe('pendingApplication', () => {
    it('stores and clears valid pending application data', () => {
      setPendingApplication({
        tournamentId: 't1',
        redirectTo: '/en/tournaments/t1/apply',
      });
      expect(getPendingApplication()).toEqual({
        tournamentId: 't1',
        redirectTo: '/en/tournaments/t1/apply',
      });
      expect(getAndClearPendingApplication()).toEqual({
        tournamentId: 't1',
        redirectTo: '/en/tournaments/t1/apply',
      });
      expect(sessionStorage.getItem(PENDING_APPLICATION_KEY)).toBeNull();
    });

    it('clears corrupt pending application JSON', () => {
      sessionStorage.setItem(PENDING_APPLICATION_KEY, '{not json');
      expect(getPendingApplication()).toBeNull();
      expect(sessionStorage.getItem(PENDING_APPLICATION_KEY)).toBeNull();
    });

    it('clears invalid pending application shape', () => {
      sessionStorage.setItem(
        PENDING_APPLICATION_KEY,
        JSON.stringify({ tournamentId: 't1', redirectTo: 'https://evil.com' }),
      );
      expect(getPendingApplication()).toBeNull();
      expect(sessionStorage.getItem(PENDING_APPLICATION_KEY)).toBeNull();
    });
  });

  describe('getSessionJson', () => {
    it('validates parsed values', () => {
      sessionStorage.setItem('test', JSON.stringify({ ok: true }));
      const result = getSessionJson('test', (v): v is { ok: boolean } => {
        return typeof v === 'object' && v !== null && (v as { ok: boolean }).ok === true;
      });
      expect(result).toEqual({ ok: true });
    });
  });

  describe('isPendingApplication', () => {
    it('validates shape', () => {
      expect(
        isPendingApplication({
          tournamentId: '1',
          redirectTo: '/en/tournaments/1/apply',
        }),
      ).toBe(true);
      expect(isPendingApplication({ tournamentId: '1' })).toBe(false);
    });
  });
});
