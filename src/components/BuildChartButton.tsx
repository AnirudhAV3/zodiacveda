"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { allLanguages, type LanguageCode } from "@/lib/i18n/languages";
import { useLanguage } from "@/components/LanguageProvider";

function scrollToCalculators() {
  const target = document.getElementById("calculators");
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  if (location.hash !== "#calculators") history.replaceState(null, "", "#calculators");
}

export default function BuildChartButton({ variant }: { variant: "nav" | "hero" }) {
  const { language, setCode } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const languages = useMemo(() => allLanguages(), []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    searchRef.current?.focus();
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return languages;
    return languages.filter((l) =>
      l.code.includes(q) || l.english.toLowerCase().includes(q) || l.native.toLowerCase().includes(q),
    );
  }, [languages, query]);

  const pick = (code: LanguageCode) => {
    setCode(code);
    setOpen(false);
    setQuery("");
  };

  const hero = variant === "hero";
  const shell = hero
    ? "group relative inline-flex items-stretch overflow-visible rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-lg font-semibold text-slate-950 shadow-[0_10px_40px_rgba(249,115,22,0.45)]"
    : "relative inline-flex items-stretch overflow-visible rounded-full border border-amber-400/40 text-sm text-amber-200";

  const mainBtn = hero
    ? "inline-flex items-center gap-2 px-5 py-4 sm:px-7"
    : "inline-flex items-center gap-1.5 px-4 py-2";

  const split = hero ? "border-l border-slate-950/15" : "border-l border-amber-400/30";

  return (
    <div ref={root} className={shell}>
      <button type="button" onClick={scrollToCalculators} className={`${mainBtn} transition hover:brightness-105`}>
        {hero && <span className="glyph text-xl">✦</span>}
        <span>Build Chart in {language.native === language.english ? language.english : language.native}</span>
      </button>
      <button
        type="button"
        aria-label="Choose language"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`${split} ${hero ? "px-3 py-4" : "px-2.5 py-2"} font-bold tracking-tight`}
      >
        ▾
      </button>
      <button type="button" aria-label="Go to calculators" onClick={scrollToCalculators} className={`${split} ${hero ? "px-4 py-4" : "px-3 py-2"} transition group-hover:translate-x-0.5`}>
        →
      </button>

      {open && (
        <div className={`absolute ${hero ? "left-0 top-[calc(100%+10px)] w-[min(22rem,calc(100vw-2rem))]" : "right-0 top-[calc(100%+10px)] w-[min(20rem,calc(100vw-2rem))]"} z-50 rounded-2xl border border-slate-600/60 bg-slate-950/95 p-3 text-left shadow-2xl backdrop-blur-md`}>
          <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300">Languages of the world</p>
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any language…"
            className="input mb-2 text-sm"
            aria-label="Search languages"
          />
          <ul role="listbox" className="scroll-thin max-h-72 overflow-y-auto">
            {filtered.length === 0 && <li className="px-3 py-4 text-center text-sm text-slate-500">No language matches.</li>}
            {filtered.map((l) => (
              <li key={l.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={l.code === language.code}
                  onClick={() => pick(l.code)}
                  className={`flex w-full items-baseline justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-amber-400/10 ${l.code === language.code ? "bg-amber-400/15 text-amber-100" : "text-slate-200"}`}
                >
                  <span>
                    <span className="font-medium">{l.native}</span>
                    {l.native !== l.english && <span className="ml-2 text-xs text-slate-500">{l.english}</span>}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] uppercase text-slate-500">{l.code}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="px-1 pt-2 text-[11px] text-slate-500">{languages.length} languages · ISO 639-1</p>
        </div>
      )}
    </div>
  );
}
