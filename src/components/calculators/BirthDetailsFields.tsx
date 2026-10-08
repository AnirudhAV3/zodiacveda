"use client";

import { useEffect, useId, useState } from "react";

export interface BirthDraft {
  name: string;
  gender: "male" | "female";
  date: string;
  time: string;
  place: string;
  lat: string;
  lon: string;
  tz: string;
  locationConfirmed: boolean;
  manualCoordinates: boolean;
}
export const emptyBirthDraft = (gender: "male" | "female"): BirthDraft => ({ name: "", gender, date: "", time: "", place: "", lat: "", lon: "", tz: "Asia/Kolkata", locationConfirmed: false, manualCoordinates: false });

interface PlaceResult { label: string; lat: number; lon: number; tz: string }
const formatTime = (raw: string) => { const d = raw.replace(/\D/g, "").slice(0, 4); return d.length <= 2 ? d : `${d.slice(0, 2)}:${d.slice(2)}`; };

export function checkDraft(draft: BirthDraft, person: string): string | null {
  if (!draft.name.trim()) return `${person}: enter a name.`;
  if (!draft.date) return `${person}: enter a date of birth.`;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(draft.time)) return `${person}: enter time in 24-hour HH:MM format.`;
  if (!draft.place.trim()) return `${person}: enter the birth place.`;
  if (!draft.locationConfirmed && !draft.manualCoordinates) return `${person}: select a city from the suggestions or enter coordinates manually.`;
  if (!draft.lat.trim() || !draft.lon.trim() || !draft.tz.trim()) return `${person}: latitude, longitude and time zone are required.`;
  const lat = Number(draft.lat), lon = Number(draft.lon);
  if (!Number.isFinite(lat) || lat <= -90 || lat >= 90 || !Number.isFinite(lon) || lon < -180 || lon > 180) return `${person}: check the latitude and longitude.`;
  return null;
}

