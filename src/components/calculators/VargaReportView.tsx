"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { PLANET_INFO, SIGNS } from "@/lib/astro/data";
import type { VargaChart, VargaReport } from "@/lib/varga/report";
import ChartSVG from "@/components/chart/ChartSVG";

const TABS = [["summary", "✦", "Summary"], ["charts", "🪐", "All 16 charts"], ["strength", "📊", "Vimsopaka strength"], ["method", "📖", "Method"]] as const;
type Tab = (typeof TABS)[number][0];
const STRONG = ["Exalted", "Moolatrikona", "Own Sign"];

function ChartPanel({ v, style }: { v: VargaChart; style: "north" | "south" }) {
  return (
    <section className="card p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="font-serif text-2xl font-semibold text-amber-200">{v.code} · {v.name}</h3>
          <p className="text-xs text-slate-400">{v.purpose}</p>
        </div>
        <span className="text-xs text-slate-500">Ascendant {SIGNS[v.ascSign].sa}</span>
      </div>
      <div className="mx-auto max-w-[420px]">
        <ChartSVG
          style={style}
          ascSign={v.ascSign}
          placements={v.placements.map((p) => ({
            id: p.id, sign: p.sign, deg: 0, retro: false,
            tag: p.vargottama ? "VG" : undefined,
            tagColor: p.vargottama ? "#34d399" : undefined,
          }))}
          showDegrees={false}
        />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">{v.detail}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {v.strongPlanets.length > 0 && <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-200">Strong: {v.strongPlanets.join(", ")}</span>}
        {v.weakPlanets.length > 0 && <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-rose-200">Debilitated: {v.weakPlanets.join(", ")}</span>}
        {v.placements.some((p) => p.vargottama) && <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-teal-200">VG = Vargottama: {v.placements.filter((p) => p.vargottama).map((p) => p.id).join(", ")}</span>}
      </div>
      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-semibold text-amber-300">Planet positions in {v.code}</summary>
        <div className="scroll-thin mt-2 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/50"><tr>{["Planet", "Sign", "House", "Dignity"].map((h) => <th key={h} className="whitespace-nowrap p-2.5 text-left text-xs font-semibold text-slate-400">{h}</th>)}</tr></thead>
            <tbody>{v.placements.map((p) => (
              <tr key={p.id} className="border-t border-slate-700/40">
                <td className="p-2.5 font-bold" style={{ color: PLANET_INFO[p.id].color }}>{p.id}{p.vargottama ? " ·VG" : ""}</td>
                <td className="whitespace-nowrap p-2.5 text-slate-300">{SIGNS[p.sign].sa}</td>
                <td className="p-2.5 text-slate-300">{p.house}</td>
                <td className={`whitespace-nowrap p-2.5 ${STRONG.includes(p.dignity) ? "text-emerald-300" : p.dignity === "Debilitated" ? "text-rose-300" : "text-slate-300"}`}>{p.dignity}</td>
              </tr>))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}

export default function VargaReportView({ report: r, chartSlug }: { report: VargaReport; chartSlug: string }) {
  const [tab, setTab] = useState<Tab>("summary");
  const [style, setStyle] = useState<"north" | "south">(r.style);
  const [focus, setFocus] = useState<string>("D9");
  const [copied, setCopied] = useState(false);
  const [shareFailed, setShareFailed] = useState(false);
  const focused = r.charts.find((v) => v.code === focus) ?? r.charts[0];

  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { setShareFailed(true); }
  };

  const styleToggle = (
    <div className="flex rounded-xl border border-slate-600/50 p-1">
      {(["north", "south"] as const).map((s) => <button key={s} type="button" onClick={() => setStyle(s)} aria-pressed={style === s} className={`rounded-lg px-4 py-2 text-sm transition ${style === s ? "bg-amber-400 font-semibold text-slate-950" : "text-slate-300 hover:bg-white/5"}`}>{s === "north" ? "North Indian" : "South Indian"}</button>)}
    </div>
  );

  let content: ReactNode;
  if (tab === "summary") {
    content = (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[["Charts generated", r.charts.length, "#a78bfa"], ["Vargottama placements", r.vargottama.reduce((s, v) => s + v.charts.length, 0), "#2dd4bf"],
            ["Strongest", r.strongestPlanet?.id ?? "—", PLANET_INFO[r.strongestPlanet?.id ?? "Sun"].color], ["Weakest", r.weakestPlanet?.id ?? "—", PLANET_INFO[r.weakestPlanet?.id ?? "Sun"].color]].map(([label, value, color]) => (
            <div key={label as string} className="card p-4 text-center"><p className="truncate text-2xl font-bold" style={{ color: color as string }}>{value as ReactNode}</p><p className="mt-1 text-xs text-slate-400">{label as string}</p></div>
          ))}
        </div>

        <section className="card p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-2xl font-semibold text-amber-200">Pick a chart to view</h2>
            {styleToggle}
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            {r.charts.map((v) => <button key={v.code} type="button" onClick={() => setFocus(v.code)} aria-pressed={focus === v.code} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${focus === v.code ? "bg-violet-500 text-white" : "bg-slate-800/60 text-slate-300 hover:bg-slate-700"}`}>{v.code}</button>)}
          </div>
          <ChartPanel v={focused} style={style} />
        </section>

        <section className="card p-5">
          <h2 className="font-serif text-2xl font-semibold text-teal-300">Vargottama planets</h2>
          <p className="mt-1 text-xs text-slate-500">A planet in the same sign as the birth chart. Classically this strengthens it in that area of life.</p>
          {r.vargottama.length ? (
            <ul className="mt-3 space-y-2">{r.vargottama.map((v) => (
              <li key={v.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-950/40 p-3 text-sm">
                <span className="font-bold" style={{ color: PLANET_INFO[v.id].color }}>{v.id}</span>
                <span className="text-slate-400">in {v.charts.length} division{v.charts.length > 1 ? "s" : ""}:</span>
                <span className="text-slate-300">{v.charts.join(", ")}</span>
              </li>))}
            </ul>
          ) : <p className="mt-3 text-sm text-slate-400">No planet repeats its birth-chart sign in any division for this chart.</p>}
        </section>

        <section className="card p-5">
          <h2 className="font-serif text-2xl font-semibold text-amber-200">Birth chart used</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[["Ascendant", r.chartSummary.lagnaSign], ["Moon sign", r.chartSummary.moonSign], ["Nakshatra", `${r.chartSummary.nakshatra} · pada ${r.chartSummary.pada}`], ["Born", `${r.chartSummary.date} · ${r.chartSummary.time}`]].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-white/10 bg-slate-950/30 p-3"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{k}</p><p className="mt-1 text-sm font-semibold text-slate-100">{v}</p></div>
            ))}
          </div>
          <Link href={`/chart/${chartSlug}`} className="mt-4 inline-flex text-sm font-semibold text-amber-300 hover:underline">Open the full horoscope for this chart →</Link>
        </section>
      </div>
    );
  } else if (tab === "charts") {
    content = (
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-400">All {r.charts.length} divisional charts, in order.</p>
          {styleToggle}
        </div>
        <div className="grid items-start gap-5 lg:grid-cols-2">{r.charts.map((v) => <ChartPanel key={v.code} v={v} style={style} />)}</div>
      </div>
    );
  } else if (tab === "strength") {
    content = (
      <div className="space-y-4">
        <section className="card p-5">
          <h2 className="font-serif text-2xl font-semibold text-amber-200">Vimsopaka Bala</h2>
          <p className="mt-1 text-sm text-slate-400">Classical weighted strength out of 20, measured across four groups of divisions. The Bheda name is the traditional title earned at that level.</p>
          <div className="scroll-thin mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50"><tr>{["Planet", "ShadVarga (6)", "SaptVarga (7)", "DasaVarga (10)", "ShodashVarga (16)", "Bheda", "Overall"].map((h) => <th key={h} className="whitespace-nowrap p-3 text-left text-xs font-semibold text-slate-400">{h}</th>)}</tr></thead>
              <tbody>{r.vimsopaka.map((v) => (
                <tr key={v.id} className="border-t border-slate-700/40">
                  <td className="p-3 font-bold" style={{ color: PLANET_INFO[v.id].color }}>{v.id}</td>
                  {[v.shadVarga, v.saptVarga, v.dasaVarga, v.shodashVarga].map((s, i) => <td key={i} className="whitespace-nowrap p-3 text-slate-300">{s.score.toFixed(2)}</td>)}
                  <td className="whitespace-nowrap p-3 text-slate-400">{v.shodashVarga.name}</td>
                  <td className="whitespace-nowrap p-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${v.shodashVarga.score >= 12 ? "bg-emerald-500/20 text-emerald-300" : v.shodashVarga.score >= 9 ? "bg-amber-500/20 text-amber-200" : "bg-rose-500/20 text-rose-300"}`}>{v.label}</span>
                  </td>
                </tr>))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="card p-5">
          <h2 className="mb-3 font-serif text-xl font-semibold text-amber-200">Strength across divisions</h2>
          <div className="space-y-2">{[...r.vimsopaka].sort((a, b) => b.shodashVarga.score - a.shodashVarga.score).map((v) => (
            <div key={v.id} className="flex items-center gap-3 text-sm">
              <span className="w-20 font-semibold" style={{ color: PLANET_INFO[v.id].color }}>{v.id}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800"><div className={`h-full rounded-full ${v.shodashVarga.score >= 12 ? "bg-emerald-400" : v.shodashVarga.score >= 9 ? "bg-amber-400" : "bg-rose-400"}`} style={{ width: `${(v.shodashVarga.score / 20) * 100}%` }} /></div>
              <span className="w-24 text-right text-xs text-slate-400">{v.shodashVarga.score.toFixed(2)} / 20</span>
            </div>))}
          </div>
        </section>
      </div>
    );
  } else {
    content = (
      <section className="card p-5">
        <h2 className="font-serif text-2xl font-semibold text-amber-200">Method &amp; limitations</h2>
        <p className="mt-1 text-sm text-slate-400">{r.method}</p>
        <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-slate-300">{r.notes.map((n) => <li key={n}>{n}</li>)}</ul>
        <p className="mt-4 text-xs text-slate-500">Engine version {r.version} · calculated {new Date(r.calculatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })}</p>
      </section>
    );
  }

  return (
    <div>
      <header className="card relative mb-6 overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-teal-500/10 blur-3xl" />
        <p className="label-caps !text-amber-300">Saved divisional charts</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-slate-100 sm:text-5xl">{r.chartSummary.name}</h1>
        <p className="mt-2 text-sm text-slate-400">{r.chartSummary.date} · {r.chartSummary.time} · {r.chartSummary.place}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="rounded-full bg-violet-500/15 px-4 py-2 text-sm font-bold text-violet-200">{r.charts.length} charts</span>
          <button type="button" onClick={share} className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:border-amber-400">{copied ? "Link copied ✓" : "Share this report"}</button>
          <Link href="/calculators/divisional-charts" className="rounded-full border border-amber-400/40 px-4 py-2 text-sm text-amber-200 hover:bg-amber-400/10">New chart</Link>
        </div>
        {shareFailed && <p className="mt-2 text-xs text-amber-200">Copy this page’s address from your browser to share it.</p>}
      </header>
      <nav aria-label="Divisional chart sections" className="scroll-thin mb-6 flex gap-2 overflow-x-auto pb-2">
        {TABS.map(([k, icon, text]) => <button key={k} type="button" onClick={() => setTab(k)} aria-pressed={tab === k} className={`shrink-0 rounded-xl border px-4 py-2.5 text-sm transition ${tab === k ? "border-amber-400/60 bg-amber-400/15 font-semibold text-amber-200" : "border-slate-700 bg-slate-900/30 text-slate-400 hover:text-slate-200"}`}>{icon} {text}</button>)}
      </nav>
      <div key={tab} className="animate-pop">{content}</div>
    </div>
  );
}
