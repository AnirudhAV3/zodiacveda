"use client";

import { useMemo, useState } from "react";
import type { ChartData } from "@/lib/astro/calc";
import { fmtDegShort } from "@/lib/astro/calc";
import { NAKSHATRAS, PLANET_INFO, SIGNS } from "@/lib/astro/data";
import { dignityColor } from "@/lib/astro/analysis";
import { allPlanetReports, type PlanetReport } from "@/lib/astro/planetReport";

const VERDICT_CLS: Record<PlanetReport["verdict"], string> = {
  "Very Strong": "bg-emerald-500/20 text-emerald-300",
  Strong: "bg-emerald-500/10 text-emerald-300",
  Moderate: "bg-amber-500/15 text-amber-200",
  Weak: "bg-rose-500/15 text-rose-300",
  "Very Weak": "bg-rose-500/25 text-rose-300",
};

function Block({ title, tone, children }: { title: string; tone: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${tone}`}>
      <h4 className="mb-2 font-semibold">{title}</h4>
      {children}
    </div>
  );
}

function PlanetCard({ r, open, onToggle }: { r: PlanetReport; open: boolean; onToggle: () => void }) {
  const pi = PLANET_INFO[r.id];
  const p = r.p;
  return (
    <div className="card overflow-hidden">
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-white/5 sm:p-5" aria-expanded={open}>
        <span className="glyph flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl" style={{ background: `${pi.color}22`, color: pi.color }}>
          {pi.glyph + "\uFE0E"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-xl font-bold text-slate-100">{r.id}</span>
            <span className="text-sm text-slate-400">({pi.sa})</span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${VERDICT_CLS[r.verdict]}`}>{r.verdict}</span>
            <span className={`text-xs ${dignityColor(r.dignity as never)}`}>{r.dignity}</span>
            {p.retro && !["Rahu", "Ketu"].includes(r.id) && <span className="text-xs text-amber-300">Retrograde</span>}
            {p.combust && <span className="text-xs text-orange-400">Combust</span>}
          </div>
          <p className="mt-0.5 truncate text-sm text-slate-400">
            {SIGNS[p.sign].sa} {fmtDegShort(p.deg)} · House {p.house} · {NAKSHATRAS[p.nak].name} ({p.pada}) · {r.headline}
          </p>
        </div>
        <div className="hidden w-28 shrink-0 sm:block">
          <div className="h-2 overflow-hidden rounded-full bg-slate-700/60">
            <div className={`h-full rounded-full ${r.score >= 62 ? "bg-emerald-400" : r.score >= 45 ? "bg-amber-400" : "bg-rose-400"}`} style={{ width: `${r.score}%` }} />
          </div>
          <p className="mt-1 text-right text-xs text-slate-400">Strength {r.score}/100</p>
        </div>
        <span className={`text-xl text-slate-400 transition ${open ? "rotate-90" : ""}`}>›</span>
      </button>

      {open && (
        <div className="animate-pop space-y-4 border-t border-slate-700/40 p-4 sm:p-6">
          <div className="space-y-2 text-[15px] leading-relaxed text-slate-200">
            {r.summary.map((s, i) => (
              <p key={i}>{s}</p>
            ))}
            <p className="text-sm text-slate-400">
              Natural {r.natural} · <span className={r.functional.good ? "text-emerald-400" : "text-rose-400"}>{r.functional.label}</span>
              {r.karaka ? ` · Chara Karaka: ${r.karaka}` : ""}
              {r.shadbala ? ` · Shadbala ${r.shadbala.rupas.toFixed(2)} / ${r.shadbala.required} Rupas (rank #${r.shadbala.rank})` : ""}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Block title="💪 Strengths" tone="border-emerald-500/25 bg-emerald-500/5 text-emerald-300">
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-emerald-50/90">
                {r.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </Block>
            <Block title="⚠️ Weaknesses" tone="border-rose-500/25 bg-rose-500/5 text-rose-300">
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-rose-50/90">
                {r.weaknesses.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </Block>
          </div>

          <Block title={`👁 Aspects cast by ${r.id} — what happens`} tone="border-violet-500/25 bg-violet-500/5 text-violet-300">
            <ul className="space-y-2.5 text-sm text-slate-200">
              {r.aspectsCast.map((a) => (
                <li key={a.house} className="flex gap-3">
                  <span className="mt-0.5 shrink-0 rounded-md bg-violet-500/20 px-2 py-0.5 text-xs font-semibold text-violet-200">H{a.house}</span>
                  <span>{a.effect}</span>
                </li>
              ))}
            </ul>
          </Block>

          <div className="grid gap-4 md:grid-cols-2">
            <Block title={`🛡 Aspects received by ${r.id}`} tone="border-sky-500/25 bg-sky-500/5 text-sky-300">
              {r.aspectsReceived.length ? (
                <ul className="space-y-2 text-sm text-slate-200">
                  {r.aspectsReceived.map((a) => (
                    <li key={a.from}>
                      <span className={`font-semibold ${a.benefic ? "text-emerald-300" : "text-rose-300"}`}>{a.from}:</span> {a.effect}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-300">No planet aspects {r.id}; it acts independently according to its own sign and house.</p>
              )}
            </Block>
            <Block title="🤝 Conjunctions" tone="border-amber-500/25 bg-amber-500/5 text-amber-300">
              {r.conjunctions.length ? (
                <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-200">
                  {r.conjunctions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-300">{r.id} is alone in its sign.</p>
              )}
            </Block>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Block title="🙏 Remedies" tone="border-teal-500/25 bg-teal-500/5 text-teal-300">
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-200">
                {r.remedies.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
              <p className="mt-3 rounded-lg bg-slate-900/50 p-3 text-sm text-slate-300">
                <span className="font-semibold text-teal-200">Gemstone: </span>
                {r.gemAdvice}
              </p>
            </Block>
            <Block title="🚫 Avoid" tone="border-orange-500/25 bg-orange-500/5 text-orange-300">
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-200">
                {r.avoid.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-slate-400">
                Lucky day {pi.day} · Colour {pi.color2} · Number {pi.number} · Metal {pi.metal} · Donate {pi.grain}
              </p>
            </Block>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Overview({ c }: { c: ChartData }) {
  const reports = useMemo(() => allPlanetReports(c), [c]);
  const [open, setOpen] = useState<Set<string>>(() => new Set([reports[0]?.id]));
  const allOpen = open.size === reports.length;
  const toggle = (id: string) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">Click a planet to read its strengths, weaknesses, aspects and remedies.</p>
        <button type="button" onClick={() => setOpen(allOpen ? new Set() : new Set(reports.map((r) => r.id)))} className="rounded-full border border-slate-600 px-4 py-1.5 text-sm text-slate-300 hover:border-amber-400 hover:text-amber-200">
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>
      <div className="space-y-3">
        {reports.map((r) => (
          <PlanetCard key={r.id} r={r} open={open.has(r.id)} onToggle={() => toggle(r.id)} />
        ))}
      </div>
    </div>
  );
}
