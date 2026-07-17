import { useCallback, useEffect, useState } from 'react';

const PWA_DISMISS_KEY = 'pwa-install-dismissed';
const PWA_DISMISS_DAYS = 7;

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

function wasDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(PWA_DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (Number.isNaN(ts)) return false;
    const days = (Date.now() - ts) / (24 * 60 * 60 * 1000);
    return days < PWA_DISMISS_DAYS;
  } catch {
    return false;
  }
}

export function setInstallDismissed(): void {
  try {
    localStorage.setItem(PWA_DISMISS_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
  // Drop the captured prompt so Chrome stops waiting for prompt().
  setSharedDeferredPrompt(null);
}

/** Shared across hook instances so only one listener captures the install event. */
let sharedDeferredPrompt: BeforeInstallPromptEvent | null = null;
const deferredPromptListeners = new Set<(event: BeforeInstallPromptEvent | null) => void>();

function setSharedDeferredPrompt(event: BeforeInstallPromptEvent | null): void {
  sharedDeferredPrompt = event;
  for (const listener of deferredPromptListeners) {
    listener(event);
  }
}

function ensureBeforeInstallListener(): void {
  if (typeof window === 'undefined') return;
  const w = window as Window & { __pwaBeforeInstallBound?: boolean };
  if (w.__pwaBeforeInstallBound) return;
  w.__pwaBeforeInstallBound = true;

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    // Skip custom UI if already installed or user dismissed recently — let the
    // browser keep its default handling instead of capturing a prompt we won't show.
    if (isStandalone() || wasDismissedRecently()) {
      return;
    }
    e.preventDefault();
    setSharedDeferredPrompt(e as BeforeInstallPromptEvent);
  });
}

export function usePWAInstall(): {
  canInstall: boolean;
  isInstalled: boolean;
  dismissedRecently: boolean;
  prompt: () => Promise<boolean>;
} {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => sharedDeferredPrompt,
  );
  // Defer browser-only checks to useEffect so SSR and first client paint match.
  const [installed, setInstalled] = useState(false);
  const [dismissedRecently, setDismissedRecently] = useState(false);

  useEffect(() => {
    ensureBeforeInstallListener();
    setDeferredPrompt(sharedDeferredPrompt);

    const onChange = (event: BeforeInstallPromptEvent | null) => {
      setDeferredPrompt(event);
    };
    deferredPromptListeners.add(onChange);
    return () => {
      deferredPromptListeners.delete(onChange);
    };
  }, []);

  useEffect(() => {
    setInstalled(isStandalone());
    setDismissedRecently(wasDismissedRecently());
  }, []);

  const prompt = useCallback(async (): Promise<boolean> => {
    const current = sharedDeferredPrompt;
    if (!current) return false;
    try {
      await current.prompt();
      const { outcome } = await current.userChoice;
      setSharedDeferredPrompt(null);
      return outcome === 'accepted';
    } catch {
      setSharedDeferredPrompt(null);
      return false;
    }
  }, []);

  return {
    canInstall: !!deferredPrompt,
    isInstalled: installed,
    dismissedRecently,
    prompt,
  };
}
