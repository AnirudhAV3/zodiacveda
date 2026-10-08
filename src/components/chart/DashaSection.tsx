"use client";

import { useMemo, useRef, useState } from "react";
import { subPeriods, type ChartData, type DashaPeriod } from "@/lib/astro/calc";
import { PLANET_INFO, type PlanetId } from "@/lib/astro/data";
import { dashaPrediction, type DashaPrediction } from "@/lib/astro/predictions";
import { RemedyList } from "./RemedyList";
import ClickHint from "./ClickHint";
import Modal from "./Modal";

const fmt = (ms: number) => new Date(ms).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
const dur = (ms: number) => {
  const days = ms / 86400000;
  const y = Math.floor(days / 365.25);
  const m = Math.floor((days - y * 365.25) / 30.44);
  const d = Math.floor(days - y * 365.25 - m * 30.44);
  return y ? `${y}y ${m}m` : m ? `${m}m ${d}d` : `${d}d`;
};

type Level = 0 | 1 | 2;
const LEVEL_NAME = ["Mahadasha", "Antardasha", "Pratyantar Dasha"];

function Stars({ n }: { n: number }) {
  const r = Math.round(n);
  return (
    <span className="whitespace-nowrap text-xs text-amber-400" title={`${n}/5`}>
      {"★".repeat(r)}
      <span className="text-slate-600">{"★".repeat(5 - r)}</span>
    </span>
  );
}

