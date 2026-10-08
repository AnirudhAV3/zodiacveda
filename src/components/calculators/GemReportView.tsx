"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { PLANET_INFO } from "@/lib/astro/data";
import type { GemAdvice, GemReport } from "@/lib/gemstone/report";

const TABS = [["summary", "✦", "Your stones"], ["avoid", "🚫", "Stones to avoid"], ["all", "📚", "All nine"], ["wearing", "🪔", "How to wear"], ["method", "📖", "Method"]] as const;
type Tab = (typeof TABS)[number][0];

const STYLE: Record<string, { card: string; badge: string; label: string }> = {
  primary: { card: "border-emerald-500/40 bg-emerald-500/5", badge: "bg-emerald-500/20 text-emerald-300", label: "Recommended" },
  supportive: { card: "border-sky-500/35 bg-sky-500/5", badge: "bg-sky-500/20 text-sky-300", label: "Supportive — optional" },
  neutral: { card: "border-slate-700/60 bg-slate-900/20", badge: "bg-slate-700/60 text-slate-400", label: "Neutral — not needed" },
  avoid: { card: "border-rose-500/40 bg-rose-500/5", badge: "bg-rose-500/20 text-rose-300", label: "Avoid" },
};

function GemCard({ g, open, onToggle }: { g: GemAdvice; open: boolean; onToggle: () => void }) {
  const s = STYLE[g.verdict];
  return (
    <div className={`rounded-2xl border transition ${s.card}`}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-start gap-3 p-4 text-left">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: `${PLANET_INFO[g.planet].color}22` }}>💎</span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-100">{g.stone}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            <span style={{ color: PLANET_INFO[g.planet].color }}>{g.planet}</span>
            {g.ownsHouses.length > 0 && ` · rules house ${g.ownsHouses.join(" & ")}`}
            {g.role && ` · ${g.role}`}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.badge}`}>{s.label}</span>
        <span className={`shrink-0 text-slate-500 transition ${open ? "rotate-90" : ""}`}>›</span>
      </button>
      {open && (
        <div className="space-y-3 border-t border-white/10 p-4 text-sm">
          <ul className="list-disc space-y-1.5 pl-5 text-slate-300">{g.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
          <div className="grid gap-2 sm:grid-cols-3">
            {[["Planet strength", `${g.strength}/100`], ["Dignity", g.dignityLabel], ["Functional role", g.functional]].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-slate-950/40 p-3"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{k}</p><p className="mt-1 text-sm font-semibold text-slate-100">{v}</p></div>
            ))}
          </div>
          {g.verdict !== "avoid" ? (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                {[["Weight", g.carat], ["Metal", g.metal], ["Finger", g.finger], ["Day", g.day], ["Time", g.time], ["Mantra count", `${g.mantraCount} times`]].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-slate-950/40 p-3"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{k}</p><p className="mt-1 text-sm text-slate-200">{v}</p></div>
                ))}
              </div>
              <div className="rounded-xl border border-amber-400/25 bg-amber-400/5 p-3">
                <p className="label-caps !text-amber-300">Mantra</p>
                <p className="mt-1 text-sm italic text-slate-200">{g.mantra}</p>
              </div>
              <div className="rounded-xl bg-slate-950/40 p-3">
                <p className="label-caps !text-teal-300">Lower-cost substitutes (upratna)</p>
                <p className="mt-1 text-sm text-slate-300">{g.substitutes.join(", ")}</p>
                <p className="mt-1 text-xs text-slate-500">Traditionally regarded as milder than the main stone, not identical. Useful for testing before a large purchase.</p>
              </div>
            </>
          ) : (
            <p className="rounded-xl bg-slate-950/40 p-3 text-sm text-slate-300">Wearing instructions are intentionally not shown for a stone this chart advises against.</p>
          )}
          {g.conflictsWith.length > 0 && (
            <p className="text-xs text-slate-400"><span className="font-semibold text-rose-300">Do not combine with:</span> {g.conflictsWith.join(", ")}</p>
          )}
        </div>
      )}
    </div>
  );
}

function GemList({ items, empty }: { items: GemAdvice[]; empty: string }) {
  const [open, setOpen] = useState<string | null>(items[0]?.planet ?? null);
  if (!items.length) return <p className="card p-6 text-center text-sm text-slate-400">{empty}</p>;
  return <div className="grid items-start gap-3 md:grid-cols-2">{items.map((g) => <GemCard key={g.planet} g={g} open={open === g.planet} onToggle={() => setOpen(open === g.planet ? null : g.planet)} />)}</div>;
}

export default function GemReportView({ report: r, chartSlug }: { report: GemReport; chartSlug: string }) {
  const [tab, setTab] = useState<Tab>("summary");
  const [copied, setCopied] = useState(false);
  const [shareFailed, setShareFailed] = useState(false);

  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { setShareFailed(true); }
  };

  let content: ReactNode;
  if (tab === "summary") {
    content = (
      <div className="space-y-6">
        <div className="rounded-2xl border border-amber-400/25 bg-amber-400/5 p-4 text-sm leading-relaxed text-slate-300">
          Stones are chosen by <b className="text-amber-200">house lordship</b>, not by birth month or Moon sign alone. For your {r.lagna} ascendant, the ascendant lord is <b style={{ color: PLANET_INFO[r.lagnaLord].color }}>{r.lagnaLord}</b>.
        </div>
        <div>
          <h2 className="mb-1 font-serif text-2xl font-semibold text-emerald-300">Recommended for you</h2>
          <p className="mb-3 text-sm text-slate-400">Classically considered safe and supportive for this ascendant.</p>
          <GemList items={r.primary} empty="No stone qualified as a primary recommendation for this chart." />
        </div>
        {r.supportive.length > 0 && (
          <div>
            <h2 className="mb-1 font-serif text-2xl font-semibold text-sky-300">Optional support</h2>
            <p className="mb-3 text-sm text-slate-400">These can help specific areas, but are not essential.</p>
            <GemList items={r.supportive} empty="" />
          </div>
        )}
        <section className="card p-5">
          <h2 className="font-serif text-2xl font-semibold text-amber-200">Chart used</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[["Ascendant", r.chartSummary.lagnaSign], ["Moon sign", r.chartSummary.moonSign], ["Nakshatra", `${r.chartSummary.nakshatra} · pada ${r.chartSummary.pada}`], ["Born", `${r.chartSummary.date} · ${r.chartSummary.time}`]].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-white/10 bg-slate-950/30 p-3"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{k}</p><p className="mt-1 text-sm font-semibold text-slate-100">{v}</p></div>
            ))}
          </div>
          <div className="scroll-thin mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50"><tr>{["Planet", "Sign", "Degree", "House", "Rules", "Dignity"].map((h) => <th key={h} className="whitespace-nowrap p-3 text-left text-xs font-semibold text-slate-400">{h}</th>)}</tr></thead>
              <tbody>{r.chartSummary.planets.map((p) => (
                <tr key={p.id} className="border-t border-slate-700/40">
                  <td className="p-3 font-bold" style={{ color: PLANET_INFO[p.id].color }}>{p.id}</td>
                  <td className="whitespace-nowrap p-3 text-slate-300">{p.sign}</td>
                  <td className="whitespace-nowrap p-3 font-mono text-xs text-slate-400">{p.degree}</td>
                  <td className="p-3 text-slate-300">{p.house}</td>
                  <td className="p-3 text-slate-300">{p.owns.join(", ") || "—"}</td>
                  <td className="whitespace-nowrap p-3 text-slate-300">{p.dignity}</td>
                </tr>))}
              </tbody>
            </table>
          </div>
          <Link href={`/chart/${chartSlug}`} className="mt-4 inline-flex text-sm font-semibold text-amber-300 hover:underline">Open the full horoscope for this chart →</Link>
        </section>
      </div>
    );
  } else if (tab === "avoid") {
    content = (
      <div>
        <h2 className="mb-1 font-serif text-2xl font-semibold text-rose-300">Stones to avoid</h2>
        <p className="mb-4 text-sm text-slate-400">Each entry explains exactly why, based on what that planet rules in your chart.</p>
        <GemList items={r.avoid} empty="No stone was flagged as one to avoid for this chart." />
      </div>
    );
  } else if (tab === "all") {
    content = (
      <div>
        <p className="mb-4 text-sm text-slate-400">All nine planetary stones with their verdict for your chart, so nothing is hidden.</p>
        <GemList items={r.all} empty="" />
      </div>
    );
  } else if (tab === "wearing") {
    content = (
      <div className="space-y-5">
        <section className="card p-5">
          <h2 className="mb-3 font-serif text-2xl font-semibold text-amber-200">How to wear a gemstone</h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-300">{r.wearingSteps.map((s) => <li key={s}>{s}</li>)}</ol>
        </section>
        <section className="rounded-2xl border border-amber-400/30 bg-amber-400/5 p-5">
          <h2 className="mb-3 font-serif text-xl font-semibold text-amber-200">Before you spend money</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-300">{r.testingAdvice.map((s) => <li key={s}>{s}</li>)}</ul>
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
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />
        <p className="label-caps !text-amber-300">Saved gemstone report</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-slate-100 sm:text-5xl">{r.chartSummary.name}</h1>
        <p className="mt-2 text-sm text-slate-400">{r.chartSummary.date} · {r.chartSummary.time} · {r.chartSummary.place}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-bold text-emerald-300">{r.primary.length} recommended</span>
          <span className="rounded-full bg-rose-500/15 px-4 py-2 text-sm font-bold text-rose-300">{r.avoid.length} to avoid</span>
          <button type="button" onClick={share} className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:border-amber-400">{copied ? "Link copied ✓" : "Share this report"}</button>
          <Link href="/calculators/gemstones" className="rounded-full border border-amber-400/40 px-4 py-2 text-sm text-amber-200 hover:bg-amber-400/10">New chart</Link>
        </div>
        {shareFailed && <p className="mt-2 text-xs text-amber-200">Copy this page’s address from your browser to share it.</p>}
      </header>
      <nav aria-label="Gemstone report sections" className="scroll-thin mb-6 flex gap-2 overflow-x-auto pb-2">
        {TABS.map(([k, icon, text]) => <button key={k} type="button" onClick={() => setTab(k)} aria-pressed={tab === k} className={`shrink-0 rounded-xl border px-4 py-2.5 text-sm transition ${tab === k ? "border-amber-400/60 bg-amber-400/15 font-semibold text-amber-200" : "border-slate-700 bg-slate-900/30 text-slate-400 hover:text-slate-200"}`}>{icon} {text}</button>)}
      </nav>
      <div key={tab} className="animate-pop">{content}</div>
    </div>
  );
}
