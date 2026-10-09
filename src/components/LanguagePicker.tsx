"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LANGUAGES, LANG_KEY } from "@/lib/languages";

export default function LanguagePicker() {
  const [code, setCode] = useState("en");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [translationStatus, setTranslationStatus] = useState("");
  const picker = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const current = LANGUAGES.find((language) => language.code === code) ?? LANGUAGES[0];

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    if (!term) return LANGUAGES;
    return LANGUAGES.filter((language) =>
      `${language.name} ${language.native} ${language.code}`.toLocaleLowerCase().includes(term),
    );
  }, [query]);

  useEffect(() => {
    let stored = "en";
    try {
      stored = localStorage.getItem(LANG_KEY) ?? "en";
    } catch {
      stored = "en";
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Restore the saved language preference after hydration.
    setCode(LANGUAGES.some((language) => language.code === stored) ? stored : "en");
    document.documentElement.lang = LANGUAGES.some((language) => language.code === stored) ? stored : "en";
  }, []);

  useEffect(() => {
    const onStatus = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.language === code) {
        setTranslationStatus(event.detail.status === "error" ? event.detail.message ?? "Translation failed." : "");
      }
    };
    window.addEventListener("zv-translation-status", onStatus);
    return () => window.removeEventListener("zv-translation-status", onStatus);
  }, [code]);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!picker.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    if (open) search.current?.focus();
  }, [open]);

  const choose = (next: string) => {
    setCode(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      // Keep the selection active for this page even if browser storage is disabled.
    }
    document.documentElement.lang = next;
    window.dispatchEvent(new CustomEvent("zv-lang", { detail: next }));
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={picker} className="relative" data-no-translate="">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Choose language. Current language: ${current.name}`}
        className="inline-flex max-w-44 items-center gap-2 rounded-full border border-amber-400/40 bg-[#0b0a1f]/80 px-3 py-2 text-sm text-amber-100 outline-none transition hover:bg-amber-400/10 focus:border-amber-300 sm:px-4"
      >
        <span aria-hidden="true">🌐</span>
        <span className="truncate">{current.native}</span>
        <svg viewBox="0 0 12 12" aria-hidden="true" className={`h-3 w-3 shrink-0 transition ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <section
          role="dialog"
          aria-label="Choose a language"
          className="absolute right-0 z-[60] mt-2 w-[min(22rem,90vw)] overflow-hidden rounded-2xl border border-white/15 bg-[#0b0a1f]/[.98] shadow-[0_20px_60px_rgba(0,0,0,0.65)] backdrop-blur-xl"
        >
          <div className="border-b border-white/10 p-3">
            <label htmlFor="language-search" className="sr-only">Search languages</label>
            <input
              ref={search}
              id="language-search"
              type="search"
              value={query}
              onChange={(event) => { setQuery(event.target.value); setActive(0); }}
              onKeyDown={(event) => {
                if (event.key === "Escape") setOpen(false);
                if (event.key === "ArrowDown") { event.preventDefault(); setActive((index) => Math.min(filtered.length - 1, index + 1)); }
                if (event.key === "ArrowUp") { event.preventDefault(); setActive((index) => Math.max(0, index - 1)); }
                if (event.key === "Enter" && filtered[active]) { event.preventDefault(); choose(filtered[active].code); }
              }}
              placeholder="Search by language or code…"
              autoComplete="off"
              className="input"
            />
            <p className="mt-2 text-[11px] text-slate-500">
              {query ? `${filtered.length} matches` : `${LANGUAGES.length} searchable languages`}
            </p>
            {translationStatus && (
              <p role="status" className="mt-2 text-xs text-amber-200">{translationStatus}</p>
            )}
          </div>
          <ul role="listbox" aria-label="Languages" className="scroll-thin max-h-[min(60vh,24rem)] overflow-y-auto p-1">
            {filtered.map((language, index) => (
              <li key={language.code} role="option" aria-selected={language.code === code}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(language.code)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${index === active ? "bg-amber-400/15 text-amber-100" : "text-slate-200 hover:bg-white/5"}`}
                >
                  <span className="min-w-0 truncate">{language.native}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-slate-400">{language.name}</span>
                    {language.code === code && <span className="text-amber-300" aria-label="Selected">✓</span>}
                  </span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && <li className="px-3 py-6 text-center text-sm text-slate-400">No languages found. Try another name or code.</li>}
          </ul>
          <p className="border-t border-white/10 px-3 py-2 text-[11px] leading-relaxed text-slate-500">
            All {LANGUAGES.length} languages remain listed. Actual translation depends on models installed on this site&apos;s self-hosted translator. Page and report text you view is sent to that service.
          </p>
        </section>
      )}
    </div>
  );
}
