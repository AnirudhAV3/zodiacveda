"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { PLANET_INFO } from "@/lib/astro/data";
import type { ScoredYoga, YogaReport } from "@/lib/yoga/report";
import { RemedyList } from "@/components/chart/RemedyList";
import { RemedyPlan } from "@/components/chart/YogaExplorer";

const TABS = [["summary", "✦", "Summary"], ["present", "🔱", "Yogas in your chart"], ["all", "📚", "Every yoga checked"], ["remedies", "🪔", "Strengthen & balance"], ["method", "📖", "Method"]] as const;
type Tab = (typeof TABS)[number][0];
const tone = (y: ScoredYoga) => (!y.present ? "border-slate-700/60 bg-slate-900/20" : y.nature === "bad" ? "border-rose-500/40 bg-rose-500/5" : y.nature === "mixed" ? "border-amber-500/40 bg-amber-500/5" : "border-emerald-500/40 bg-emerald-500/5");
const badge = (y: ScoredYoga) => (!y.present ? "bg-slate-700/60 text-slate-400" : y.nature === "bad" ? "bg-rose-500/20 text-rose-300" : y.nature === "mixed" ? "bg-amber-500/20 text-amber-200" : "bg-emerald-500/20 text-emerald-300");
const barColor = (s: number) => (s >= 60 ? "bg-emerald-400" : s >= 45 ? "bg-amber-400" : "bg-rose-400");

function Stat({ value, label, color }: { value: ReactNode; label: string; color: string }) {
  return <div className="card p-4 text-center"><p className="text-3xl font-bold" style={{ color }}>{value}</p><p className="mt-1 text-xs text-slate-400">{label}</p></div>;
}

