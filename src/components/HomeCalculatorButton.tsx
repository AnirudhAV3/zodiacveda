"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useLanguage, type SupportedLanguage } from "@/components/LanguageProvider";

function scrollToCalculators() {
  const target = document.getElementById("calculators");
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  if (location.hash !== "#calculators") history.replaceState(null, "", "#calculators");
}

function nativeName(language: SupportedLanguage) {
  try {
    return new Intl.DisplayNames([language.code], { type: "language" }).of(language.code) ?? language.name;
  } catch {
    return language.name;
  }
}

export default function HomeCalculatorButton({
  className,
  hero = false,
}: {
  className: string;
  hero?: boolean;
}) {
  const { languageCode, languageName, setLanguageCode, translationStatus } = useLanguage();
  const [open, setOpen] = useState(false);
  const [languages, setLanguages] = useState<SupportedLanguage[]>([]);
  const [loadError, setLoadError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [confirming, setConfirming] = useState<SupportedLanguage | null>(null);
  const [search, setSearch] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onDocumentClick = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setConfirming(null);
      }
    };
    document.addEventListener("mousedown", onDocumentClick);
    document.addEventListener("keydown", onKeyDown);
    searchRef.current?.focus();
    return () => {
      document.removeEventListener("mousedown", onDocumentClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open || languages.length > 0) return;
    const controller = new AbortController();
    fetch("/api/translation/languages", { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json() as { languages?: SupportedLanguage[]; error?: string };
        if (!response.ok) throw new Error(result.error ?? "Could not load supported languages.");
        if (!Array.isArray(result.languages)) throw new Error("The translation service returned an invalid language list.");
        setLanguages(result.languages);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setLoadError(error instanceof Error ? error.message : "Could not load supported languages.");
        }
      });
    return () => controller.abort();
  }, [languages.length, open, retryCount]);

  const filteredLanguages = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase();
    if (!normalized) return languages;
    return languages.filter((item) =>
      item.name.toLocaleLowerCase().includes(normalized)
      || nativeName(item).toLocaleLowerCase().includes(normalized)
      || item.code.toLocaleLowerCase().includes(normalized),
    );
  }, [languages, search]);

  const chooseLanguage = (item: SupportedLanguage) => {
    setOpen(false);
    if (item.code === languageCode) return;
    if (item.code === "en") {
      setLanguageCode(item.code);
      return;
    }
    setConfirming(item);
  };

  return (
    <>
      <div ref={root} className={`relative inline-flex items-stretch overflow-visible rounded-full ${className}`}>
        <button
          type="button"
          aria-label={`Build Chart in ${languageName}`}
          onClick={scrollToCalculators}
          className={`inline-flex items-center gap-2 transition hover:brightness-105 ${hero ? "px-4 py-4 sm:px-6" : "px-4 py-2"}`}
        >
          {hero && <span className="glyph text-xl" aria-hidden="true">✦</span>}
          <span>Build Chart in {languageName}</span>
        </button>
        <button
          type="button"
          aria-label={`Choose language; current language is ${languageName}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((value) => !value)}
          className={`border-l border-current/20 font-bold ${hero ? "px-3 py-4" : "px-3 py-2"}`}
        >
          <span aria-hidden="true">⌄</span>
        </button>
        <button
          type="button"
          aria-label="Go to calculators"
          onClick={scrollToCalculators}
          className={`border-l border-current/20 transition hover:translate-x-0.5 ${hero ? "px-4 py-4" : "px-3 py-2"}`}
        >
          <span aria-hidden="true">→</span>
        </button>

        {open && (
          <div className={`absolute top-[calc(100%+10px)] z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-slate-600/60 bg-slate-950/95 p-3 text-left text-slate-200 shadow-2xl backdrop-blur-md ${hero ? "left-0" : "right-0"}`}>
            <label htmlFor={`${listId}-search`} className="mb-2 block px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300">
              Search languages
            </label>
            <input
              ref={searchRef}
              id={`${listId}-search`}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by language or code"
              className="input mb-2 text-sm"
            />
            <ul id={listId} role="listbox" aria-label="Google Cloud Translation languages" className="scroll-thin max-h-64 overflow-y-auto">
              {open && languages.length === 0 && !loadError && <li role="status" className="px-3 py-4 text-center text-sm text-slate-400">Loading supported languages…</li>}
              {!loadError && filteredLanguages.map((item) => (
                <li key={item.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={item.code === languageCode}
                    onClick={() => chooseLanguage(item)}
                    className={`flex w-full items-baseline justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-amber-400/10 ${item.code === languageCode ? "bg-amber-400/15 text-amber-100" : "text-slate-200"}`}
                  >
                    <span>
                      <span className="font-medium">{item.name}</span>
                      {nativeName(item) !== item.name && <span className="ml-2 text-xs text-slate-400">{nativeName(item)}</span>}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] uppercase text-slate-500">{item.code}</span>
                  </button>
                </li>
              ))}
              {!loadError && languages.length > 0 && filteredLanguages.length === 0 && (
                <li className="px-3 py-4 text-center text-sm text-slate-500">No languages match your search.</li>
              )}
            </ul>
            {loadError && (
              <div role="alert" className="space-y-2 px-2 py-3 text-sm text-rose-200">
                <p>{loadError}</p>
                <button type="button" onClick={() => { setLoadError(""); setRetryCount((count) => count + 1); }} className="font-semibold text-amber-300 underline">
                  Try again
                </button>
              </div>
            )}
            <p className="px-1 pt-2 text-[11px] text-slate-400">
              Translations are provided by Google Cloud. Visible page text, including chart and report details, is sent for translation.
            </p>
            {translationStatus && <p role="status" className="px-1 pt-2 text-xs text-amber-200">{translationStatus}</p>}
          </div>
        )}
      </div>

      {confirming && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-labelledby={`${listId}-consent-title`} className="card w-full max-w-md space-y-4 p-6">
            <h2 id={`${listId}-consent-title`} className="font-serif text-2xl text-slate-100">Translate this page?</h2>
            <p className="text-sm leading-6 text-slate-300">
              Google Cloud Translation will process visible page text, including any personal details shown in horoscope charts and reports, to translate it into {confirming.name}.
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setConfirming(null)} className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-200">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { setLanguageCode(confirming.code); setConfirming(null); }}
                className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950"
              >
                Translate page
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
