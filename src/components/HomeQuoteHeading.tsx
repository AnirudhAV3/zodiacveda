"use client";

import { useI18n } from "@/lib/i18n";

export default function HomeQuoteHeading() {
  const { t } = useI18n();
  return <h2 className="mb-8 text-center font-serif text-3xl text-slate-200">{t("quotesTitle")}</h2>;
}