function YogaCard({ y, open, onToggle }: { y: ScoredYoga; open: boolean; onToggle: () => void }) {
  return (
    <div className={`rounded-2xl border transition ${tone(y)}`}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-start gap-3 p-4 text-left">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-100">{y.name}</p>
          <p className="text-xs text-slate-500">{y.category}{y.present && y.planets.length > 0 ? ` · ${y.planets.join(", ")}` : ""}</p>
          {y.present && y.strength !== null && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-700"><div className={`h-full rounded-full ${barColor(y.strength)}`} style={{ width: `${y.strength}%` }} /></div>
              <span className="text-[11px] text-slate-400">{y.strength}/100 · {y.strengthLabel}</span>
            </div>
          )}
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge(y)}`}>{y.present ? "Present" : "Absent"}</span>
        <span className={`shrink-0 text-slate-500 transition ${open ? "rotate-90" : ""}`}>›</span>
      </button>
      {open && (
        <div className="space-y-3 border-t border-white/10 p-4 text-sm">
          <p className="text-slate-400"><span className="text-slate-500">Formation:</span> {y.formation}</p>
          <p className="text-slate-200"><span className="text-slate-500">Effect:</span> {y.effect}</p>
          {!y.present && <p className="rounded-lg bg-slate-950/40 p-3 text-xs text-slate-400">This combination is not present in your chart. It is listed so you can see the full set of definitions that were checked.</p>}
          {y.present && y.planetNotes.length > 0 && (
            <div>
              <p className="label-caps !text-violet-300">Planets forming this yoga</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {y.planetNotes.map((p) => (
                  <div key={p.id} className="rounded-xl bg-slate-950/40 p-3">
                    <p className="font-semibold" style={{ color: PLANET_INFO[p.id].color }}>{p.id} · house {p.house}</p>
                    <p className="mt-1 text-xs text-slate-400">{p.dignity} · {p.functional}</p>
                    <p className="text-xs text-slate-500">Shadbala {p.shadbala} · overall strength {p.score}/100</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {y.present && y.activation.length > 0 && (
            <div><p className="label-caps !text-violet-300">When it activates</p><ul className="mt-1 space-y-1 text-xs text-slate-300">{y.activation.map((a) => <li key={a}>◆ {a}</li>)}</ul></div>
          )}
          {y.present && y.remedies.length > 0 && (
            <div className="rounded-xl bg-slate-950/40 p-3"><p className="label-caps mb-2 !text-teal-300">{y.nature === "bad" ? "Reduce its difficulty" : "Support this yoga"}</p><RemedyList remedies={y.remedies} compact /></div>
          )}
        </div>
      )}
    </div>
  );
}

function YogaList({ items }: { items: ScoredYoga[] }) {
  const [open, setOpen] = useState<string | null>(items[0]?.name ?? null);
  if (!items.length) return <p className="card p-6 text-center text-sm text-slate-400">No yogas match this filter.</p>;
  return <div className="grid items-start gap-3 md:grid-cols-2">{items.map((y) => <YogaCard key={y.name} y={y} open={open === y.name} onToggle={() => setOpen(open === y.name ? null : y.name)} />)}</div>;
}

export default function YogaReportView({ report: r, chartSlug }: { report: YogaReport; chartSlug: string }) {
  const [tab, setTab] = useState<Tab>("summary");
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [shareFailed, setShareFailed] = useState(false);
  const present = useMemo(() => r.yogas.filter((y) => y.present), [r.yogas]);
  const categories = useMemo(() => ["All", ...r.categories.map((c) => c.category)], [r.categories]);
  const filtered = useMemo(() => {
    const base = tab === "present" ? present : r.yogas;
    return base.filter((y) => (category === "All" || y.category === category) && (!query.trim() || `${y.name} ${y.effect} ${y.formation}`.toLowerCase().includes(query.trim().toLowerCase())));
  }, [tab, present, r.yogas, category, query]);

  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { setShareFailed(true); }
  };

  let content: ReactNode;
  if (tab === "summary") {
    content = (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={r.presentCount} label="Yogas in your chart" color="#fbbf24" />
          <Stat value={r.auspiciousCount} label="Auspicious" color="#34d399" />
          <Stat value={r.challengingCount} label="Challenging" color="#fb7185" />
          <Stat value={r.analysed} label="Definitions checked" color="#a78bfa" />
        </div>
        <section className="card p-5">
          <h2 className="font-serif text-2xl font-semibold text-amber-200">Your strongest auspicious yogas</h2>
          <p className="mt-1 text-xs text-slate-500">Ranked by the strength of the planets that form them. Strength shows capacity to deliver, not certainty.</p>
          {r.strongest.length ? (
            <ol className="mt-3 space-y-2">{r.strongest.map((s, i) => <li key={s} className="flex items-center gap-3 rounded-xl bg-slate-950/40 p-3 text-sm"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400/20 text-xs font-bold text-amber-200">{i + 1}</span><span className="text-slate-200">{s}</span></li>)}</ol>
          ) : <p className="mt-3 text-sm text-slate-400">No auspicious yoga was detected in this chart. The complete list of definitions that were checked is in the next tab.</p>}
          <button type="button" onClick={() => setTab("present")} className="mt-4 text-sm font-semibold text-amber-300 hover:underline">See all yogas in your chart →</button>
        </section>
        <section className="card p-5">
          <h2 className="mb-3 font-serif text-2xl font-semibold text-amber-200">By category</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {r.categories.map((c) => (
              <button key={c.category} type="button" onClick={() => { setCategory(c.category); setTab("present"); }} className="flex items-center justify-between gap-3 rounded-xl bg-slate-950/40 p-3 text-left text-sm transition hover:bg-slate-950/70">
                <span className="text-slate-200">{c.category}</span>
                <span className="shrink-0 text-xs"><b className="text-amber-200">{c.present}</b><span className="text-slate-500"> / {c.total} present</span></span>
              </button>
            ))}
          </div>
        </section>
        <section className="card p-5">
          <h2 className="font-serif text-2xl font-semibold text-amber-200">Birth chart used</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[["Lagna", r.chartSummary.lagna], ["Lagna lord", r.chartSummary.lagnaLord], ["Moon sign", r.chartSummary.moonSign], ["Nakshatra", `${r.chartSummary.nakshatra} · pada ${r.chartSummary.pada}`]].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-white/10 bg-slate-950/30 p-3"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{k}</p><p className="mt-1 text-sm font-semibold text-slate-100">{v}</p></div>
            ))}
          </div>
          <div className="scroll-thin mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50"><tr>{["Planet", "Sign", "Degree", "House", "Dignity", "Strength"].map((h) => <th key={h} className="whitespace-nowrap p-3 text-left text-xs font-semibold text-slate-400">{h}</th>)}</tr></thead>
              <tbody>{r.chartSummary.planets.map((p) => (
                <tr key={p.id} className="border-t border-slate-700/40">
                  <td className="p-3 font-bold" style={{ color: PLANET_INFO[p.id].color }}>{p.id}{p.retro ? " (R)" : ""}</td>
                  <td className="whitespace-nowrap p-3 text-slate-300">{p.sign}</td><td className="whitespace-nowrap p-3 font-mono text-xs text-slate-400">{p.degree}</td>
                  <td className="p-3 text-slate-300">{p.house}</td><td className="whitespace-nowrap p-3 text-slate-300">{p.dignity}</td><td className="p-3 text-slate-300">{p.strength}/100</td>
                </tr>))}
              </tbody>
            </table>
          </div>
          <Link href={`/chart/${chartSlug}`} className="mt-4 inline-flex text-sm font-semibold text-amber-300 hover:underline">Open the full horoscope for this chart →</Link>
        </section>
      </div>
    );
  } else if (tab === "present" || tab === "all") {
    content = (
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category" className="input !w-auto !py-2 text-sm">{categories.map((c) => <option key={c}>{c}</option>)}</select>
          <input value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search yogas" placeholder="Search yogas…" className="input !w-56 !py-2 text-sm" />
          <span className="text-sm text-slate-400">{filtered.length} shown{tab === "present" ? ` of ${present.length} present` : ` of ${r.analysed} checked`}</span>
        </div>
        <YogaList items={filtered} />
      </div>
    );
  } else if (tab === "remedies") {
    content = (
      <div className="space-y-5">
        <section className="card p-5"><h2 className="mb-2 font-serif text-2xl font-semibold text-amber-200">How to read this</h2><RemedyList remedies={r.generalRemedies} /></section>
        <RemedyPlan plan={r.plan} />
        {present.filter((y) => y.nature === "bad").length > 0 && (
          <section className="card p-5">
            <h2 className="mb-3 font-serif text-2xl font-semibold text-rose-300">Challenging yogas needing attention</h2>
            <div className="space-y-4">{present.filter((y) => y.nature === "bad").map((y) => <div key={y.name} className="rounded-xl bg-slate-950/40 p-4"><p className="font-semibold text-slate-100">{y.name}</p><p className="mb-2 mt-1 text-xs text-slate-400">{y.effect}</p><RemedyList remedies={y.remedies} compact /></div>)}</div>
          </section>
        )}
      </div>
    );
  } else {
    content = (
      <section className="card p-5">
        <h2 className="font-serif text-2xl font-semibold text-amber-200">Method & limitations</h2>
        <p className="mt-1 text-sm text-slate-400">{r.method}</p>
        <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-slate-300">{r.notes.map((n) => <li key={n}>{n}</li>)}</ul>
        <p className="mt-4 text-xs text-slate-500">Engine version {r.version} · calculated {new Date(r.calculatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })}</p>
      </section>
    );
  }

  return (
    <div>
      <header className="card relative mb-6 overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />
        <p className="label-caps !text-amber-300">Saved yoga report</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-slate-100 sm:text-5xl">{r.chartSummary.name}</h1>
        <p className="mt-2 text-sm text-slate-400">{r.chartSummary.date} · {r.chartSummary.time} · {r.chartSummary.place}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="rounded-full bg-amber-400/15 px-4 py-2 text-sm font-bold text-amber-200">{r.presentCount} yogas present</span>
          <button type="button" onClick={share} className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:border-amber-400">{copied ? "Link copied ✓" : "Share this report"}</button>
          <Link href="/calculators/all-yogas" className="rounded-full border border-amber-400/40 px-4 py-2 text-sm text-amber-200 hover:bg-amber-400/10">New chart</Link>
        </div>
        {shareFailed && <p className="mt-2 text-xs text-amber-200">Copy this page’s address from your browser to share it.</p>}
      </header>
      <nav aria-label="Yoga report sections" className="scroll-thin mb-6 flex gap-2 overflow-x-auto pb-2">
        {TABS.map(([key, icon, text]) => <button key={key} type="button" onClick={() => setTab(key)} aria-pressed={tab === key} className={`shrink-0 rounded-xl border px-4 py-2.5 text-sm transition ${tab === key ? "border-amber-400/60 bg-amber-400/15 font-semibold text-amber-200" : "border-slate-700 bg-slate-900/30 text-slate-400 hover:text-slate-200"}`}>{icon} {text}</button>)}
      </nav>
      <div key={tab} className="animate-pop">{content}</div>
    </div>
  );
}
