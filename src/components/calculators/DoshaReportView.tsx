"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { PLANET_INFO } from "@/lib/astro/data";
import type { DoshaReport, ScoredDosha } from "@/lib/dosha/report";
import { RemedyList } from "@/components/chart/RemedyList";
import { RemedyPlan } from "@/components/chart/YogaExplorer";

const TABS = [["summary", "✦", "Summary"], ["active", "⚠️", "Active doshas"], ["all", "📚", "Every dosha checked"], ["sadesati", "🪐", "Sade Sati timeline"], ["remedies", "🪔", "Remedies"], ["method", "📖", "Method"]] as const;
type Tab = (typeof TABS)[number][0];

const SEVERITY_STYLE: Record<string, string> = {
  Strong: "border-rose-500/40 bg-rose-500/5",
  Moderate: "border-orange-500/40 bg-orange-500/5",
  Mild: "border-amber-500/40 bg-amber-500/5",
  None: "border-emerald-500/30 bg-emerald-500/5",
};
const BADGE: Record<string, string> = {
  Strong: "bg-rose-500/20 text-rose-300",
  Moderate: "bg-orange-500/20 text-orange-300",
  Mild: "bg-amber-500/20 text-amber-200",
  None: "bg-emerald-500/20 text-emerald-300",
};
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });

function statusText(d: ScoredDosha) {
  if (d.present) return `Active · ${d.severity}`;
  if (d.severity !== "None") return `${d.severity} — cancelled / reduced`;
  return "Not present";
}

