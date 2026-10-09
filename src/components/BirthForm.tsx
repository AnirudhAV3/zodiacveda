"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { addSavedReport } from "@/lib/saved-reports";
import BirthProfileControls from "@/components/BirthProfileControls";
import type { BirthDraft } from "@/components/calculators/BirthDetailsFields";
import type { SavedBirthProfile } from "@/lib/saved-profiles";

interface Place {
  label: string;
  lat: number;
  lon: number;
  tz: string;
}

function formatTime(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}:${d.slice(2)}`;
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export default function BirthForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [gender, setGender] = useState("male");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [place, setPlace] = useState<Place | null>(null);
  const [manual, setManual] = useState(false);
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [tz, setTz] = useState("Asia/Kolkata");
  const [style, setStyle] = useState<"north" | "south">("north");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (place && query === place.label) return;
    if (timer.current) clearTimeout(timer.current);
    if (query.trim().length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Remove stale autocomplete results when the query is too short.
      setResults([]);
      return;
    }
    timer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
        const j = (await r.json()) as { results: Place[] };
        setResults(j.results);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  }, [query, place]);

  const choose = (p: Place) => {
    setPlace(p);
    setQuery(p.label);
    setResults([]);
    setLat(p.lat.toFixed(4));
    setLon(p.lon.toFixed(4));
    setTz(p.tz);
  };

  const profileDraft: BirthDraft = {
    name,
    gender: gender === "female" ? "female" : "male",
    date,
    time,
    place: place?.label ?? query,
    lat,
    lon,
    tz,
    locationConfirmed: Boolean(place),
    manualCoordinates: manual,
  };
  const selectProfile = (profile: SavedBirthProfile) => {
    const selectedPlace = { label: profile.place, lat: Number(profile.lat), lon: Number(profile.lon), tz: profile.tz };
    setName(profile.name);
    setGender(profile.gender);
    setDate(profile.date);
    setTime(profile.time);
    setQuery(profile.place);
    setPlace(selectedPlace);
    setLat(profile.lat);
    setLon(profile.lon);
    setTz(profile.tz);
    setManual(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !date || !time) return setError("Please fill name, date and time of birth.");
    if (!TIME_RE.test(time)) return setError("Enter time of birth in 24-hour format HH:MM (e.g. 15:04 for 3:04 PM).");
    if (!place && !manual) return setError("Please select a birth place from the suggestions or enter coordinates manually.");
    if (!lat || !lon || !tz) return setError("Latitude, longitude and time zone are required.");
    setLoading(true);
    try {
      const r = await fetch("/api/charts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, gender, date, time, place: place?.label || query || `${lat}, ${lon}`, lat: Number(lat), lon: Number(lon), tz, style }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed");
      addSavedReport(`/chart/${j.slug}`, `${name.trim()} · Birth chart`);
      router.push(`/chart/${j.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="card animate-pop mx-auto w-full max-w-2xl space-y-6 p-6 sm:p-10">
      <div className="text-center">
        <p className="label-caps !text-amber-300">Step into the cosmos</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-slate-100">Enter Birth Details</h1>
        <p className="mt-2 text-sm text-slate-400">Accurate time and place give accurate charts.</p>
      </div>

      <BirthProfileControls value={profileDraft} onSelect={selectProfile} />

      <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
        <label className="block">
          <span className="label-caps">Full Name</span>
          <input className="input mt-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Arjun Sharma" required />
        </label>
        <div>
          <span className="label-caps">Gender</span>
          <div className="mt-2 flex rounded-xl border border-slate-600/40 p-1">
            {["male", "female"].map((g) => (
              <button type="button" key={g} onClick={() => setGender(g)} className={`rounded-lg px-4 py-2 text-sm capitalize transition ${gender === g ? "bg-amber-400 text-slate-950" : "text-slate-300"}`}>
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="label-caps">Date of Birth</span>
          <input type="date" className="input mt-2" value={date} onChange={(e) => setDate(e.target.value)} min="1800-01-01" max="2100-12-31" required />
        </label>
        <label className="block">
          <span className="label-caps">Time of Birth (24-hour)</span>
          <div className="relative mt-2">
            <input
              type="text"
              inputMode="numeric"
              className="input pr-20 font-mono tracking-wider"
              value={time}
              onChange={(e) => setTime(formatTime(e.target.value))}
              placeholder="HH:MM"
              maxLength={5}
              required
              aria-describedby="time-help"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 select-none rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[11px] font-bold tracking-widest text-amber-300/80">24 HRS</span>
          </div>
          <span id="time-help" className="mt-1 block text-xs text-slate-500">
            e.g. 15:04 for 3:04 PM · 00:30 for 12:30 AM
          </span>
        </label>
      </div>

      <div className="relative">
        <span className="label-caps">Place of Birth</span>
        <input
          className="input mt-2"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPlace(null);
          }}
          placeholder="Start typing a city — e.g. Mumbai"
          autoComplete="off"
        />
        {searching && <span className="absolute right-3 top-10 text-xs text-slate-400">searching…</span>}
        {results.length > 0 && (
          <ul className="scroll-thin absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-slate-600/50 bg-slate-900/95 shadow-2xl">
            {results.map((p, i) => (
              <li key={i}>
                <button type="button" onClick={() => choose(p)} className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-amber-400/10">
                  <span>{p.label}</span>
                  <span className="text-xs text-slate-500">{p.tz}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {place && (
          <p className="mt-2 text-xs text-emerald-400">
            ✓ {place.lat.toFixed(3)}°, {place.lon.toFixed(3)}° · {place.tz}
          </p>
        )}
        <button type="button" onClick={() => setManual((m) => !m)} className="mt-2 text-xs text-amber-300 hover:underline">
          {manual ? "Hide" : "Enter"} coordinates / time zone manually
        </button>
        {manual && (
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <input className="input" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Latitude (e.g. 19.07)" />
            <input className="input" value={lon} onChange={(e) => setLon(e.target.value)} placeholder="Longitude (e.g. 72.87)" />
            <input className="input" value={tz} onChange={(e) => setTz(e.target.value)} placeholder="Asia/Kolkata or UTC+05:30" />
          </div>
        )}
      </div>

      <div>
        <span className="label-caps">Chart Style</span>
        <div className="mt-3 grid grid-cols-2 gap-4">
          {(["north", "south"] as const).map((s) => (
            <button type="button" key={s} onClick={() => setStyle(s)} className={`flex flex-col items-center gap-3 rounded-2xl border p-4 transition ${style === s ? "border-amber-400 bg-amber-400/10" : "border-slate-600/40 hover:border-slate-400"}`}>
              <svg viewBox="0 0 100 100" className="h-20 w-20">
                <rect x="2" y="2" width="96" height="96" fill="none" stroke={style === s ? "#fbbf24" : "#64748b"} strokeWidth="2" />
                {s === "north" ? (
                  <g stroke={style === s ? "#fbbf24" : "#64748b"} strokeWidth="1.5" fill="none">
                    <line x1="2" y1="2" x2="98" y2="98" />
                    <line x1="98" y1="2" x2="2" y2="98" />
                    <polygon points="50,2 98,50 50,98 2,50" />
                  </g>
                ) : (
                  <g stroke={style === s ? "#fbbf24" : "#64748b"} strokeWidth="1.5" fill="none">
                    <line x1="26" y1="2" x2="26" y2="98" />
                    <line x1="74" y1="2" x2="74" y2="98" />
                    <line x1="2" y1="26" x2="98" y2="26" />
                    <line x1="2" y1="74" x2="98" y2="74" />
                    <rect x="26" y="26" width="48" height="48" fill="#0f172a" />
                  </g>
                )}
              </svg>
              <span className="text-sm font-medium">{s === "north" ? "North Indian" : "South Indian"}</span>
            </button>
          ))}
        </div>
      </div>

      {error && <p className="rounded-lg bg-rose-500/10 px-4 py-2 text-sm text-rose-300">{error}</p>}

      <button type="submit" disabled={loading} className="w-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 py-4 text-lg font-semibold text-slate-950 shadow-[0_10px_40px_rgba(249,115,22,0.35)] transition hover:brightness-110 disabled:opacity-60">
        {loading ? "Calculating planetary positions…" : "Submit & Generate Chart ✦"}
      </button>
    </form>
  );
}