export function DashaDetail({ pred, period }: { pred: DashaPrediction; period: DashaPeriod }) {
  const heading = pred.status === "past" ? "What happened" : pred.status === "current" ? "What is happening now" : "What will happen";
  const color = PLANET_INFO[pred.lord].color;
  const toneCls = { good: "border-emerald-500/30 bg-emerald-500/5", bad: "border-rose-500/30 bg-rose-500/5", mixed: "border-amber-500/30 bg-amber-500/5" };
  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-slate-600/40 p-5" style={{ background: `linear-gradient(135deg, ${color}26, rgba(15,18,42,0.85) 60%)` }}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="glyph flex h-12 w-12 items-center justify-center rounded-xl text-2xl" style={{ background: `${color}33`, color }}>
            {PLANET_INFO[pred.lord].glyph + "\uFE0E"}
          </span>
          <div className="min-w-0 flex-1">
            <p className={`text-xs font-bold uppercase tracking-[0.15em] ${pred.status === "current" ? "text-amber-300" : pred.status === "past" ? "text-slate-400" : "text-sky-300"}`}>{pred.status === "past" ? "Past period" : pred.status === "current" ? "Running now" : "Upcoming period"}</p>
            <h3 className="font-serif text-2xl font-semibold text-slate-100 sm:text-3xl">{pred.title}</h3>
            <p className="text-sm text-slate-400">
              {fmt(period.start)} → {fmt(period.end)} · {dur(period.end - period.start)}
            </p>
          </div>
          <div className="text-right">
            <Stars n={pred.rating} />
            <p className="text-xs text-slate-400">Strength {pred.rating}/5</p>
          </div>
        </div>
        <p className="mt-3 text-slate-200">{pred.summary}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {pred.houses.map((h) => (
            <span key={h} className="rounded-full bg-violet-500/15 px-3 py-0.5 text-xs text-violet-200">
              {h}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-sky-500/25 bg-sky-500/5 p-5">
        <h4 className="font-serif text-xl text-sky-300">📜 {heading}</h4>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-slate-200">
          {pred.events.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {pred.lifeAreas.map((a) => (
            <div key={a.area} className={`rounded-xl border p-3 ${toneCls[a.tone]}`}>
              <p className="text-sm font-semibold text-slate-100">
                {a.icon} {a.area}
              </p>
              <p className="mt-1 text-[13px] text-slate-300">{a.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5">
          <h4 className="font-semibold text-emerald-400">✅ Benefits</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-emerald-50/90">
            {pred.favourable.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-5">
          <h4 className="font-semibold text-rose-400">⚠️ Challenges (bad effects)</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-rose-50/90">
            {pred.challenges.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-teal-500/25 bg-teal-500/5 p-5">
          <h4 className="mb-3 font-semibold text-teal-300">🙏 Remedies for this period</h4>
          <RemedyList remedies={pred.remedies} compact />
        </div>
        <div className="rounded-2xl border border-orange-500/25 bg-orange-500/5 p-5">
          <h4 className="font-semibold text-orange-400">🚫 What to avoid</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-orange-50/90">
            {pred.avoid.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function useRating(c: ChartData, chain: PlanetId[], p: DashaPeriod, now: number) {
  return useMemo(() => dashaPrediction(c, chain, p, now).rating, [c, chain, p, now]);
}

function Planet({ id, bold = true, dim = false }: { id: PlanetId; bold?: boolean; dim?: boolean }) {
  const col = PLANET_INFO[id].color;
  return (
    <span className={`inline-flex items-center gap-1.5 ${dim ? "opacity-45" : ""}`}>
      <span className="glyph flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-sm" style={{ background: `${col}22`, color: col }}>
        {PLANET_INFO[id].glyph + "\uFE0E"}
      </span>
      <span className={bold ? "font-bold" : "font-medium"} style={{ color: col }}>
        {id}
      </span>
    </span>
  );
}

const GRID = "grid grid-cols-[1.1fr_1.1fr_1.1fr_1fr_1fr_0.7fr_0.7fr] items-center gap-2";

function TimelineRow({ c, md, ad, pd, firstOfAd, now, onOpen, rowRef }: { c: ChartData; md: DashaPeriod; ad: DashaPeriod; pd: DashaPeriod; firstOfAd: boolean; now: number; onOpen: () => void; rowRef?: (el: HTMLButtonElement | null) => void }) {
  const chain = useMemo(() => [md.lord, ad.lord, pd.lord] as PlanetId[], [md, ad, pd]);
  const rating = useRating(c, chain, pd, now);
  const cur = pd.start <= now && pd.end > now;
  const adCur = ad.start <= now && ad.end > now;
  const past = pd.end <= now;
  return (
    <button
      ref={rowRef}
      type="button"
      onClick={onOpen}
      className={`${GRID} w-full px-4 py-2.5 text-left text-sm transition hover:bg-amber-400/10 ${firstOfAd ? "border-t border-slate-700/60" : "border-t border-slate-800/40"} ${cur ? "bg-amber-400/15 ring-1 ring-inset ring-amber-400/50" : adCur ? "bg-violet-500/[0.06]" : ""} ${past && !cur ? "opacity-60" : ""}`}
    >
      <Planet id={md.lord} dim={!firstOfAd} bold={false} />
      <Planet id={ad.lord} dim={!firstOfAd} bold={firstOfAd} />
      <span className="flex items-center gap-2">
        <Planet id={pd.lord} />
        {cur && <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-slate-950">NOW</span>}
      </span>
      <span className="text-slate-300">{fmt(pd.start)}</span>
      <span className="text-slate-300">{fmt(pd.end)}</span>
      <span className="text-xs text-slate-500">{dur(pd.end - pd.start)}</span>
      <span className="flex items-center justify-end gap-2">
        <Stars n={rating} />
        <span className="text-slate-500">›</span>
      </span>
    </button>
  );
}

function ADRow({ c, md, ad, now, expanded, onToggle, onOpen }: { c: ChartData; md: DashaPeriod; ad: DashaPeriod; now: number; expanded: boolean; onToggle: () => void; onOpen: () => void }) {
  const chain = useMemo(() => [md.lord, ad.lord] as PlanetId[], [md, ad]);
  const rating = useRating(c, chain, ad, now);
  const cur = ad.start <= now && ad.end > now;
  const past = ad.end <= now;
  return (
    <div className={`${GRID} border-t border-slate-700/60 px-4 py-2.5 text-sm transition hover:bg-amber-400/10 ${cur ? "bg-violet-500/10" : ""} ${past && !cur ? "opacity-60" : ""}`}>
      <button type="button" onClick={onOpen} className="text-left">
        <Planet id={md.lord} bold={false} dim />
      </button>
      <button type="button" onClick={onOpen} className="flex items-center gap-2 text-left">
        <Planet id={ad.lord} />
        {cur && <span className="rounded bg-violet-400 px-1.5 py-0.5 text-[10px] font-bold text-slate-950">NOW</span>}
      </button>
      <button type="button" onClick={onToggle} aria-expanded={expanded} className={`flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition ${expanded ? "border-amber-400/60 bg-amber-400/15 text-amber-200" : "border-slate-600 text-slate-300 hover:border-amber-400/50 hover:text-amber-200"}`}>
        <span className={`transition-transform ${expanded ? "rotate-180" : ""}`}>▼</span> 9 Pratyantars
      </button>
      <button type="button" onClick={onOpen} className="text-left text-slate-300">
        {fmt(ad.start)}
      </button>
      <button type="button" onClick={onOpen} className="text-left text-slate-300">
        {fmt(ad.end)}
      </button>
      <span className="text-xs text-slate-500">{dur(ad.end - ad.start)}</span>
      <button type="button" onClick={onOpen} className="flex items-center justify-end gap-2">
        <Stars n={rating} />
        <span className="text-slate-500">›</span>
      </button>
    </div>
  );
}

function MahadashaGroup({ c, md, mdStartShown, open, onToggle, now, onOpen, groupRef }: { c: ChartData; md: DashaPeriod; mdStartShown: number; open: boolean; onToggle: () => void; now: number; onOpen: (chain: PlanetId[], periods: DashaPeriod[]) => void; groupRef: (el: HTMLDivElement | null) => void }) {
  const ads = useMemo(() => subPeriods(md), [md]);
  const cur = md.start <= now && md.end > now;
  const past = md.end <= now;
  const rating = useRating(c, useMemo(() => [md.lord] as PlanetId[], [md]), md, now);
  const col = PLANET_INFO[md.lord].color;
  const [openAd, setOpenAd] = useState<Set<number>>(() => {
    const i = ads.findIndex((x) => x.start <= now && x.end > now);
    return new Set(i >= 0 ? [i] : []);
  });
  const pct = cur ? Math.round(((now - md.start) / (md.end - md.start)) * 100) : past ? 100 : 0;
  return (
    <div ref={groupRef} className={`scroll-mt-28 overflow-hidden rounded-2xl border ${cur ? "border-amber-400/50 shadow-[0_0_30px_rgba(251,191,36,0.12)]" : "border-slate-700/50"}`}>
      <div className="flex items-stretch" style={{ background: `linear-gradient(90deg, ${col}26, rgba(15,18,42,0.6) 60%)` }}>
        <button type="button" onClick={onToggle} aria-expanded={open} aria-label={open ? "Collapse timeline" : "Expand timeline"} className="flex w-12 shrink-0 items-center justify-center border-r border-white/10 text-lg text-slate-200 transition hover:bg-white/10">
          <span className={`transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
        </button>
        <button type="button" onClick={() => onOpen([md.lord], [md])} className={`flex flex-1 flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 text-left transition hover:bg-white/5 ${past ? "opacity-70" : ""}`}>
          <span className="glyph flex h-9 w-9 items-center justify-center rounded-xl text-lg" style={{ background: `${col}33`, color: col }}>
            {PLANET_INFO[md.lord].glyph + "\uFE0E"}
          </span>
          <span className="min-w-0">
            <span className="block font-bold" style={{ color: col }}>
              {md.lord} Mahadasha {cur && <span className="ml-1 rounded bg-amber-400 px-1.5 py-0.5 align-middle text-[10px] font-bold text-slate-950">RUNNING</span>}
            </span>
            <span className="block text-xs text-slate-400">
              {fmt(mdStartShown)} → {fmt(md.end)} · {PLANET_INFO[md.lord].years} yrs · {past ? "completed" : cur ? `${pct}% elapsed` : "upcoming"}
            </span>
          </span>
          <span className="ml-auto flex items-center gap-3">
            <Stars n={rating} />
            <span className="hidden text-xs text-amber-300 sm:inline">Details ›</span>
          </span>
        </button>
      </div>
      {cur && (
        <div className="h-1 bg-slate-800">
          <div className="h-full bg-gradient-to-r from-amber-400 to-pink-500" style={{ width: `${pct}%` }} />
        </div>
      )}
      {open && (
        <div className="scroll-thin overflow-x-auto">
          <div className="min-w-[760px]">
            <div className={`${GRID} bg-slate-900/80 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400`}>
              <span>Mahadasha</span>
              <span>Antardasha</span>
              <span>Pratyantar</span>
              <span>Start</span>
              <span>End</span>
              <span>Length</span>
              <span className="text-right">Rating</span>
            </div>
            <div className="bg-slate-950/30">
              {ads.map((ad, ai) => (
                <div key={ai}>
                  <ADRow
                    c={c}
                    md={md}
                    ad={ad}
                    now={now}
                    expanded={openAd.has(ai)}
                    onToggle={() =>
                      setOpenAd((s) => {
                        const n = new Set(s);
                        if (n.has(ai)) n.delete(ai);
                        else n.add(ai);
                        return n;
                      })
                    }
                    onOpen={() => onOpen([md.lord, ad.lord], [md, ad])}
                  />
                  {openAd.has(ai) && (
                    <div className="animate-pop border-l-2 border-amber-400/40 bg-slate-950/40">
                      {subPeriods(ad).map((pd, pi) => (
                        <TimelineRow key={pi} c={c} md={md} ad={ad} pd={pd} firstOfAd={false} now={now} onOpen={() => onOpen([md.lord, ad.lord, pd.lord], [md, ad, pd])} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LifeBar({ mds, birth, now, onPick, openSet }: { mds: DashaPeriod[]; birth: number; now: number; onPick: (i: number) => void; openSet: Set<number> }) {
  const end = Math.min(mds[mds.length - 1].end, birth + 100 * 365.25 * 86400000);
  const total = end - birth;
  const nowPct = Math.max(0, Math.min(100, ((now - birth) / total) * 100));
  const age = Math.floor((now - birth) / (365.25 * 86400000));
  return (
    <div className="card mb-5 p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-serif text-xl text-slate-100">Your life timeline</p>
        <p className="text-xs text-slate-400">Tap a period to open it · first 100 years</p>
      </div>
      <div className="relative pt-6">
        <div className="absolute top-0 -translate-x-1/2 text-[11px] font-bold text-amber-300" style={{ left: `${nowPct}%` }}>
          You · {age}y
        </div>
        <div className="absolute bottom-0 top-5 z-10 w-0.5 -translate-x-1/2 bg-amber-300 shadow-[0_0_10px_#fbbf24]" style={{ left: `${nowPct}%` }} />
        <div className="flex h-12 overflow-hidden rounded-xl border border-white/10">
          {mds.map((md, i) => {
            const s = Math.max(md.start, birth);
            const e = Math.min(md.end, end);
            if (e <= s) return null;
            const w = ((e - s) / total) * 100;
            const col = PLANET_INFO[md.lord].color;
            const cur = md.start <= now && md.end > now;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onPick(i)}
                title={`${md.lord} Mahadasha · ${fmt(s)} – ${fmt(md.end)}`}
                className={`group relative flex items-center justify-center border-r border-black/40 text-[11px] font-bold transition hover:brightness-125 ${openSet.has(i) ? "ring-2 ring-inset ring-white/70" : ""}`}
                style={{ width: `${w}%`, background: `linear-gradient(180deg, ${col}${cur ? "cc" : "70"}, ${col}${cur ? "88" : "38"})`, color: "#0b0b1a" }}
              >
                <span className="truncate px-0.5">{w > 6 ? md.lord : PLANET_INFO[md.lord].short}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-slate-500">
          <span>Birth</span>
          <span>25y</span>
          <span>50y</span>
          <span>75y</span>
          <span>100y</span>
        </div>
      </div>
    </div>
  );
}

export default function DashaSection({ c, now }: { c: ChartData; now: number }) {
  const birth = new Date(c.utc).getTime();
  const mds = useMemo(() => c.dashas.filter((d) => d.end > birth), [c, birth]);
  const curMd = mds.findIndex((d) => d.start <= now && d.end > now);
  const [open, setOpen] = useState<Set<number>>(() => new Set(curMd >= 0 ? [curMd] : [0]));
  const [sel, setSel] = useState<{ chain: PlanetId[]; periods: DashaPeriod[] } | null>(null);
  const [focus, setFocus] = useState<Level>(2);
  const groupEls = useRef<(HTMLDivElement | null)[]>([]);
  const pickFromBar = (i: number) => {
    setOpen((s) => new Set(s).add(i));
    setTimeout(() => groupEls.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const openDetail = (chain: PlanetId[], periods: DashaPeriod[]) => {
    setSel({ chain, periods });
    setFocus((chain.length - 1) as Level);
  };
  const pred = useMemo(() => (sel ? dashaPrediction(c, sel.chain.slice(0, focus + 1), sel.periods[focus], now) : null), [sel, focus, c, now]);
  const allOpen = open.size === mds.length;

  const cur = c.dashas.find((d) => d.start <= now && d.end > now);
  const curAd = cur && subPeriods(cur).find((d) => d.start <= now && d.end > now);
  const curPd = curAd && subPeriods(curAd).find((d) => d.start <= now && d.end > now);

  return (
    <div>
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[cur, curAd, curPd].map((p, i) =>
          p && cur ? (
            <button
              key={i}
              type="button"
              onClick={() => openDetail([cur.lord, curAd!.lord, curPd!.lord].slice(0, i + 1) as PlanetId[], [cur, curAd!, curPd!].slice(0, i + 1))}
              className="card p-4 text-left transition hover:-translate-y-0.5 hover:border-amber-400/50"
            >
              <p className="label-caps">Current {LEVEL_NAME[i]}</p>
              <p className="mt-1 text-2xl font-bold" style={{ color: PLANET_INFO[p.lord].color }}>
                {p.lord}
              </p>
              <p className="text-xs text-slate-400">until {fmt(p.end)} · tap for details</p>
            </button>
          ) : null,
        )}
      </div>

      <LifeBar mds={mds} birth={birth} now={now} onPick={pickFromBar} openSet={open} />

      <ClickHint title="Click on any row to see its full details">
        Rows show <b>Mahadasha → Antardasha → Pratyantar</b> side by side. Click a row for benefits, bad effects, what happened / is happening / will happen and remedies. Only your running Mahadasha and Antardasha are open — use <b>▼</b> to expand others. Balance at birth: <span className="text-amber-300">{c.dashaBalance.lord}</span> {dur(c.dashaBalance.years * 365.25 * 86400000)}.
      </ClickHint>

      <div className="mb-3 flex justify-end">
        <button type="button" onClick={() => setOpen(allOpen ? new Set(curMd >= 0 ? [curMd] : []) : new Set(mds.map((_, i) => i)))} className="rounded-full border border-slate-600 px-4 py-1.5 text-sm text-slate-300 hover:border-amber-400 hover:text-amber-200">
          {allOpen ? "▲ Collapse all" : "▼ Expand all timelines"}
        </button>
      </div>

      <div className="space-y-2">
        {mds.map((md, i) => (
          <MahadashaGroup
            key={i}
            c={c}
            md={md}
            mdStartShown={Math.max(md.start, birth)}
            open={open.has(i)}
            now={now}
            groupRef={(el) => {
              groupEls.current[i] = el;
            }}
            onToggle={() =>
              setOpen((s) => {
                const n = new Set(s);
                if (n.has(i)) n.delete(i);
                else n.add(i);
                return n;
              })
            }
            onOpen={openDetail}
          />
        ))}
      </div>

      <Modal open={!!sel && !!pred} onClose={() => setSel(null)} wide>
        {sel && pred && (
          <div className="p-4 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2 pr-12">
              <span className="text-sm text-slate-400">Details for:</span>
              {sel.chain.map((lord, l) => (
                <button key={l} type="button" onClick={() => setFocus(l as Level)} className={`rounded-full border px-4 py-1.5 text-sm transition ${focus === l ? "border-amber-400 bg-amber-400 font-semibold text-slate-950" : "border-slate-600 text-slate-300 hover:border-slate-400"}`}>
                  {LEVEL_NAME[l]}: {lord}
                </button>
              ))}
            </div>
            <DashaDetail pred={pred} period={sel.periods[focus]} />
          </div>
        )}
      </Modal>
    </div>
  );
}
