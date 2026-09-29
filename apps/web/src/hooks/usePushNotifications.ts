import { useCallback, useEffect, useState } from 'react';

import apiService from '../services/api';

export type PushOptInStatus =
  | 'loading'
  | 'subscribed'
  | 'idle'
  | 'denied'
  | 'ios-install'
  | 'unsupported'
  | 'disabled'
  | 'error';

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let index = 0; index < raw.length; index++) {
    output[index] = raw.charCodeAt(index);
  }
  return output;
}

function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function usePushNotifications() {
  const [status, setStatus] = useState<PushOptInStatus>('loading');
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      const { publicKey: key } = await apiService.getPushPublicKey();
      setPublicKey(key);
      if (!key) {
        setStatus('disabled');
        return;
      }
      if (isIos() && !isStandalone()) {
        setStatus('ios-install');
        return;
      }
      if (
        !('serviceWorker' in navigator) ||
        !('PushManager' in window) ||
        !('Notification' in window)
      ) {
        setStatus('unsupported');
        return;
      }
      if (Notification.permission === 'denied') {
        setStatus('denied');
        return;
      }

      const registration = await navigator.serviceWorker.getRegistration();
      const existing = registration ? await registration.pushManager.getSubscription() : null;
      if (existing && Notification.permission === 'granted') {
        const p256dh = existing.getKey('p256dh');
        const auth = existing.getKey('auth');
        if (p256dh && auth) {
          await apiService.savePushSubscription({
            endpoint: existing.endpoint,
            p256dh: toBase64Url(p256dh),
            auth: toBase64Url(auth),
          });
        }
        setStatus('subscribed');
        return;
      }
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const enable = useCallback(async () => {
    if (!publicKey) return;
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus(permission === 'denied' ? 'denied' : 'idle');
        return;
      }
      const existingRegistration = await navigator.serviceWorker.getRegistration();
      if (!existingRegistration) {
        setStatus('unsupported');
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });
      const p256dh = subscription.getKey('p256dh');
      const auth = subscription.getKey('auth');
      if (!p256dh || !auth) {
        setStatus('error');
        return;
      }
      await apiService.savePushSubscription({
        endpoint: subscription.endpoint,
        p256dh: toBase64Url(p256dh),
        auth: toBase64Url(auth),
      });
      setStatus('subscribed');
    } catch {
      setStatus('error');
    } finally {
      setBusy(false);
    }
  }, [publicKey]);

  const disable = useCallback(async () => {
    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const existing = registration ? await registration.pushManager.getSubscription() : null;
      if (existing) {
        const endpoint = existing.endpoint;
        await existing.unsubscribe();
        await apiService.deletePushSubscription(endpoint);
      }
      setStatus('idle');
    } catch {
      setStatus('error');
    } finally {
      setBusy(false);
    }
  }, []);

  return { status, busy, enable, disable };
}
