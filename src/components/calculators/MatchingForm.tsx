"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import BirthDetailsFields, { checkDraft, emptyBirthDraft, type BirthDraft } from "./BirthDetailsFields";
import { addSavedReport } from "@/lib/saved-reports";

const DRAFT_KEY = "jyotisha:marriage-matching:draft-v1";

function restore(value: unknown, fallback: BirthDraft): BirthDraft {
  if (!value || typeof value !== "object") return fallback;
  const v = value as Record<string, unknown>;
  const out = { ...fallback };
  for (const k of ["name", "date", "time", "place", "lat", "lon", "tz"] as const) if (typeof v[k] === "string") out[k] = v[k].slice(0, 160);
  out.gender = v.gender === "female" ? "female" : "male";
  out.locationConfirmed = v.locationConfirmed === true;
  out.manualCoordinates = v.manualCoordinates === true;
  return out;
}

const payload = (d: BirthDraft) => ({ name: d.name.trim(), gender: d.gender, date: d.date, time: d.time, place: d.place.trim(), lat: Number(d.lat), lon: Number(d.lon), tz: d.tz.trim() });

export default function MatchingForm() {
  const router = useRouter();
  const [first, setFirst] = useState(() => emptyBirthDraft("male"));
  const [second, setSecond] = useState(() => emptyBirthDraft("female"));
  const [style, setStyle] = useState<"north" | "south">("north");
  const [hydrated, setHydrated] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw && raw.length < 12_000) {
        const v = JSON.parse(raw) as Record<string, unknown>;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Restore this form's saved draft after client hydration.
        setFirst(restore(v.first, emptyBirthDraft("male")));
        setSecond(restore(v.second, emptyBirthDraft("female")));
        setStyle(v.style === "south" ? "south" : "north");
      }
    } catch { /* storage unavailable */ }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    const t = window.setTimeout(() => {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ first, second, style })); setDraftSaved(true); } catch { setDraftSaved(false); }
    }, 300);
    return () => window.clearTimeout(t);
  }, [first, second, style, hydrated]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const problem = checkDraft(first, "Person 1") || checkDraft(second, "Person 2");
    if (problem) { setError(problem); return; }
    setBusy(true); setError("");
    const abort = new AbortController();
    const timer = window.setTimeout(() => abort.abort(), 45_000);
    try {
      const res = await fetch("/api/matches", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ first: payload(first), second: payload(second), style }), signal: abort.signal });
      let data: { slug?: string; url?: string; error?: string };
      try { data = await res.json(); } catch { throw new Error("The server response was interrupted. Your draft is saved; please try again."); }
      if (!res.ok || !data.slug) throw new Error(data.error || "Could not save this matching report. Please try again.");
      addSavedReport(`/calculators/marriage-matching/${data.slug}`, `${first.name.trim()} & ${second.name.trim()} · Marriage matching`);
      try {
        const recentRaw = localStorage.getItem("jyotisha:recent-matches");
        const recent = recentRaw ? JSON.parse(recentRaw) : [];
        localStorage.setItem("jyotisha:recent-matches", JSON.stringify([{ slug: data.slug, names: `${first.name} & ${second.name}` }, ...(Array.isArray(recent) ? recent : [])].slice(0, 5)));
      } catch { /* optional local history */ }
      router.push(`/calculators/marriage-matching/${data.slug}`);
    } catch (e) {
      setError(e instanceof Error && e.name === "AbortError" ? "Calculation took too long. Your birth details are saved on this device; please retry." : e instanceof Error ? e.message : "Calculation failed. Your draft is saved; please retry.");
      setBusy(false);
    } finally { window.clearTimeout(timer); }
  };

  const clear = () => {
    setFirst(emptyBirthDraft("male")); setSecond(emptyBirthDraft("female")); setError("");
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="rounded-2xl border border-amber-400/25 bg-amber-400/5 p-4 text-sm leading-relaxed text-slate-300">
        <b className="text-amber-200">Same calculations as your main horoscope.</b> Enter each person’s recorded birth time and place. The report uses North Indian Ashtakoota (36 points), plus both full charts, Manglik balance, Nadi/Bhakoot reviews and remedies.
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <BirthDetailsFields title="Person 1" subtitle="Used in the traditional groom column of directional scoring tables." value={first} onChange={setFirst} disabled={busy} />
        <BirthDetailsFields title="Person 2" subtitle="Used in the traditional bride column of directional scoring tables." value={second} onChange={setSecond} disabled={busy} accent="pink" />
      </div>
      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="font-semibold text-slate-100">Chart drawing style</p><p className="text-xs text-slate-400">Changes the drawing only, not the matching score.</p></div>
          <div className="flex rounded-xl border border-slate-600/50 p-1">
            {(["north", "south"] as const).map((s) => <button key={s} type="button" disabled={busy} onClick={() => setStyle(s)} aria-pressed={style === s} className={`rounded-lg px-4 py-2 text-sm transition ${style === s ? "bg-amber-400 font-semibold text-slate-950" : "text-slate-300 hover:bg-white/5"}`}>{s === "north" ? "North Indian" : "South Indian"}</button>)}
          </div>
        </div>
      </div>
      {error && <div role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-slate-500"><p>{draftSaved ? "✓ Draft saved on this device" : "Your report is saved after calculation."}</p><button type="button" onClick={clear} disabled={busy} className="mt-1 text-slate-400 underline hover:text-slate-200">Clear birth details</button></div>
        <button type="submit" disabled={busy || !hydrated} className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 px-9 py-4 font-semibold text-slate-950 shadow-[0_10px_35px_rgba(249,115,22,0.25)] transition hover:brightness-110 disabled:opacity-60">
          {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" aria-hidden="true" />}
          {busy ? "Calculating & saving both charts…" : "Calculate compatibility →"}
        </button>
      </div>
      <p className="text-center text-xs leading-relaxed text-slate-500">Both people’s details will be stored with an unguessable report link. Anyone you share that link with can see them. A traditional score is guidance—not a medical test or a guarantee of a successful marriage.</p>
      <p className="text-center text-sm text-slate-400">Want an individual horoscope instead? <Link href="/build" className="text-amber-300 hover:underline">Build a birth chart</Link></p>
    </form>
  );
}
