"use client";

import { useMemo, useState } from "react";
import type { ChartData } from "@/lib/astro/calc";
import { PLANET_INFO, SIGNS, type PlanetId } from "@/lib/astro/data";
import { computeShadbala, type ShadbalaRow } from "@/lib/astro/shadbala";
import { Row } from "./Modal";

const f1 = (n: number) => n.toFixed(1);
const f2 = (n: number) => n.toFixed(2);

function BarChart({ rows, mode }: { rows: ShadbalaRow[]; mode: "virupa" | "rupa" }) {
  const W = 520;
  const H = 260;
  const pad = { l: 44, r: 10, t: 16, b: 36 };
  const vals = rows.map((r) => (mode === "virupa" ? r.total : r.rupas));
  const req = rows.map((r) => (mode === "virupa" ? r.required * 60 : r.required));
  const max = Math.max(...vals, ...req) * 1.1;
  const min = 0;
  const bw = (W - pad.l - pad.r) / rows.length;
  const y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - (v - min) / (max - min));
  const ticks = 5;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const v = min + ((max - min) * i) / ticks;
        return (
          <g key={i}>
            <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="#334155" strokeWidth="0.6" />
            <text x={pad.l - 6} y={y(v)} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="#94a3b8">
              {mode === "virupa" ? Math.round(v) : v.toFixed(1)}
            </text>
          </g>
        );
      })}
      {rows.map((r, i) => {
        const v = vals[i];
        const x = pad.l + i * bw + bw * 0.18;
        const w = bw * 0.64;
        return (
          <g key={r.id}>
            <rect x={x} y={y(v)} width={w} height={y(min) - y(v)} rx="3" fill={r.strong ? PLANET_INFO[r.id].color : "#f43f5e"} fillOpacity="0.8" />
            <line x1={x - 3} x2={x + w + 3} y1={y(req[i])} y2={y(req[i])} stroke="#f8fafc" strokeWidth="1.5" strokeDasharray="3 2" />
            <text x={x + w / 2} y={y(v) - 5} textAnchor="middle" fontSize="10" fontWeight="700" fill="#e2e8f0">
              {mode === "virupa" ? Math.round(v) : v.toFixed(2)}
            </text>
            <text x={x + w / 2} y={H - pad.b + 16} textAnchor="middle" fontSize="11" fill="#cbd5e1">
              {r.id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Detail({ r }: { r: ShadbalaRow }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-xl bg-slate-900/50 p-4 text-sm">
        <p className="label-caps mb-2 !text-amber-300">Sthana Bala · {f2(r.sthana)}</p>
        <Row k="Uchcha" v={f2(r.sthanaParts.uchcha)} />
        <Row k="Saptavargaja" v={f2(r.sthanaParts.saptavargaja)} />
        <Row k="Ojayugmarasyamsa" v={f2(r.sthanaParts.ojayugma)} />
        <Row k="Kendradi" v={f2(r.sthanaParts.kendradi)} />
        <Row k="Drekkana" v={f2(r.sthanaParts.drekkana)} />
      </div>
      <div className="rounded-xl bg-slate-900/50 p-4 text-sm">
        <p className="label-caps mb-2 !text-violet-300">Kala Bala · {f2(r.kala)}</p>
        <Row k="Nathonnata" v={f2(r.kalaParts.nathonnata)} />
        <Row k="Paksha" v={f2(r.kalaParts.paksha)} />
        <Row k="Tribhaga" v={f2(r.kalaParts.tribhaga)} />
        <Row k="Abda / Masa" v={`${f2(r.kalaParts.abda)} / ${f2(r.kalaParts.masa)}`} />
        <Row k="Vara / Hora" v={`${f2(r.kalaParts.vara)} / ${f2(r.kalaParts.hora)}`} />
        <Row k="Ayana" v={f2(r.kalaParts.ayana)} />
        <Row k="Yuddha" v={f2(r.kalaParts.yuddha)} />
      </div>
      <div className="rounded-xl bg-slate-900/50 p-4 text-sm">
        <p className="label-caps mb-2 !text-sky-300">Saptavarga dignities</p>
        {r.vargaDetail.map((v) => (
          <Row key={v.varga} k={v.varga} v={`${SIGNS[v.sign].sa} · ${v.label} (${v.pts})`} vClass={v.pts >= 30 ? "text-emerald-400" : v.pts >= 15 ? "text-sky-300" : v.pts >= 10 ? "text-slate-200" : "text-rose-400"} />
        ))}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-emerald-500/10 p-2 text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Ishta</p>
            <p className="font-bold text-emerald-300">{f2(r.ishta)}</p>
          </div>
          <div className="rounded-lg bg-rose-500/10 p-2 text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Kashta</p>
            <p className="font-bold text-rose-300">{f2(r.kashta)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShadbalaSection({ c }: { c: ChartData }) {
  const { rows, ctx } = useMemo(() => computeShadbala(c), [c]);
  const [sel, setSel] = useState<PlanetId>("Sun");
  const r = rows.find((x) => x.id === sel)!;
  const strongest = [...rows].sort((a, b) => b.total - a.total)[0];
  const weakest = [...rows].sort((a, b) => a.total - b.total)[0];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <p className="mb-1 text-center text-sm font-semibold text-slate-300">Shadbala in Virupas</p>
          <BarChart rows={rows} mode="virupa" />
        </div>
        <div className="card p-4">
          <p className="mb-1 text-center text-sm font-semibold text-slate-300">Shadbala in Rupas (dashed line = minimum required)</p>
          <BarChart rows={rows} mode="rupa" />
        </div>
      </div>
      <p className="text-sm text-slate-300">
        Strongest planet: <b style={{ color: PLANET_INFO[strongest.id].color }}>{strongest.id}</b> ({f1(strongest.total)} virupas) · Weakest: <b style={{ color: PLANET_INFO[weakest.id].color }}>{weakest.id}</b> ({f1(weakest.total)} virupas). A planet meeting its required Rupas can give its results confidently; the relative order shows which planets dominate your chart.
      </p>
      <div className="card scroll-thin overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              {["Planet", "Sthana", "Dig", "Kala", "Cheshta", "Naisargika", "Drik", "Total (Virupa)", "Rupas", "Required", "Ratio", "Rank"].map((h) => (
                <th key={h} className="whitespace-nowrap px-3 py-2.5 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/40">
            {rows.map((s) => (
              <tr key={s.id} onClick={() => setSel(s.id)} className={`cursor-pointer ${sel === s.id ? "bg-amber-400/10" : "hover:bg-white/5"}`}>
                <td className="whitespace-nowrap px-3 py-2.5 font-bold" style={{ color: PLANET_INFO[s.id].color }}>
                  {s.id}
                </td>
                <td className="px-3 py-2.5">{f2(s.sthana)}</td>
                <td className="px-3 py-2.5">{f2(s.dig)}</td>
                <td className="px-3 py-2.5">{f2(s.kala)}</td>
                <td className="px-3 py-2.5">{f2(s.cheshta)}</td>
                <td className="px-3 py-2.5">{f2(s.naisargika)}</td>
                <td className={`px-3 py-2.5 ${s.drik < 0 ? "text-rose-400" : ""}`}>{f2(s.drik)}</td>
                <td className="px-3 py-2.5 font-semibold">{f2(s.total)}</td>
                <td className="px-3 py-2.5 font-bold">{f2(s.rupas)}</td>
                <td className="px-3 py-2.5">{s.required}</td>
                <td className={`px-3 py-2.5 ${s.strong ? "text-emerald-400" : "text-rose-400"}`}>{(s.ratio * 100).toFixed(0)}%</td>
                <td className="px-3 py-2.5 text-amber-300">#{s.rank}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-400">Detailed breakdown:</span>
          {rows.map((x) => (
            <button key={x.id} type="button" onClick={() => setSel(x.id)} className={`rounded-full px-3 py-1 text-sm transition ${sel === x.id ? "bg-amber-400 font-semibold text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
              {x.id}
            </button>
          ))}
        </div>
        <Detail r={r} />
        <p className="mt-4 text-xs text-slate-500">
          {ctx.isDay ? "Day" : "Night"} birth · Vara lord {ctx.varaLord} · Hora lord {ctx.horaLord} · Tribhaga lord {ctx.tribhagaLord} · Masa lord {ctx.masaLord} · Abda lord {ctx.abdaLord}. Method: BPHS / B.V. Raman — Saptavarga dignities by Panchadha (five-fold) relationship, Moolatrikona in Rasi only; Cheshta Kendra per Surya Siddhanta (Seeghrochcha − ½(mean + true)); Sun&apos;s Cheshta = Ayana Bala, Moon&apos;s Cheshta = Paksha Bala; Abda/Masa lords from the weekday of Mesha and current solar sankranti; Drik Bala = ¼(benefic − malefic drishti). Values match common software (Prokerala, JHora) within a few virupas; small differences arise from ayanamsa and house conventions.
        </p>
      </div>
    </div>
  );
}