export default function BirthDetailsFields({ title, subtitle, value, onChange, disabled = false, accent = "amber" }: { title: string; subtitle: string; value: BirthDraft; onChange: (value: BirthDraft) => void; disabled?: boolean; accent?: "amber" | "pink" }) {
  const id = useId();
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [lookupNote, setLookupNote] = useState("");
  const patch = (v: Partial<BirthDraft>) => onChange({ ...value, ...v });

  useEffect(() => {
    if (value.locationConfirmed || value.manualCoordinates || value.place.trim().length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Clear suggestions when lookup is no longer applicable.
      setResults([]);
      setSearching(false);
      setLookupNote("");
      return;
    }
    const abort = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);
      setLookupNote("");
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(value.place.trim())}`, { signal: abort.signal });
        if (!res.ok) throw new Error();
        const data = await res.json() as { results?: PlaceResult[]; error?: string };
        if (abort.signal.aborted) return;
        const list = Array.isArray(data.results) ? data.results : [];
        setResults(list);
        if (!list.length) setLookupNote(data.error ? "City lookup is temporarily unavailable. Use manual coordinates below." : "No city found. Try a nearby city or enter coordinates manually.");
      } catch {
        if (!abort.signal.aborted) setLookupNote("City lookup is temporarily unavailable. Use manual coordinates below.");
      } finally {
        if (!abort.signal.aborted) setSearching(false);
      }
    }, 350);
    return () => { abort.abort(); window.clearTimeout(timer); };
  }, [value.place, value.locationConfirmed, value.manualCoordinates]);

  const choose = (p: PlaceResult) => {
    patch({ place: p.label, lat: String(p.lat), lon: String(p.lon), tz: p.tz, locationConfirmed: true });
    setResults([]);
    setLookupNote("");
  };
  const label = "label-caps mb-2 block";
  const color = accent === "pink" ? "text-pink-300" : "text-amber-300";

  return (
    <fieldset disabled={disabled} className="card relative min-w-0 p-5 sm:p-6">
      <legend className={`px-2 font-serif text-2xl font-semibold ${color}`}>{title}</legend>
      <p className="mb-5 text-xs text-slate-400">{subtitle}</p>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_150px]">
          <div>
            <label htmlFor={`${id}-name`} className={label}>Full name</label>
            <input id={`${id}-name`} className="input" value={value.name} onChange={(e) => patch({ name: e.target.value })} maxLength={80} placeholder="Full name" required autoComplete="off" />
          </div>
          <div>
            <label htmlFor={`${id}-gender`} className={label}>Individual chart</label>
            <select id={`${id}-gender`} value={value.gender} onChange={(e) => patch({ gender: e.target.value as BirthDraft["gender"] })} className="input">
              <option value="male">Male</option><option value="female">Female</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor={`${id}-date`} className={label}>Date of birth</label>
            <input id={`${id}-date`} type="date" className="input" value={value.date} onChange={(e) => patch({ date: e.target.value })} min="1800-01-01" max={new Date().toISOString().slice(0, 10)} required />
          </div>
          <div>
            <label htmlFor={`${id}-time`} className={label}>Time of birth</label>
            <div className="relative">
              <input id={`${id}-time`} className="input pr-20 font-mono" inputMode="numeric" placeholder="HH:MM" maxLength={5} value={value.time} onChange={(e) => patch({ time: formatTime(e.target.value) })} pattern="([01][0-9]|2[0-3]):[0-5][0-9]" required aria-describedby={`${id}-time-help`} />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 select-none rounded bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-amber-300">24 HRS</span>
            </div>
            <p id={`${id}-time-help`} className="mt-1 text-[11px] text-slate-500">15:04 = 3:04 PM</p>
          </div>
        </div>
        <div className="relative">
          <label htmlFor={`${id}-place`} className={label}>Place of birth</label>
          <input id={`${id}-place`} className="input" role="combobox" aria-autocomplete="list" value={value.place} maxLength={160} onChange={(e) => patch({ place: e.target.value, locationConfirmed: false, ...(value.manualCoordinates ? {} : { lat: "", lon: "" }) })} placeholder="Search a city, e.g. Nellore" autoComplete="off" required aria-expanded={results.length > 0} aria-controls={results.length ? `${id}-places` : undefined} />
          {searching && <p className="mt-1 text-xs text-slate-400" role="status">Searching places…</p>}
          {results.length > 0 && (
            <ul id={`${id}-places`} aria-label="Birth place suggestions" className="scroll-thin absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-600 bg-[#10142b] p-1 shadow-2xl">
              {results.map((p, i) => (
                <li key={`${p.label}-${i}`}><button type="button" onClick={() => choose(p)} className="w-full rounded-lg p-3 text-left text-sm transition hover:bg-amber-400/10"><span className="block text-slate-100">{p.label}</span><span className="text-xs text-slate-500">{p.lat.toFixed(4)}°, {p.lon.toFixed(4)}° · {p.tz}</span></button></li>
              ))}
            </ul>
          )}
          {value.locationConfirmed && <p className="mt-1 text-xs text-emerald-300">✓ {value.lat}°, {value.lon}° · {value.tz}</p>}
          {lookupNote && <p className="mt-1 text-xs text-amber-200" role="status">{lookupNote}</p>}
        </div>
        <div>
          <button type="button" onClick={() => patch({ manualCoordinates: !value.manualCoordinates })} className={`text-xs font-semibold ${color} hover:underline`} aria-expanded={value.manualCoordinates}>
            {value.manualCoordinates ? "Hide manual coordinates" : "Enter coordinates / time zone manually"}
          </button>
          {value.manualCoordinates && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div><label htmlFor={`${id}-lat`} className={label}>Latitude</label><input id={`${id}-lat`} type="number" step="any" className="input" value={value.lat} onChange={(e) => patch({ lat: e.target.value })} placeholder="14.4499" min="-89.9999" max="89.9999" required /></div>
              <div><label htmlFor={`${id}-lon`} className={label}>Longitude</label><input id={`${id}-lon`} type="number" step="any" className="input" value={value.lon} onChange={(e) => patch({ lon: e.target.value })} placeholder="79.9870" min="-180" max="180" required /></div>
              <div className="sm:col-span-2"><label htmlFor={`${id}-tz`} className={label}>Time zone</label><input id={`${id}-tz`} className="input" value={value.tz} maxLength={80} onChange={(e) => patch({ tz: e.target.value })} placeholder="Asia/Kolkata or UTC+05:30" required /><p className="mt-1 text-[11px] text-slate-500">Use the birth place’s time zone, not your current location.</p></div>
            </div>
          )}
        </div>
      </div>
    </fieldset>
  );
}
