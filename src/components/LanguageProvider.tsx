"use client";

import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";

const LANGUAGE_STORAGE_KEY = "zodiac-veda-language";
const DEFAULT_LANGUAGE = "en";
const listeners = new Set<() => void>();
let currentLanguage = DEFAULT_LANGUAGE;

function validLanguageCode(value: string | null) {
  return value && /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(value)
    ? value
    : DEFAULT_LANGUAGE;
}

export type SupportedLanguage = {
  code: string;
  name: string;
};

type LanguageContextValue = {
  languageCode: string;
  languageName: string;
  setLanguageCode: (code: string) => void;
  translationStatus: string;
  setTranslationStatus: (status: string) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== LANGUAGE_STORAGE_KEY && event.key !== null) return;
    currentLanguage = validLanguageCode(event.newValue);
    onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  try {
    currentLanguage = validLanguageCode(localStorage.getItem(LANGUAGE_STORAGE_KEY));
  } catch {
    // Keep the in-memory preference when browser storage is unavailable.
  }
  return currentLanguage;
}

function getServerSnapshot() {
  return DEFAULT_LANGUAGE;
}

function updateLanguage(code: string) {
  currentLanguage = code;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
  } catch {
    // Keep the selection for this page view when browser storage is unavailable.
  }
  for (const listener of listeners) listener();
}

type TextTranslation = {
  original: string;
  rendered: string;
  translations: Map<string, string>;
};

type TranslationUnit = {
  record: TextTranslation;
  getValue: () => string | null;
  setValue: (value: string) => void;
  isConnected: () => boolean;
};

const textRecords = new WeakMap<Text, TextTranslation>();
const attributeRecords = new WeakMap<Element, Map<string, TextTranslation>>();

function decodeTranslatedText(value: string) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

