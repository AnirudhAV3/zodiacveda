"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, isLanguageCode, languageOption, type LanguageCode, type LanguageOption } from "@/lib/i18n/languages";

const listeners = new Set<() => void>();
let currentLanguage = DEFAULT_LANGUAGE;

const LanguageContext = createContext<{
  code: LanguageCode;
  language: LanguageOption;
  setCode: (code: LanguageCode) => void;
} | null>(null);

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== LANGUAGE_STORAGE_KEY && event.key !== null) return;
    currentLanguage = event.newValue && isLanguageCode(event.newValue)
      ? event.newValue
      : DEFAULT_LANGUAGE;
    onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): LanguageCode {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && isLanguageCode(saved)) currentLanguage = saved;
  } catch { /* private mode */ }
  return currentLanguage;
}

function getServerSnapshot() {
  return DEFAULT_LANGUAGE;
}

function setLanguage(code: LanguageCode) {
  currentLanguage = code;
  try { localStorage.setItem(LANGUAGE_STORAGE_KEY, code); } catch { /* private mode */ }
  for (const listener of listeners) listener();
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const code = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = code;
  }, [code]);

  const value = useMemo(() => ({
    code,
    language: languageOption(code),
    setCode: setLanguage,
  }), [code]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
