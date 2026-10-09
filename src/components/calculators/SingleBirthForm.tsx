"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import BirthDetailsFields, { checkDraft, emptyBirthDraft, type BirthDraft } from "./BirthDetailsFields";
import { addSavedReport } from "@/lib/saved-reports";

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

/** Shared single-person calculator form: draft recovery, one validation path, honest errors. */
export default function SingleBirthForm({ endpoint, draftKey, submitLabel, busyLabel, intro, showStyle = true, birthDetailsSubtitle }: { endpoint: string; draftKey: string; submitLabel: string; busyLabel: string; intro: string; showStyle?: boolean; birthDetailsSubtitle?: string }) {
  const router = useRouter();
  const [person, setPerson] = useState(() => emptyBirthDraft("male"));
  const [style, setStyle] = useState<"north" | "south">("north");
  const [hydrated, setHydrated] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw && raw.length < 8_000) {
        const v = JSON.parse(raw) as Record<string, unknown>;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Restore this form's saved draft after client hydration.
        setPerson(restore(v.person, emptyBirthDraft("male")));
        setStyle(v.style === "south" ? "south" : "north");
      }
    } catch { /* storage unavailable */ }
    setHydrated(true);
  }, [draftKey]);

  useEffect(() => {
    if (!hydrated) return;
    const t = window.setTimeout(() => {
      try { localStorage.setItem(draftKey, JSON.stringify({ person, style })); setDraftSaved(true); } catch { setDraftSaved(false); }
    }, 300);
    return () => window.clearTimeout(t);
  }, [person, style, hydrated, draftKey]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const problem = checkDraft(person, "Birth details");
    if (problem) { setError(problem); return; }
    setBusy(true); setError("");
    const abort = new AbortController();
    const timer = window.setTimeout(() => abort.abort(), 45_000);
    try {
      const res = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: abort.signal,
        body: JSON.stringify({ person: { name: person.name.trim(), gender: person.gender, date: person.date, time: person.time, place: person.place.trim(), lat: Number(person.lat), lon: Number(person.lon), tz: person.tz.trim() }, style }),
      });
      let data: { slug?: string; url?: string; error?: string };
      try { data = await res.json(); } catch { throw new Error("The server response was interrupted. Your details are saved; please try again."); }
      if (!res.ok || !data.url) throw new Error(data.error || "Could not save this report. Please try again.");
      const calculator = endpoint.split("/").pop()?.replace(/-/g, " ") ?? "Astrology report";
      addSavedReport(data.url, `${person.name.trim()} · ${calculator}`);
      router.push(data.url);
    } catch (e) {
      setError(e instanceof Error && e.name === "AbortError" ? "Calculation took too long. Your birth details are saved on this device; please retry." : e instanceof Error ? e.message : "Calculation failed. Please retry.");
      setBusy(false);
    } finally { window.clearTimeout(timer); }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="rounded-2xl border border-amber-400/25 bg-amber-400/5 p-4 text-sm leading-relaxed text-slate-300">{intro}</div>
      <BirthDetailsFields title="Birth details" subtitle={birthDetailsSubtitle ?? "Accurate birth time and place give accurate house and yoga results."} value={person} onChange={setPerson} disabled={busy} />
      {showStyle && (
        <div className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div><p className="font-semibold text-slate-100">Chart drawing style</p><p className="text-xs text-slate-400">Affects only how charts are drawn, never the calculations.</p></div>
            <div className="flex rounded-xl border border-slate-600/50 p-1">
              {(["north", "south"] as const).map((s) => <button key={s} type="button" disabled={busy} onClick={() => setStyle(s)} aria-pressed={style === s} className={`rounded-lg px-4 py-2 text-sm transition ${style === s ? "bg-amber-400 font-semibold text-slate-950" : "text-slate-300 hover:bg-white/5"}`}>{s === "north" ? "North Indian" : "South Indian"}</button>)}
            </div>
          </div>
        </div>
      )}
      {error && <div role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-slate-500">
          <p>{draftSaved ? "✓ Draft saved on this device" : "Your report is saved after calculation."}</p>
          <button type="button" onClick={() => { setPerson(emptyBirthDraft("male")); setError(""); try { localStorage.removeItem(draftKey); } catch { /* ignore */ } }} disabled={busy} className="mt-1 text-slate-400 underline hover:text-slate-200">Clear birth details</button>
        </div>
        <button type="submit" disabled={busy || !hydrated} className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 px-9 py-4 font-semibold text-slate-950 shadow-[0_10px_35px_rgba(249,115,22,0.25)] transition hover:brightness-110 disabled:opacity-60">
          {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" aria-hidden="true" />}
          {busy ? busyLabel : submitLabel}
        </button>
      </div>
      <p className="text-center text-xs text-slate-500">Your birth details are stored with an unguessable report link. Anyone with that link can see them.</p>
      <p className="text-center text-sm text-slate-400">Need the full horoscope instead? <Link href="/build" className="text-amber-300 hover:underline">Build your complete birth chart</Link></p>
    </form>
  );
}