function PageTranslation({
  languageCode,
  setTranslationStatus,
}: {
  languageCode: string;
  setTranslationStatus: (status: string) => void;
}) {
  useEffect(() => {
    if (languageCode === DEFAULT_LANGUAGE) {
      document.documentElement.lang = "en";
    } else {
      document.documentElement.lang = languageCode;
    }

    const queued = new Set<TextTranslation>();
    const pending: TranslationUnit[] = [];
    const failedTexts = new Set<string>();
    const controller = new AbortController();
    let scanning = false;
    let draining = false;
    let failed = false;
    let scheduledScan: ReturnType<typeof setTimeout> | undefined;

    const addUnit = (unit: TranslationUnit) => {
      const value = unit.getValue();
      if (value === null) return;
      if (value !== unit.record.rendered) {
        unit.record.original = value;
        unit.record.rendered = value;
        unit.record.translations.clear();
      }
      if (languageCode === DEFAULT_LANGUAGE) {
        if (value !== unit.record.original) unit.setValue(unit.record.original);
        unit.record.rendered = unit.record.original;
        return;
      }
      const cached = unit.record.translations.get(languageCode);
      if (cached !== undefined) {
        if (value !== cached) unit.setValue(cached);
        unit.record.rendered = cached;
        return;
      }
      if (!value.trim() || failedTexts.has(value) || queued.has(unit.record)) return;
      queued.add(unit.record);
      pending.push(unit);
    };

    const scan = () => {
      if (scanning || !document.body) return;
      scanning = true;
      const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
      let current = walker.nextNode();
      while (current) {
        const node = current as Text;
        const parent = node.parentElement;
        if (parent && !parent.closest("script,style,noscript,svg,code,pre,input,textarea,select,[contenteditable='true'],[translate='no']")) {
          let record = textRecords.get(node);
          if (!record) {
            record = { original: node.data, rendered: node.data, translations: new Map() };
            textRecords.set(node, record);
          }
          addUnit({
            record,
            getValue: () => node.isConnected ? node.data : null,
            setValue: (value) => { node.data = value; },
            isConnected: () => node.isConnected,
          });
        }
        current = walker.nextNode();
      }

      const elements = document.querySelectorAll<HTMLElement>(
        "body *, head title, head meta[name='description'], head meta[property='og:title'], head meta[property='og:description'], head meta[name='twitter:title'], head meta[name='twitter:description']",
      );
      for (const element of elements) {
        if (element.closest("script,style,noscript,svg,code,pre,input,textarea,select,[contenteditable='true'],[translate='no']")) continue;
        for (const attribute of ["aria-label", "placeholder", "title", "alt", "content"]) {
          const value = element.getAttribute(attribute);
          if (value === null) continue;
          let records = attributeRecords.get(element);
          if (!records) {
            records = new Map();
            attributeRecords.set(element, records);
          }
          let record = records.get(attribute);
          if (!record) {
            record = { original: value, rendered: value, translations: new Map() };
            records.set(attribute, record);
          }
          addUnit({
            record,
            getValue: () => element.isConnected ? element.getAttribute(attribute) : null,
            setValue: (translated) => { element.setAttribute(attribute, translated); },
            isConnected: () => element.isConnected,
          });
        }
      }
      scanning = false;
      void drain();
    };

    const drain = async () => {
      if (draining || failed || languageCode === DEFAULT_LANGUAGE) return;
      draining = true;
      try {
        while (pending.length > 0 && !controller.signal.aborted && !failed) {
          const batch: TranslationUnit[] = [];
          let characterCount = 0;
          while (pending.length > 0 && batch.length < 100) {
            const next = pending[0];
            const text = next.record.original;
            if (batch.length > 0 && characterCount + text.length > 8_000) break;
            pending.shift();
            batch.push(next);
            characterCount += text.length;
          }
          if (batch.length === 0) break;

          try {
            setTranslationStatus("Translating visible page text…");
            const response = await fetch("/api/translation", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ target: languageCode, texts: batch.map((unit) => unit.record.original) }),
              signal: controller.signal,
            });
            const result = await response.json() as { translations?: string[]; error?: string };
            if (!response.ok) throw new Error(result.error || "Translation request failed.");
            if (!Array.isArray(result.translations) || result.translations.length !== batch.length) {
              throw new Error("The translation service returned an incomplete response.");
            }
            batch.forEach((unit, index) => {
              const translated = decodeTranslatedText(result.translations![index]);
              unit.record.translations.set(languageCode, translated);
              const current = unit.getValue();
              if (unit.isConnected() && current === unit.record.original && current !== translated) {
                unit.setValue(translated);
              }
              unit.record.rendered = translated;
            });
          } catch (error) {
            if (controller.signal.aborted) return;
            failed = true;
            for (const unit of batch) {
              failedTexts.add(unit.record.original);
              queued.delete(unit.record);
            }
            setTranslationStatus(error instanceof Error
              ? `${error.message} The page is still available in English.`
              : "Translation failed. The page is still available in English.");
          } finally {
            for (const unit of batch) queued.delete(unit.record);
          }
        }
        if (!failed && !controller.signal.aborted) setTranslationStatus("");
      } finally {
        draining = false;
      }
    };

    const observer = new MutationObserver(() => {
      if (scheduledScan !== undefined) clearTimeout(scheduledScan);
      scheduledScan = setTimeout(scan, 80);
    });
    observer.observe(document.documentElement, { childList: true, characterData: true, subtree: true });
    scan();

    return () => {
      controller.abort();
      observer.disconnect();
      if (scheduledScan !== undefined) clearTimeout(scheduledScan);
      document.documentElement.lang = "en";
    };
  }, [languageCode, setTranslationStatus]);

  return null;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const languageCode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [translationStatus, setTranslationStatus] = useState("");
  let languageName = languageCode === DEFAULT_LANGUAGE ? "English" : languageCode;
  if (languageCode !== DEFAULT_LANGUAGE) {
    try {
      languageName = new Intl.DisplayNames(["en"], { type: "language" }).of(languageCode) ?? languageCode;
    } catch {
      languageName = languageCode;
    }
  }

  const value = useMemo<LanguageContextValue>(() => ({
    languageCode,
    languageName,
    setLanguageCode: updateLanguage,
    translationStatus,
    setTranslationStatus,
  }), [languageCode, languageName, translationStatus]);

  return (
    <LanguageContext.Provider value={value}>
      <PageTranslation languageCode={languageCode} setTranslationStatus={setTranslationStatus} />
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
