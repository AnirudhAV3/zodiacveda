"use client";

import HomeCalculatorButton from "@/components/HomeCalculatorButton";
import { useI18n } from "@/lib/i18n";

export default function HomeIntro() {
  const { t, isEnglish } = useI18n();
  return (
    <>
      <p className="label-caps !text-amber-300">{t("heroKicker")}</p>
      <h1 className="mt-4 font-serif text-5xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl">
        <span className="text-shimmer">{t("heroTitleA")}</span>
        <br />
        <span className="text-slate-100">{t("heroTitleB")}</span>
      </h1>
      <p className="mt-6 max-w-xl text-lg text-slate-300">{t("heroBody")}</p>
      <div className="mt-9 flex flex-wrap items-center gap-4">
        <HomeCalculatorButton className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 px-9 py-4 text-lg font-semibold text-slate-950 shadow-[0_10px_40px_rgba(249,115,22,0.45)] transition hover:scale-[1.03]">
          <span className="glyph text-xl">✦</span> {t("heroCta")}
          <span className="transition group-hover:translate-x-1">→</span>
        </HomeCalculatorButton>
        <span className="text-sm text-slate-400">{t("heroNote")}</span>
      </div>
      {!isEnglish && <p className="mt-4 text-xs text-slate-500">{t("notice")}</p>}
    </>
  );
}
