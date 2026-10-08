"use client";

import { useState } from "react";
import type { PredictionSection } from "@/lib/astro/predictions";

export default function Predictions({ sections, initialKey }: { sections: PredictionSection[]; initialKey?: string }) {
  const [active, setActive] = useState(initialKey ?? sections[0]?.key);
  const s = sections.find((x) => x.key === active) ?? sections[0];
  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <div className="scroll-thin flex gap-2 overflow-x-auto lg:flex-col">
        {sections.map((x) => (
          <button key={x.key} onClick={() => setActive(x.key)} className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${x.key === active ? "bg-gradient-to-r from-amber-400/25 to-transparent font-semibold text-amber-200 ring-1 ring-amber-400/40" : "text-slate-300 hover:bg-white/5"}`}>
            <span className="text-lg">{x.icon}</span>
            {x.title}
          </button>
        ))}
      </div>
      <div key={s.key} className="card animate-pop p-6 sm:p-8">
        <h3 className="font-serif text-3xl font-semibold text-slate-100">
          <span className="mr-2">{s.icon}</span>
          {s.title}
        </h3>
        <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-slate-200">
          {s.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        {s.timing && s.timing.length > 0 && (
          <div className="mt-6 rounded-2xl border border-violet-400/25 bg-violet-500/5 p-5">
            <p className="label-caps !text-violet-300">Key timing windows (Mahadasha–Antardasha)</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-200">
              {s.timing.map((t, i) => (
                <li key={i}>◆ {t}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
