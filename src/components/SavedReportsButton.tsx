"use client";

import Link from "next/link";
import { useState } from "react";
import { addSavedReport, listSavedReports, removeSavedReport, type SavedReportLink } from "@/lib/saved-reports";
import { useI18n } from "@/lib/i18n";

export default function SavedReportsButton() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [reports, setReports] = useState<SavedReportLink[]>([]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) setReports(listSavedReports());
  };

  const remove = (url: string) => {
    if (removeSavedReport(url)) setReports((items) => items.filter((item) => item.url !== url));
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="saved-reports-panel"
        className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-300 transition hover:border-amber-400 hover:text-amber-100"
      >
        {t("navSaved")}
      </button>
      {open && (
        <div id="saved-reports-panel" className="absolute right-0 z-50 mt-2 w-[min(24rem,90vw)] rounded-2xl border border-white/15 bg-[#0b0a1f]/95 p-4 shadow-2xl backdrop-blur-xl">
          <h2 className="font-serif text-xl text-slate-100">{t("savedTitle")}</h2>
          {reports.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">{t("savedEmpty")}</p>
          ) : (
            <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto">
              {reports.map((report) => (
                <li key={report.url} className="flex items-center gap-2 rounded-xl border border-slate-700/70 px-3 py-2">
                  <Link href={report.url} onClick={() => setOpen(false)} className="min-w-0 flex-1 text-sm text-amber-100 hover:underline">
                    <span className="block truncate">{report.title}</span>
                    <time className="text-xs text-slate-500">{new Date(report.savedAt).toLocaleDateString()}</time>
                  </Link>
                  <button type="button" onClick={() => remove(report.url)} aria-label={`Remove ${report.title}`} className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-rose-400/10 hover:text-rose-200">Remove</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
