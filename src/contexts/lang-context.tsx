'use client';

import { createContext, useContext, type ReactNode } from 'react';

import { type AppLanguage, normalizeAppLang } from '../utils/i18n-lang';

const LangContext = createContext<AppLanguage>('pt');

interface LangProviderProps {
  lang: string;
  children: ReactNode;
}

export function LangProvider({ lang, children }: LangProviderProps) {
  const appLang = normalizeAppLang(lang);
  return <LangContext.Provider value={appLang}>{children}</LangContext.Provider>;
}

export function useAppLang(): AppLanguage {
  return useContext(LangContext);
}
