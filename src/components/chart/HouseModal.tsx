"use client";

import { useEffect, useState } from "react";
import type { ChartData } from "@/lib/astro/calc";
import { fmtDegShort } from "@/lib/astro/calc";
import { BHAVAS, NAKSHATRAS, PLANET_INFO, SIGNS, type PlanetId } from "@/lib/astro/data";
import { IN_HOUSE, IN_SIGN } from "@/lib/astro/texts";
import { aspectedHouses, dignity, functionalNature, naturalNature, relationTo } from "@/lib/astro/analysis";
import Modal from "./Modal";
import { ELEMENT_COLORS } from "./ChartSVG";

export type Varga = "D1" | "D9" | "D10";
export const vargaAsc = (c: ChartData, v: Varga) => (v === "D1" ? c.asc.sign : v === "D9" ? c.asc.d9 : c.asc.d10);
export const vargaSign = (p: ChartData["planets"][number], v: Varga) => (v === "D1" ? p.sign : v === "D9" ? p.d9 : p.d10);

const ELEMENT_IDX: Record<string, number> = { Fire: 0, Earth: 1, Air: 2, Water: 3 };

function Section({ icon, title, accent, children, hint }: { icon: string; title: string; accent: string; children: React.ReactNode; hint?: string }) {
  return (
    <section className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.01] shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
      <div className="flex flex-wrap items-center gap-3 border-b border-white/10 px-5 py-4 sm:px-6" style={{ background: `linear-gradient(90deg, ${accent}2e, transparent 70%)` }}>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl text-lg" style={{ background: `${accent}33`, color: accent }}>
          {icon}
        </span>
        <h3 className="font-serif text-2xl font-semibold text-slate-50">{title}</h3>
        {hint && <span className="ml-auto rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-200">👆 {hint}</span>}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function Tile({ k, v, accent, wide }: { k: string; v: React.ReactNode; accent?: string; wide?: boolean }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 ${wide ? "col-span-2" : ""}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{k}</p>
      <p className="mt-1 font-semibold leading-snug" style={{ color: accent ?? "#f1f5f9" }}>
        {v}
      </p>
    </div>
  );
}

function Pill({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: `${color}26`, color, border: `1px solid ${color}55` }}>
      {children}
    </span>
  );
}

