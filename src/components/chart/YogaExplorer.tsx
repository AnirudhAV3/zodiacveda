"use client";

import { useMemo, useState } from "react";
import type { DoshaResult, PlanEntry, YogaResult } from "@/lib/astro/yogas";
import { RemedyList } from "./RemedyList";
import ClickHint from "./ClickHint";
import { PLANET_INFO } from "@/lib/astro/data";

function PlanCard({ title, tone, entries, empty }: { title: string; tone: string; entries: PlanEntry[]; empty: string }) {
  return (
    <div className={`rounded-2xl border p-5 ${tone}`}>
      <h4 className="mb-3 font-serif text-xl font-semibold">{title}</h4>
      {entries.length === 0 && <p className="text-sm text-slate-300">{empty}</p>}
      <div className="space-y-3">
        {entries.map((e) => (
          <div key={e.id} className="rounded-xl bg-slate-900/50 p-3.5 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold" style={{ color: PLANET_INFO[e.id].color }}>
                {e.id}
              </span>
              <span className="text-xs text-slate-400">for {e.reasons.slice(0, 3).join(", ")}{e.reasons.length > 3 ? ` +${e.reasons.length - 3}` : ""}</span>
            </div>
            <p className="mt-1.5 text-slate-200">
              🕉 <i>{e.mantra}</i> — 108× on {e.day}s
            </p>
            <p className="mt-1 text-slate-300">
              🪔 Worship {e.deity} · 🤲 Donate {e.charity.toLowerCase()}
            </p>
            <p className="mt-1 text-slate-400">💎 {e.gem}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RemedyPlan({ plan }: { plan: { strengthen: PlanEntry[]; pacify: PlanEntry[] } }) {
  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-2">
      <PlanCard title="✨ Planets to strengthen (activate your yogas)" tone="border-emerald-500/30 bg-emerald-500/5 text-emerald-300" entries={plan.strengthen} empty="No auspicious yogas need activation." />
      <PlanCard title="🛡 Planets to pacify (reduce yogas & doshas)" tone="border-rose-500/30 bg-rose-500/5 text-rose-300" entries={plan.pacify} empty="No afflicting yogas or active doshas — no pacification needed." />
    </div>
  );
}

function YogaCard({ y }: { y: YogaResult }) {
  const [open, setOpen] = useState(false);
  const tone = y.present ? (y.nature === "bad" ? "border-rose-500/40 bg-rose-500/5" : y.nature === "mixed" ? "border-amber-500/40 bg-amber-500/5" : "border-emerald-500/40 bg-emerald-500/5") : "border-slate-700/50 bg-slate-900/30 opacity-70";
  const [showInfo, setShowInfo] = useState(false);
  const expanded = y.present || showInfo;
  return (
    <div className={`rounded-2xl border p-4 transition ${tone}`}>
      <button type="button" onClick={() => !y.present && setShowInfo((s) => !s)} className="flex w-full items-start justify-between gap-2 text-left">
        <div>
          <p className="font-semibold text-slate-100">{y.name}</p>
          <p className="text-xs text-slate-500">
            {y.category}
            {y.present && y.planets.length > 0 && <> · Key planets: {y.planets.join(", ")}</>}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${y.present ? (y.nature === "bad" ? "bg-rose-500/20 text-rose-300" : y.nature === "mixed" ? "bg-amber-500/20 text-amber-200" : "bg-emerald-500/20 text-emerald-300") : "bg-slate-700/60 text-slate-400"}`}>{y.present ? "Present" : "Absent"}</span>
      </button>
      {expanded && (
        <div className="mt-2 space-y-1 text-sm">
          <p className="text-slate-400">
            <span className="text-slate-500">Formation:</span> {y.formation}
          </p>
          <p className="text-slate-200">
            <span className="text-slate-500">Effect:</span> {y.effect}
          </p>
        </div>
      )}
      {y.present && (
        <>
          <button type="button" onClick={() => setOpen((o) => !o)} className="mt-3 flex items-center gap-2 text-sm font-semibold text-amber-400 hover:text-amber-300">
            <span className={`transition ${open ? "rotate-90" : ""}`}>›</span>
            {y.nature === "bad" ? "Remedies to reduce this yoga" : "Remedies to activate & strengthen"}
          </button>
          {open && (
            <div className="animate-pop mt-3 rounded-xl bg-slate-950/50 p-4">
              <RemedyList remedies={y.remedies} compact />
              {y.activation.length > 0 && (
                <div className="mt-3 border-t border-slate-700/50 pt-3">
                  <p className="label-caps !text-violet-300">{y.nature === "bad" ? "Periods when it is most felt" : "Periods when this yoga gives results"}</p>
                  <ul className="mt-1 space-y-0.5 text-[13px] text-slate-300">
                    {y.activation.map((a) => (
                      <li key={a}>◆ {a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function YogaExplorer({ yogas, plan }: { yogas: YogaResult[]; plan: { strengthen: PlanEntry[]; pacify: PlanEntry[] } }) {
  const [filter, setFilter] = useState<"present" | "all" | "absent">("present");
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const cats = useMemo(() => ["All", ...Array.from(new Set(yogas.map((y) => y.category)))], [yogas]);
  const list = yogas.filter((y) => (filter === "all" ? true : filter === "present" ? y.present : !y.present) && (cat === "All" || y.category === cat) && (!q || (y.name + y.effect + y.formation).toLowerCase().includes(q.toLowerCase())));
  const present = yogas.filter((y) => y.present);
  return (
    <div>
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <p className="label-caps">Yogas analysed</p>
          <p className="text-3xl font-bold text-slate-100">{yogas.length}</p>
        </div>
        <div className="card p-4">
          <p className="label-caps">Auspicious present</p>
          <p className="text-3xl font-bold text-emerald-400">{present.filter((y) => y.nature !== "bad").length}</p>
        </div>
        <div className="card p-4">
          <p className="label-caps">Challenging present</p>
          <p className="text-3xl font-bold text-rose-400">{present.filter((y) => y.nature === "bad").length}</p>
        </div>
      </div>
      <RemedyPlan plan={plan} />
      <ClickHint title="Click on each yoga to see its details & remedies">
        Yogas present in your chart show their formation and effect; click <b>“Remedies to activate”</b> (or <b>“Remedies to reduce”</b>) for mantras, puja, charity, gemstone advice and the dasha periods when the yoga gives results. Absent yogas can be clicked to read what they mean.
      </ClickHint>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-slate-600/40 p-1">
          {(["present", "all", "absent"] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)} className={`rounded-lg px-4 py-1.5 text-sm capitalize ${filter === f ? "bg-amber-400 text-slate-950" : "text-slate-300"}`}>
              {f === "present" ? "In my chart" : f}
            </button>
          ))}
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="input !w-auto !py-2 text-sm">
          {cats.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search yogas…" className="input !w-56 !py-2 text-sm" />
        <span className="text-sm text-slate-400">{list.length} shown</span>
      </div>
      <div className="grid items-start gap-3 md:grid-cols-2">
        {list.map((y) => (
          <YogaCard key={y.name} y={y} />
        ))}
      </div>
    </div>
  );
}

function DoshaCard({ d }: { d: DoshaResult }) {
  const active = d.severity !== "None";
  const [open, setOpen] = useState(active);
  const col = d.severity === "Strong" ? "text-rose-400 bg-rose-500/15" : d.severity === "Moderate" ? "text-orange-300 bg-orange-500/15" : d.severity === "Mild" ? "text-amber-200 bg-amber-500/15" : "text-emerald-300 bg-emerald-500/15";
  return (
    <div className={`card p-5 ${d.present ? "ring-1 ring-rose-500/30" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-serif text-xl font-semibold text-slate-100">{d.name}</h4>
        <span className={`shrink-0 rounded-full px-3 py-0.5 text-xs font-semibold ${col}`}>{d.present ? d.severity : d.severity === "None" ? "Not present" : `${d.severity} (reduced)`}</span>
      </div>
      <p className="mt-2 text-sm text-slate-300">{d.details}</p>
      {d.planets.length > 0 && <p className="mt-1 text-xs text-slate-500">Planets involved: {d.planets.join(", ")}</p>}
      <button type="button" onClick={() => setOpen((o) => !o)} className="mt-3 flex items-center gap-2 text-sm font-semibold text-amber-400 hover:text-amber-300">
        <span className={`transition ${open ? "rotate-90" : ""}`}>›</span>
        {active ? "Remedies" : "Preventive remedies (optional)"}
      </button>
      {open && (
        <div className="animate-pop mt-3 rounded-xl bg-slate-950/50 p-4">
          {!active && <p className="mb-3 text-xs text-emerald-300">This dosha is not present in your chart — these are only for general protection and are not required.</p>}
          <RemedyList remedies={d.remedies} compact />
        </div>
      )}
    </div>
  );
}

export function Doshas({ doshas }: { doshas: DoshaResult[] }) {
  const active = doshas.filter((d) => d.severity !== "None");
  return (
    <div>
      <div className={`card mb-5 p-4 text-sm ${active.length ? "text-amber-100" : "text-emerald-200"}`}>
        {active.length ? (
          <>
            <b>{active.length}</b> dosha{active.length > 1 ? "s" : ""} need attention: {active.map((d) => `${d.name} (${d.present ? d.severity : d.severity + ", reduced"})`).join(", ")}. Start with mantra and charity — they are safe for everyone; do pujas on the suggested days and consult an astrologer before wearing gemstones.
          </>
        ) : (
          <>Your chart is free from the major doshas. Preventive remedies are listed below for general well-being.</>
        )}
      </div>
      <ClickHint title="Click on each dosha to see its remedies">Every dosha card opens to show puja, mantra, fasting, charity, gemstone guidance, lifestyle advice and when its effects peak.</ClickHint>
      <div className="grid items-start gap-4 md:grid-cols-2">
        {[...doshas].sort((a, b) => Number(b.severity !== "None") - Number(a.severity !== "None")).map((d) => (
          <DoshaCard key={d.name} d={d} />
        ))}
      </div>
    </div>
  );
}
