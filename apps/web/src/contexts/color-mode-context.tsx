'use client';

import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type ColorMode = 'light' | 'dark';

const STORAGE_KEY = 'sokil_color_mode';

interface ColorModeContextValue {
  mode: ColorMode;
  setMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextValue | undefined>(undefined);

function isColorMode(value: string | null): value is ColorMode {
  return value === 'light' || value === 'dark';
}

function applyDocumentTheme(mode: ColorMode): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = mode;
}

export function ColorModeProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [mode, setModeState] = useState<ColorMode>('light');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isColorMode(stored)) {
      setModeState(stored);
      applyDocumentTheme(stored);
    } else {
      applyDocumentTheme('light');
    }
  }, []);

  const setMode = useCallback((next: ColorMode) => {
    setModeState(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyDocumentTheme(next);
  }, []);

  const toggleColorMode = useCallback(() => {
    setModeState((prev) => {
      const next: ColorMode = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem(STORAGE_KEY, next);
      applyDocumentTheme(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ mode, setMode, toggleColorMode }),
    [mode, setMode, toggleColorMode],
  );

  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>;
}

export function useColorMode(): ColorModeContextValue {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error('useColorMode must be used within a ColorModeProvider');
  }
  return context;
}