export default function HouseModal({ c, varga, house, onClose }: { c: ChartData; varga: Varga; house: number | null; onClose: () => void }) {
  const [h, setH] = useState(house);
  const [moreBhava, setMoreBhava] = useState(false);
  const [openNak, setOpenNak] = useState<number | null>(null);
  const [openPl, setOpenPl] = useState<string | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Keep the selected house aligned with the newly opened house.
    setH(house);
  }, [house]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset expanded details when the selected house changes.
    setMoreBhava(false);
    setOpenNak(null);
    setOpenPl(null);
  }, [h]);
  if (h === null) return null;
  const asc = vargaAsc(c, varga);
  const sign = (asc + h - 1) % 12;
  const s = SIGNS[sign];
  const b = BHAVAS[h - 1];
  const el = ELEMENT_COLORS[ELEMENT_IDX[s.element]];
  const inHouse = c.planets.filter((p) => vargaSign(p, varga) === sign);
  const lord = c.planets.find((p) => p.id === s.lord)!;
  const lordHouse = ((vargaSign(lord, varga) - asc + 12) % 12) + 1;
  const span = 360 / 27;
  const naks = NAKSHATRAS.map((n, i) => ({ n, i })).filter(({ i }) => i * span < sign * 30 + 30 && (i + 1) * span > sign * 30);
  const aspecting = varga === "D1" ? c.planets.filter((p) => aspectedHouses(p).includes(h)) : [];
  const go = (d: number) => setH(((h - 1 + d + 12) % 12) + 1);

  return (
    <Modal open onClose={onClose}>
      <div className="relative">
        {/* Hero header */}
        <header className="relative overflow-hidden px-5 pb-6 pt-7 sm:px-8" style={{ background: `radial-gradient(120% 140% at 0% 0%, ${el}55 0%, #1e1b4b 45%, #0e1228 100%)` }}>
          <div className="pointer-events-none absolute -right-6 -top-10 select-none font-serif text-[180px] leading-none opacity-10 glyph" style={{ color: el }}>
            {s.glyph + "\uFE0E"}
          </div>
          <div className="relative flex items-center gap-4 pr-12">
            <div className="glyph flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl text-5xl text-white shadow-[0_10px_30px_rgba(0,0,0,0.4)]" style={{ background: `linear-gradient(135deg, ${el}, #7c3aed)` }}>
              {s.glyph + "\uFE0E"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: el }}>
                House {h} · {varga === "D1" ? "Rāśi (D1)" : varga === "D9" ? "Navāṁśa (D9)" : "Daśāṁśa (D10)"}
              </p>
              <h2 className="font-serif text-4xl font-semibold leading-tight text-white sm:text-5xl">
                {s.sa} <span className="text-2xl font-normal text-slate-300">{s.en}</span>
              </h2>
              <p className="mt-1 text-lg text-amber-200">
                Bhāva {h} — {b.name}: <span className="text-slate-200">{b.title}</span>
              </p>
            </div>
          </div>
          <div className="relative mt-4 flex flex-wrap gap-2">
            <Pill color={el}>{s.element}</Pill>
            <Pill color="#fbbf24">Lord {s.lord}</Pill>
            <Pill color="#c084fc">{s.quality}</Pill>
            {b.types.map((t) => (
              <Pill key={t} color="#38bdf8">
                {t}
              </Pill>
            ))}
            <Pill color={inHouse.length ? "#4ade80" : "#94a3b8"}>{inHouse.length ? `${inHouse.length} planet${inHouse.length > 1 ? "s" : ""}` : "Empty house"}</Pill>
          </div>
          <div className="relative mt-5 flex items-center justify-between gap-2">
            <button type="button" onClick={() => go(-1)} className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-sm text-slate-200 hover:bg-white/10">
              ‹ House {((h + 10) % 12) + 1}
            </button>
            <span className="hidden text-xs text-slate-400 sm:block">Use the arrows to browse all 12 houses</span>
            <button type="button" onClick={() => go(1)} className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-sm text-slate-200 hover:bg-white/10">
              House {(h % 12) + 1} ›
            </button>
          </div>
        </header>

        <div className="px-4 pb-8 sm:px-8">
          <Section icon="◎" title={`Rāśi — ${s.sa}`} accent={el}>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Tile k="Lord" v={s.lord} accent="#fbbf24" />
              <Tile k="Element" v={s.element} accent={el} />
              <Tile k="Quality" v={s.quality} />
              <Tile k="Gender" v={s.gender} />
              <Tile k="Guṇa" v={s.guna} />
              <Tile k="Puruṣārtha" v={s.purushartha} />
              <Tile k="Direction" v={s.direction} />
              <Tile k="Varna" v={s.varna} />
            </div>
            <div className="mt-5 rounded-2xl border border-white/10 bg-gradient-to-r from-violet-500/10 to-transparent p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-300">Personality archetypes</p>
              <p className="mt-1 text-lg font-medium text-slate-50">{s.archetype}</p>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-violet-300">Symbolism</p>
              <p className="mt-1 text-lg italic text-slate-200">
                <span className="glyph not-italic" style={{ color: el }}>
                  {s.glyph + "\uFE0E"}
                </span>{" "}
                — {s.symbol}
              </p>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/15 to-emerald-500/0 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-300">✦ Strengths</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {s.strengths.split(";").map((t) => (
                    <span key={t} className="rounded-full bg-emerald-400/15 px-2.5 py-0.5 text-[13px] text-emerald-100">
                      {t.trim()}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-rose-400/30 bg-gradient-to-br from-rose-500/15 to-rose-500/0 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-rose-300">⚠ Challenges</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {s.challenges.split(";").map((t) => (
                    <span key={t} className="rounded-full bg-rose-400/15 px-2.5 py-0.5 text-[13px] text-rose-100">
                      {t.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section icon="⌂" title={`Bhāva ${h} — ${b.name}`} accent="#38bdf8" hint="Click “Know more”">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <Tile k="Kāraka" v={b.karaka} accent="#7dd3fc" wide />
              <Tile k="Kāraka Graha" v={b.karakaGraha} accent="#fbbf24" />
              <Tile k="Element" v={b.element} />
              <Tile k="Direction" v={b.direction} />
              <Tile k="Planetary Joy" v={b.joy} />
              <Tile k="Body Parts" v={b.body} wide />
              <Tile k="House Lord" v={`${s.lord} → House ${lordHouse}`} accent="#fcd34d" />
            </div>
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.14em] text-sky-300">Significations</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {b.significations.split(",").map((t) => (
                <span key={t} className="rounded-lg border border-sky-400/20 bg-sky-400/10 px-2.5 py-1 text-[13px] text-sky-50">
                  {t.trim()}
                </span>
              ))}
            </div>
            <button type="button" onClick={() => setMoreBhava((m) => !m)} className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-4 py-1.5 font-semibold text-amber-300 hover:bg-amber-400/25">
              <span className={`transition ${moreBhava ? "rotate-90" : ""}`}>›</span> Know more
            </button>
            {moreBhava && (
              <div className="animate-pop mt-3 space-y-2 rounded-2xl bg-slate-950/50 p-4 text-sm leading-relaxed text-slate-300">
                <p>{b.more}</p>
                <p>
                  The lord {s.lord} is placed in house {lordHouse}: the affairs of this house ({b.title.toLowerCase()}) get connected to {BHAVAS[lordHouse - 1].title.toLowerCase()}.
                  {[6, 8, 12].includes(lordHouse) ? " This dusthana placement asks for patience and remedies for these matters." : [1, 4, 5, 7, 9, 10].includes(lordHouse) ? " This strong placement supports the house well." : ""}
                </p>
                {aspecting.length > 0 && <p>Aspected by: {aspecting.map((p) => p.id).join(", ")}.</p>}
              </div>
            )}
          </Section>

          <Section icon="☆" title={`Nakshatras in ${s.sa}`} accent="#f472b6" hint="Click a nakshatra">
            <ul className="space-y-2">
              {naks.map(({ n, i }) => {
                const startPada = Math.max(0, Math.round((sign * 30 - i * span) / (span / 4)));
                const endPada = Math.min(4, Math.round((sign * 30 + 30 - i * span) / (span / 4)));
                const open = openNak === i;
                const lc = PLANET_INFO[n.lord].color;
                return (
                  <li key={i} className={`overflow-hidden rounded-2xl border transition ${open ? "border-pink-400/40 bg-pink-500/5" : "border-white/10 bg-slate-950/30 hover:border-white/20"}`}>
                    <button type="button" onClick={() => setOpenNak(open ? null : i)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-violet-600 text-xs font-bold text-white">{i + 1}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-lg font-bold text-slate-50">{n.name}</span>
                        <span className="block truncate text-xs text-slate-400">{n.symbol}</span>
                      </span>
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: `${lc}22`, color: lc }}>
                        Lord: {n.lord}
                      </span>
                      <span className={`text-slate-400 transition ${open ? "rotate-90" : ""}`}>›</span>
                    </button>
                    {open && (
                      <div className="animate-pop border-t border-white/10 p-4">
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                          <Tile k="Deity" v={n.deity} accent="#fde68a" />
                          <Tile k="Gana" v={n.gana} />
                          <Tile k="Yoni" v={`${n.yoni} (${n.yoniGender})`} />
                          <Tile k="Nadi" v={n.nadi} />
                          <Tile k="Nature" v={n.nature} />
                          <Tile k="Padas here" v={`${startPada + 1}–${endPada}`} />
                          <Tile k="Syllables" v={n.syllables.join(", ")} accent="#f9a8d4" wide />
                        </div>
                        <p className="mt-3 text-sm text-slate-300">{n.traits}</p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Section>

          <Section icon="✧" title="Grahas in this House" accent="#fbbf24" hint={inHouse.length ? "Click “Know more”" : undefined}>
            {inHouse.length === 0 && (
              <p className="rounded-2xl bg-slate-950/40 p-4 text-slate-300">
                No planets occupy this house. Its results are given by the lord <b className="text-amber-300">{s.lord}</b> (placed in house {lordHouse}) and planets aspecting it{aspecting.length ? ` (${aspecting.map((p) => p.id).join(", ")})` : ""}.
              </p>
            )}
            <div className="space-y-4">
              {inHouse.map((p) => {
                const fn = functionalNature(c, p.id);
                const nat = naturalNature(c, p.id);
                const rel = relationTo(p.id, s.lord);
                const dg = dignity(p.id, sign, varga === "D1" ? p.deg : undefined, c);
                const pi = PLANET_INFO[p.id];
                const conj = inHouse.filter((q) => q.id !== p.id);
                return (
                  <div key={p.id} className="relative overflow-hidden rounded-2xl border border-white/10 p-4 sm:p-5" style={{ background: `linear-gradient(135deg, ${pi.color}1f, rgba(2,6,23,0.4) 55%)` }}>
                    <div className="absolute inset-y-0 left-0 w-1.5" style={{ background: pi.color }} />
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pl-2">
                      <span className="glyph flex h-11 w-11 items-center justify-center rounded-xl text-2xl" style={{ background: `${pi.color}2e`, color: pi.color }}>
                        {pi.glyph + "\uFE0E"}
                      </span>
                      <span className="text-2xl font-bold text-slate-50">{p.id}</span>
                      <span className="font-mono text-slate-300">{fmtDegShort(p.deg)}</span>
                      {p.retro && !["Rahu", "Ketu"].includes(p.id) && <Pill color="#fbbf24">Retro</Pill>}
                      {p.combust && <Pill color="#fb923c">Combust</Pill>}
                      <span className="ml-auto flex flex-wrap gap-2">
                        <Pill color={fn.good ? "#4ade80" : "#fb7185"}>{fn.good ? "Good" : "Bad"}</Pill>
                        <Pill color={nat === "Malefic" ? "#fb7185" : "#4ade80"}>{nat}</Pill>
                        <Pill color={rel === "Friend" || rel === "Self" ? "#38bdf8" : rel === "Enemy" ? "#fb7185" : "#cbd5e1"}>{rel === "Self" ? "Own" : rel}</Pill>
                      </span>
                    </div>
                    <p className="mt-2 pl-2 italic text-slate-300">
                      {conj.length ? `Conjunct ${conj.map((q) => (varga === "D1" ? `${q.id} (${Math.round(Math.abs(q.deg - p.deg))}°)` : q.id)).join(", ")} — ` : ""}
                      Natural {nat} · {fn.label}
                    </p>
                    <div className="mt-2 pl-2">
                      <Pill color="#fbbf24">{dg}</Pill>
                    </div>
                    <div className="mt-3 grid gap-2 pl-2 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">In House {h}</p>
                        <p className="mt-1 font-semibold text-slate-50">{IN_HOUSE[p.id][h - 1]}</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">In {s.sa}</p>
                        <p className="mt-1 font-semibold text-slate-50">{IN_SIGN[p.id][sign]}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setOpenPl(openPl === p.id ? null : p.id)} className="ml-2 mt-3 inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-4 py-1.5 font-semibold text-amber-300 hover:bg-amber-400/25">
                      <span className={`transition ${openPl === p.id ? "rotate-90" : ""}`}>›</span> 📖 Know more — Significations
                    </button>
                    {openPl === p.id && (
                      <div className="animate-pop mt-3 pl-2">
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                          <Tile k="Sanskrit" v={pi.sa} />
                          <Tile k="Nakshatra" v={`${NAKSHATRAS[p.nak].name} (${p.pada})`} />
                          <Tile k="Aspects" v={varga === "D1" ? `Houses ${aspectedHouses(p).join(", ")}` : pi.aspects.map((a) => a + "th").join(", ")} />
                          <Tile k="Karakatva" v={pi.karaka} wide />
                          <Tile k="Gem" v={pi.gem} accent="#7dd3fc" />
                        </div>
                        <p className="mt-3 text-sm text-slate-300">{pi.significations}.</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>
        </div>
      </div>
    </Modal>
  );
}

export type { PlanetId };
