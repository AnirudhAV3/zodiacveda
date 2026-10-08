"use client";

import { REMEDY_ICON, type Remedy, type RemedyKind } from "@/lib/astro/remedies";

const KIND_ORDER: RemedyKind[] = ["Mantra", "Puja", "Fasting", "Charity", "Gemstone", "Lifestyle", "Timing"];
const KIND_CLS: Record<RemedyKind, string> = {
  Mantra: "text-amber-200",
  Puja: "text-orange-200",
  Fasting: "text-indigo-200",
  Charity: "text-emerald-200",
  Gemstone: "text-sky-200",
  Lifestyle: "text-teal-200",
  Timing: "text-violet-200",
};

export function RemedyList({ remedies, compact }: { remedies: Remedy[]; compact?: boolean }) {
  const groups = KIND_ORDER.map((k) => [k, remedies.filter((r) => r.kind === k)] as const).filter(([, v]) => v.length);
  return (
    <div className={`space-y-2 ${compact ? "text-[13px]" : "text-sm"}`}>
      {groups.map(([k, list]) => (
        <div key={k} className="flex gap-2.5">
          <span className="mt-0.5 w-24 shrink-0 font-semibold">
            <span className="mr-1">{REMEDY_ICON[k]}</span>
            <span className={KIND_CLS[k]}>{k}</span>
          </span>
          <ul className="flex-1 space-y-1 text-slate-200">
            {list.map((r, i) => (
              <li key={i}>{r.text}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

