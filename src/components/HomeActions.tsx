"use client";

import HomeCalculatorButton from "@/components/HomeCalculatorButton";
import LanguagePicker from "@/components/LanguagePicker";
import SavedReportsButton from "@/components/SavedReportsButton";
import { useI18n } from "@/lib/i18n";

export default function HomeActions() {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <LanguagePicker />
      <SavedReportsButton />
      <HomeCalculatorButton className="rounded-full border border-amber-400/40 px-5 py-2 text-sm text-amber-200 transition hover:bg-amber-400/10">
        {t("navBuild")}
      </HomeCalculatorButton>
    </div>
  );
}
