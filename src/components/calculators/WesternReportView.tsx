"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SIGN_GLYPH, SIGN_NAMES } from "@/lib/western/data";
import type { WesternReport } from "@/lib/western/report";

const TABS = [
  ["overview", "✦", "Overview"],
  ["planets", "☉", "Planets"],
  ["houses", "🏠", "Houses"],
  ["aspects", "⚹", "Aspects"],
  ["patterns", "🔷", "Patterns"],
  ["life", "📖", "Life areas"],
  ["timing", "⏳", "Transits"],
  ["method", "📐", "Method"],
] as const;
type Tab = (typeof TABS)[number][0];

function Wheel({ r }: { r: WesternReport }) {
  const cx = 180;
  const cy = 180;
  const R = 168;
  const asc = r.angles[0];
  const ascLon = (() => {
    const m = r.identity.rising.match(/(\d+)°(\d+)'\s+(\w+)/);
    if (!m) return 0;
    return SIGN_NAMES.indexOf(m[3] as (typeof SIGN_NAMES)[number]) * 30 + Number(m[1]) + Number(m[2]) / 60;
  })();
  const xy = (lon: number, rad: number) => {
    const th = Math.PI - ((lon - ascLon) * Math.PI) / 180;
    return [cx + rad * Math.cos(th), cy - rad * Math.sin(th)] as const;
  };
  return (
    <svg viewBox="0 0 360 360" className="mx-auto w-full max-w-md">
      <circle cx={cx} cy={cy} r={R} fill="#0b0a1f" stroke="#b45309" strokeWidth="2" />
      <circle cx={cx} cy={cy} r={118} fill="none" stroke="#334155" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={78} fill="none" stroke="#1e293b" strokeWidth="1" />
      {SIGN_NAMES.map((name, i) => {
        const [x1, y1] = xy(i * 30, R);
        const [x2, y2] = xy(i * 30, 78);
        const [tx, ty] = xy(i * 30 + 15, 148);
        return (
          <g key={name}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#475569" strokeWidth="0.8" />
            <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" fontSize="13" fill="#fcd34d">
              {SIGN_GLYPH[i]}
            </text>
          </g>
        );
      })}
      {r.houses.map((h) => {
        const m = h.cusp.match(/(\d+)°(\d+)'\s+(\w+)/);
        if (!m) return null;
        const lon = SIGN_NAMES.indexOf(m[3] as (typeof SIGN_NAMES)[number]) * 30 + Number(m[1]) + Number(m[2]) / 60;
        const [x1, y1] = xy(lon, R);
        const [x2, y2] = xy(lon, 78);
        return <line key={h.house} x1={x1} y1={y1} x2={x2} y2={y2} stroke={h.house % 3 === 1 ? "#fbbf24" : "#64748b"} strokeWidth={h.house % 3 === 1 ? 1.8 : 0.7} />;
      })}
      {r.planets.filter((p) => p.id !== "South Node").map((p) => {
        const m = p.placement.match(/(\d+)°(\d+)'\s+(\w+)/);
        if (!m) return null;
        const lon = SIGN_NAMES.indexOf(m[3] as (typeof SIGN_NAMES)[number]) * 30 + Number(m[1]) + Number(m[2]) / 60;
        const [x, y] = xy(lon, 98);
        return (
          <text key={p.id} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="14" fill={p.color}>
            {p.glyph}
          </text>
        );
      })}
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#94a3b8">
        ASC
      </text>
    </svg>
  );
}

export default function WesternReportView({ report: r }: { report: WesternReport }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [copied, setCopied] = useState(false);
  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };
  const personal = useMemo(() => r.planets.filter((p) => ["Sun", "Moon", "Mercury", "Venus", "Mars"].includes(p.id)), [r.planets]);
  const rest = useMemo(() => r.planets.filter((p) => !["Sun", "Moon", "Mercury", "Venus", "Mars"].includes(p.id)), [r.planets]);

  return (
    <div className="space-y-6">
      <header className="card p-6 sm:p-8">
        <p className="label-caps !text-sky-300">Western · Tropical natal chart</p>
        <h1 className="mt-1 font-serif text-4xl font-semibold text-slate-100">{r.identity.name}</h1>
        <p className="mt-2 text-slate-300">
          {r.identity.date} · {r.identity.time} · {r.identity.place}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-amber-400/15 px-3 py-1.5 text-sm text-amber-200">Sun {r.identity.sun}</span>
          <span className="rounded-full bg-slate-400/15 px-3 py-1.5 text-sm text-slate-200">Moon {r.identity.moon}</span>
          <span className="rounded-full bg-sky-400/15 px-3 py-1.5 text-sm text-sky-200">Rising {r.identity.rising}</span>
          <span className="rounded-full bg-violet-400/15 px-3 py-1.5 text-sm text-violet-200">MC {r.identity.mc}</span>
        </div>
        <p className="mt-3 text-sm text-slate-400">
          {r.identity.lunarPhase} · {r.identity.isDay ? "Day chart" : "Night chart"} · {r.identity.houseSystem} houses
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={share} className="rounded-full border border-slate-600 px-4 py-1.5 text-sm text-slate-300 hover:border-slate-400">
            {copied ? "Link copied ✓" : "Share private link"}
          </button>
          <Link href="/calculators/western-astrology" className="rounded-full border border-sky-400/40 px-4 py-1.5 text-sm text-sky-200 hover:bg-sky-400/10">
            New Western chart
          </Link>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {TABS.map(([id, icon, label]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={`rounded-full px-4 py-2 text-sm ${tab === id ? "bg-sky-400 text-slate-950" : "border border-slate-600 text-slate-300 hover:border-sky-400"}`}>
            {icon} {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="card p-4"><Wheel r={r} /></div>
          <div className="space-y-4">
            {r.bigThree.map((b) => (
              <div key={b.title} className="card p-5">
                <p className="label-caps !text-sky-300">{b.title}</p>
                <p className="mt-1 font-serif text-xl text-slate-100">{b.placement}</p>
                <p className="text-xs text-slate-500">Decan · {b.decan}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{b.text}</p>
              </div>
            ))}
          </div>
          <div className="card p-5 lg:col-span-2">
            <p className="label-caps !text-amber-300">Element & modality</p>
            <p className="mt-3 text-sm text-slate-300">{r.balances.elementText}</p>
            <p className="mt-2 text-sm text-slate-300">{r.balances.modeText}</p>
            <p className="mt-2 text-sm text-sky-200">Chart ruler / dominant emphasis: {r.balances.dominantPlanet}</p>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
              {Object.entries(r.balances.elements).map(([k, v]) => (
                <div key={k} className="rounded-xl bg-slate-950/50 p-3">
                  <p className="text-2xl font-bold text-amber-200">{v}</p>
                  <p className="text-slate-400">{k}</p>
                </div>
              ))}
            </div>
          </div>
          {r.angles.map((a) => (
            <div key={a.name} className="card p-5">
              <p className="label-caps !text-violet-300">{a.name}</p>
              <p className="mt-1 font-serif text-lg text-slate-100">{a.placement}</p>
              <p className="mt-2 text-sm text-slate-300">{a.text}</p>
            </div>
          ))}
          <div className="card p-5 lg:col-span-2">
            <p className="label-caps !text-amber-300">Part of Fortune</p>
            <p className="mt-2 font-serif text-xl text-slate-100">{r.fortune.placement} · house {r.fortune.house}</p>
            <p className="mt-2 text-sm text-slate-300">{r.fortune.text}</p>
          </div>
        </div>
      )}

      {tab === "planets" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">Personal planets first, then social, outer and the nodes. Dignity uses classical domicile / exaltation / detriment / fall.</p>
          {[...personal, ...rest].map((pl) => (
            <article key={pl.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-serif text-2xl" style={{ color: pl.color }}>{pl.glyph} {pl.id}</p>
                  <p className="text-sm text-slate-300">{pl.placement}</p>
                  <p className="text-xs text-slate-500">{pl.keywords} · {pl.speed}{pl.retro ? " · retrograde" : ""}</p>
                </div>
                <span className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-300">{pl.dignity}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{pl.signText}</p>
              <p className="mt-2 text-sm text-slate-400">{pl.houseText}</p>
            </article>
          ))}
        </div>
      )}

      {tab === "houses" && (
        <div className="grid gap-4 md:grid-cols-2">
          {r.houses.map((h) => (
            <article key={h.house} className="card p-5">
              <p className="label-caps !text-sky-300">House {h.house}</p>
              <h3 className="font-serif text-xl text-slate-100">{h.title}</h3>
              <p className="mt-1 text-sm text-slate-400">Cusp {h.cusp} · ruler {h.ruler} in house {h.rulerHouse}</p>
              {h.planets.length > 0 && <p className="mt-2 text-sm text-amber-200">{h.planets.join(" · ")}</p>}
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{h.essay}</p>
              <p className="mt-2 text-sm text-slate-400">{h.reading}</p>
            </article>
          ))}
          {r.intercepted.length > 0 && (
            <div className="card p-5 md:col-span-2">
              <p className="label-caps !text-amber-300">Intercepted signs</p>
              <p className="mt-2 text-sm text-slate-300">These sign-pairs contain no house cusp, so their themes work more inwardly: {r.intercepted.join("; ")}.</p>
            </div>
          )}
        </div>
      )}

      {tab === "aspects" && (
        <div className="space-y-3">
          <p className="text-sm text-slate-400">{r.aspects.length} aspects within orb, tightest first. Applying aspects are still forming.</p>
          {r.aspects.map((a, i) => (
            <div key={`${a.a}-${a.b}-${a.type}-${i}`} className={`rounded-2xl border p-4 ${a.nature === "harmonious" ? "border-emerald-500/30 bg-emerald-500/5" : a.nature === "dynamic" ? "border-rose-500/30 bg-rose-500/5" : "border-slate-600/50 bg-slate-900/30"}`}>
              <p className="font-semibold text-slate-100">{a.a} {a.type.toLowerCase()} {a.b}</p>
              <p className="text-xs text-slate-500">{a.angle.toFixed(1)}° · orb {a.orb.toFixed(2)}° · {a.applying ? "applying" : "separating"} · {a.nature}</p>
              <p className="mt-2 text-sm text-slate-300">{a.meaning}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "patterns" && (
        <div className="grid gap-4 md:grid-cols-2">
          {r.patterns.map((p) => (
            <article key={p.name + p.bodies.join()} className={`card p-5 ${p.present ? "" : "opacity-70"}`}>
              <p className="font-serif text-xl text-slate-100">{p.name}</p>
              {p.bodies.length > 0 && <p className="mt-1 text-xs text-sky-300">{p.bodies.join(" · ")}</p>}
              <p className="mt-3 text-sm text-slate-300">{p.detail}</p>
            </article>
          ))}
        </div>
      )}

      {tab === "life" && (
        <div className="space-y-4">
          {r.lifeAreas.map((a) => (
            <article key={a.title} className="card p-5">
              <h3 className="font-serif text-xl text-slate-100">{a.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{a.text}</p>
            </article>
          ))}
        </div>
      )}

      {tab === "timing" && (
        <div className="space-y-5">
          <article className="card p-5">
            <p className="label-caps !text-amber-300">Secondary progressions</p>
            <p className="mt-2 text-slate-100">Progressed Sun · {r.progressions.sun}</p>
            <p className="text-slate-100">Progressed Moon · {r.progressions.moon}</p>
            <p className="mt-3 text-sm text-slate-300">{r.progressions.text}</p>
          </article>
          <div>
            <p className="mb-3 label-caps !text-sky-300">Current transits to natal</p>
            {r.transits.length === 0 && <p className="card p-5 text-sm text-slate-400">No major outer transits within 2.2° right now. Check again in a few weeks.</p>}
            <div className="space-y-3">
              {r.transits.map((t, i) => (
                <div key={i} className="card p-4">
                  <p className="font-semibold text-slate-100">Transit {t.transiting} {t.type.toLowerCase()} natal {t.natal}</p>
                  <p className="text-xs text-slate-500">orb {t.orb.toFixed(2)}°</p>
                  <p className="mt-2 text-sm text-slate-300">{t.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "method" && (
        <div className="card space-y-3 p-6 text-sm leading-relaxed text-slate-300">
          <h3 className="font-serif text-2xl text-slate-100">How this chart was calculated</h3>
          <ul className="list-disc space-y-2 pl-5">{r.method.map((m) => <li key={m}>{m}</li>)}</ul>
          {r.notes.map((n) => <p key={n} className="text-slate-400">{n}</p>)}
        </div>
      )}
    </div>
  );
}