function DoshaCard({ d, open, onToggle }: { d: ScoredDosha; open: boolean; onToggle: () => void }) {
  return (
    <div className={`rounded-2xl border transition ${d.present ? SEVERITY_STYLE[d.severity] : d.severity !== "None" ? "border-amber-500/25 bg-amber-500/5" : "border-slate-700/60 bg-slate-900/20"}`}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-start gap-3 p-4 text-left">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-100">{d.name}</p>
          <p className="mt-0.5 text-xs text-slate-500">{d.topic}</p>
          {d.present && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-700"><div className={`h-full rounded-full ${d.severity === "Strong" ? "bg-rose-400" : d.severity === "Moderate" ? "bg-orange-400" : "bg-amber-400"}`} style={{ width: `${d.impact}%` }} /></div>
              <span className="text-[11px] text-slate-400">{d.severity} intensity</span>
            </div>
          )}
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${d.present ? BADGE[d.severity] : d.severity !== "None" ? BADGE.Mild : BADGE.None}`}>{statusText(d)}</span>
        <span className={`shrink-0 text-slate-500 transition ${open ? "rotate-90" : ""}`}>›</span>
      </button>
      {open && (
        <div className="space-y-3 border-t border-white/10 p-4 text-sm">
          <p className="text-slate-200">{d.details}</p>
          {d.cancellations.length > 0 && (
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3">
              <p className="label-caps !text-emerald-300">Cancellation found</p>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-emerald-100/90">{d.cancellations.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
          )}
          {d.lifeAreas.length > 0 && (
            <div><p className="label-caps !text-violet-300">Areas traditionally affected</p><div className="mt-1.5 flex flex-wrap gap-1.5">{d.lifeAreas.map((x) => <span key={x} className="rounded-full border border-slate-600/60 px-2.5 py-1 text-[11px] text-slate-300">{x}</span>)}</div></div>
          )}
          {d.planetNotes.length > 0 && (
            <div>
              <p className="label-caps !text-violet-300">Planets involved</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {d.planetNotes.map((p) => (
                  <div key={p.id} className="rounded-xl bg-slate-950/40 p-3">
                    <p className="font-semibold" style={{ color: PLANET_INFO[p.id].color }}>{p.id} · {p.sign} · house {p.house}</p>
                    <p className="mt-1 text-xs text-slate-400">{p.dignity} · overall strength {p.strength}/100</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {d.activation.length > 0 && (
            <div><p className="label-caps !text-violet-300">Periods when it is felt most</p><ul className="mt-1 space-y-1 text-xs text-slate-300">{d.activation.map((a) => <li key={a}>◆ {a}</li>)}</ul></div>
          )}
          {d.remedies.length > 0 && (
            <div className="rounded-xl bg-slate-950/40 p-3">
              <p className="label-caps mb-2 !text-teal-300">{d.severity === "None" ? "Preventive practices (optional)" : "Remedies"}</p>
              <RemedyList remedies={d.remedies} compact />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DoshaList({ items, empty }: { items: ScoredDosha[]; empty: string }) {
  const [open, setOpen] = useState<string | null>(items[0]?.key ?? null);
  if (!items.length) return <p className="card p-6 text-center text-sm text-slate-400">{empty}</p>;
  return <div className="grid items-start gap-3 md:grid-cols-2">{items.map((d) => <DoshaCard key={d.key} d={d} open={open === d.key} onToggle={() => setOpen(open === d.key ? null : d.key)} />)}</div>;
}

export default function DoshaReportView({ report: r, chartSlug }: { report: DoshaReport; chartSlug: string }) {
  const [tab, setTab] = useState<Tab>("summary");
  const [copied, setCopied] = useState(false);
  const [shareFailed, setShareFailed] = useState(false);
  const active = r.doshas.filter((d) => d.present);
  const cancelled = r.doshas.filter((d) => !d.present && d.severity !== "None");
  const loadColor = r.overallLoad === 0 ? "#34d399" : r.overallLoad < 20 ? "#fbbf24" : r.overallLoad < 40 ? "#fb923c" : "#fb7185";

  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { setShareFailed(true); }
  };

  let content: ReactNode;
  if (tab === "summary") {
    content = (
      <div className="space-y-6">
        <div className="card grid items-center gap-6 p-6 sm:grid-cols-[180px_1fr]">
          <div className="relative mx-auto h-40 w-40">
            <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90"><circle cx="80" cy="80" r="66" stroke="#293044" strokeWidth="9" fill="none" /><circle cx="80" cy="80" r="66" stroke={loadColor} strokeWidth="9" fill="none" strokeLinecap="round" strokeDasharray={`${(r.overallLoad / 100) * 2 * Math.PI * 66} ${2 * Math.PI * 66}`} /></svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-4xl font-bold" style={{ color: loadColor }}>{r.activeCount}</span><span className="mt-1 text-xs text-slate-400">active of {r.checked}</span></div>
          </div>
          <div>
            <p className="label-caps !text-amber-300">Affliction load</p>
            <h2 className="mt-1 font-serif text-3xl font-semibold text-slate-100">{r.loadLabel}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              {r.activeCount === 0
                ? "No active dosha was found under the classical rules checked here. Doshas that were examined and did not apply are listed in full."
                : `${r.activeCount} dosha${r.activeCount > 1 ? "s are" : " is"} active in this chart${r.cancelledCount ? `, and ${r.cancelledCount} more ${r.cancelledCount > 1 ? "are" : "is"} present but cancelled or reduced by classical exceptions` : ""}. Severity, affected areas and remedies are shown for each.`}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => setTab("active")} className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950">See active doshas →</button>
              <button type="button" onClick={() => setTab("sadesati")} className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-300">Sade Sati timeline →</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[["Active", r.activeCount, "#fb7185"], ["Cancelled / reduced", r.cancelledCount, "#fbbf24"], ["Not present", r.clearCount, "#34d399"], ["Checked", r.checked, "#a78bfa"]].map(([label, value, color]) => (
            <div key={label as string} className="card p-4 text-center"><p className="text-3xl font-bold" style={{ color: color as string }}>{value as number}</p><p className="mt-1 text-xs text-slate-400">{label as string}</p></div>
          ))}
        </div>

        {r.sadeSati && (
          <section className="card p-5">
            <h2 className="font-serif text-2xl font-semibold text-amber-200">Sade Sati status</h2>
            <p className="mt-2 text-sm text-slate-300">{r.sadeSati.summary}</p>
            <button type="button" onClick={() => setTab("sadesati")} className="mt-3 text-sm font-semibold text-amber-300 hover:underline">View the full phase timeline →</button>
          </section>
        )}

        <section className="card p-5">
          <h2 className="font-serif text-2xl font-semibold text-amber-200">Birth chart used</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[["Lagna", r.chartSummary.lagna], ["Moon sign", r.chartSummary.moonSign], ["Nakshatra", `${r.chartSummary.nakshatra} · pada ${r.chartSummary.pada}`], ["Born", `${r.chartSummary.date} · ${r.chartSummary.time}`]].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-white/10 bg-slate-950/30 p-3"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{k}</p><p className="mt-1 text-sm font-semibold text-slate-100">{v}</p></div>
            ))}
          </div>
          <div className="scroll-thin mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50"><tr>{["Planet", "Sign", "Degree", "House", "Dignity"].map((h) => <th key={h} className="whitespace-nowrap p-3 text-left text-xs font-semibold text-slate-400">{h}</th>)}</tr></thead>
              <tbody>{r.chartSummary.planets.map((p) => (
                <tr key={p.id} className="border-t border-slate-700/40">
                  <td className="p-3 font-bold" style={{ color: PLANET_INFO[p.id].color }}>{p.id}{p.retro ? " (R)" : ""}</td>
                  <td className="whitespace-nowrap p-3 text-slate-300">{p.sign}</td>
                  <td className="whitespace-nowrap p-3 font-mono text-xs text-slate-400">{p.degree}</td>
                  <td className="p-3 text-slate-300">{p.house}</td>
                  <td className="whitespace-nowrap p-3 text-slate-300">{p.dignity}</td>
                </tr>))}
              </tbody>
            </table>
          </div>
          <Link href={`/chart/${chartSlug}`} className="mt-4 inline-flex text-sm font-semibold text-amber-300 hover:underline">Open the full horoscope for this chart →</Link>
        </section>
      </div>
    );
  } else if (tab === "active") {
    content = (
      <div className="space-y-6">
        <div>
          <h2 className="mb-3 font-serif text-2xl font-semibold text-rose-300">Active doshas</h2>
          <DoshaList items={active} empty="No dosha is active in this chart under the rules checked here. The full list of what was examined is in the next tab." />
        </div>
        {cancelled.length > 0 && (
          <div>
            <h2 className="mb-1 font-serif text-2xl font-semibold text-amber-200">Present but cancelled or reduced</h2>
            <p className="mb-3 text-sm text-slate-400">The placement exists, but a classical exception applies. These are shown openly rather than hidden.</p>
            <DoshaList items={cancelled} empty="" />
          </div>
        )}
      </div>
    );
  } else if (tab === "all") {
    content = (
      <div>
        <p className="mb-4 text-sm text-slate-400">All {r.checked} doshas that were evaluated, including those that do not apply to this chart.</p>
        <DoshaList items={r.doshas} empty="" />
      </div>
    );
  } else if (tab === "sadesati") {
    content = (
      <div className="space-y-4">
        <section className="card p-5">
          <h2 className="font-serif text-2xl font-semibold text-amber-200">Shani Sade Sati</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{r.sadeSati?.summary}</p>
          <p className="mt-2 text-xs text-slate-500">Sade Sati is the roughly seven-and-a-half-year period when Saturn transits the 12th, 1st and 2nd signs from your natal Moon. Dates below come from live Saturn transit calculations.</p>
        </section>
        {r.sadeSati?.phases.length ? (
          <ol className="space-y-3">
            {r.sadeSati.phases.map((p) => (
              <li key={`${p.phase}-${p.start}`} className={`rounded-2xl border p-4 ${p.status === "current" ? "border-amber-400/50 bg-amber-400/10" : p.status === "past" ? "border-slate-700/60 bg-slate-900/20 opacity-80" : "border-slate-600/50 bg-slate-900/30"}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-100">{p.phase} · {p.sign}</p>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${p.status === "current" ? "bg-amber-400/20 text-amber-200" : p.status === "past" ? "bg-slate-700/60 text-slate-400" : "bg-sky-500/15 text-sky-300"}`}>{p.status === "current" ? "Running now" : p.status === "past" ? "Completed" : "Upcoming"}</span>
                </div>
                <p className="mt-1 text-sm text-slate-400">{fmtDate(p.start)} → {fmtDate(p.end)}</p>
                <p className="mt-2 text-sm text-slate-300">{p.note}</p>
              </li>
            ))}
          </ol>
        ) : <p className="card p-6 text-center text-sm text-slate-400">No Sade Sati phase was found in the scanned window.</p>}
      </div>
    );
  } else if (tab === "remedies") {
    content = (
      <div className="space-y-5">
        <section className="card p-5"><h2 className="mb-2 font-serif text-2xl font-semibold text-amber-200">How to approach remedies</h2><RemedyList remedies={r.generalNotes} /></section>
        {r.priorityRemedies.length > 0 && (
          <section className="rounded-2xl border border-amber-400/30 bg-amber-400/5 p-5">
            <h2 className="mb-3 font-serif text-xl font-semibold text-amber-200">Start with these</h2>
            <RemedyList remedies={r.priorityRemedies} />
          </section>
        )}
        <RemedyPlan plan={r.plan} />
        {active.map((d) => (
          <section key={d.key} className="card p-5">
            <h3 className="mb-3 font-serif text-xl font-semibold text-slate-100">{d.name}</h3>
            <RemedyList remedies={d.remedies} compact />
          </section>
        ))}
      </div>
    );
  } else {
    content = (
      <section className="card p-5">
        <h2 className="font-serif text-2xl font-semibold text-amber-200">Method &amp; limitations</h2>
        <p className="mt-1 text-sm text-slate-400">{r.method}</p>
        <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-slate-300">{r.notes.map((n) => <li key={n}>{n}</li>)}</ul>
        <p className="mt-4 text-xs text-slate-500">Engine version {r.version} · calculated {fmtDate(r.calculatedAt)}</p>
      </section>
    );
  }

  return (
    <div>
      <header className="card relative mb-6 overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-rose-500/10 blur-3xl" />
        <p className="label-caps !text-amber-300">Saved dosha report</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-slate-100 sm:text-5xl">{r.chartSummary.name}</h1>
        <p className="mt-2 text-sm text-slate-400">{r.chartSummary.date} · {r.chartSummary.time} · {r.chartSummary.place}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="rounded-full px-4 py-2 text-sm font-bold" style={{ background: `${loadColor}20`, color: loadColor }}>{r.activeCount} active of {r.checked}</span>
          <button type="button" onClick={share} className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:border-amber-400">{copied ? "Link copied ✓" : "Share this report"}</button>
          <Link href="/calculators/all-doshas" className="rounded-full border border-amber-400/40 px-4 py-2 text-sm text-amber-200 hover:bg-amber-400/10">New chart</Link>
        </div>
        {shareFailed && <p className="mt-2 text-xs text-amber-200">Copy this page’s address from your browser to share it.</p>}
      </header>
      <nav aria-label="Dosha report sections" className="scroll-thin mb-6 flex gap-2 overflow-x-auto pb-2">
        {TABS.map(([k, icon, text]) => <button key={k} type="button" onClick={() => setTab(k)} aria-pressed={tab === k} className={`shrink-0 rounded-xl border px-4 py-2.5 text-sm transition ${tab === k ? "border-amber-400/60 bg-amber-400/15 font-semibold text-amber-200" : "border-slate-700 bg-slate-900/30 text-slate-400 hover:text-slate-200"}`}>{icon} {text}</button>)}
      </nav>
      <div key={tab} className="animate-pop">{content}</div>
    </div>
  );
}
