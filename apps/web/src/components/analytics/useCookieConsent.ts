'use client';

import { useSyncExternalStore } from 'react';

import { type ConsentState, getConsent, isConsentSettingsOpen, subscribeConsent } from './consent';

const getServerConsent = (): ConsentState | null => null;
const getServerSettingsOpen = () => false;

/** Stored consent; null during server render and hydration, so nothing flashes. */
export function useConsentState(): ConsentState | null {
  return useSyncExternalStore(subscribeConsent, getConsent, getServerConsent);
}

export function useConsentSettingsOpen(): boolean {
  return useSyncExternalStore(subscribeConsent, isConsentSettingsOpen, getServerSettingsOpen);
}
