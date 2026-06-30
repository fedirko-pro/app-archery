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
}

export function usePWAInstall(): {
  canInstall: boolean;
  isInstalled: boolean;
  dismissedRecently: boolean;
  prompt: () => Promise<boolean>;
} {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone());
  const [dismissedRecently, setDismissedRecently] = useState(wasDismissedRecently());

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  useEffect(() => {
    setInstalled(isStandalone());
    setDismissedRecently(wasDismissedRecently());
  }, []);

  const prompt = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      return outcome === 'accepted';
    } catch {
      return false;
    }
  }, [deferredPrompt]);

  return {
    canInstall: !!deferredPrompt,
    isInstalled: installed,
    dismissedRecently,
    prompt,
  };
}
