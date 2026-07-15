import { useEffect } from 'react';

let lockCount = 0;
let savedScrollY = 0;

function applyBodyScrollLock(): void {
  const body = document.body;
  savedScrollY = window.scrollY;
  body.classList.add('lock');
  body.style.overflow = 'hidden';
  body.style.position = 'fixed';
  body.style.top = `-${savedScrollY}px`;
  body.style.width = '100%';
}

function releaseBodyScrollLock(): void {
  const body = document.body;
  body.classList.remove('lock');
  body.style.removeProperty('overflow');
  body.style.removeProperty('position');
  body.style.removeProperty('top');
  body.style.removeProperty('width');
  body.style.removeProperty('padding-right');
  window.scrollTo(0, savedScrollY);
}

/** Lock body scroll while overlays/menus are open (iOS-safe). Supports nested locks. */
export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked || typeof document === 'undefined') return;

    if (lockCount === 0) {
      applyBodyScrollLock();
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount <= 0) {
        lockCount = 0;
        releaseBodyScrollLock();
      }
    };
  }, [locked]);
}
