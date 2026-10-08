"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ChartData } from "@/lib/astro/calc";
import { SIGNS, type PlanetId } from "@/lib/astro/data";
import { detectDoshas, detectYogas, remedyPlan } from "@/lib/astro/yogas";
import { overallPredictions } from "@/lib/astro/predictions";
import { buildEasyChartSummary, buildEasyDashaSummary } from "@/lib/astro/easySummary";
import ChartSVG, { ChartLegend } from "./ChartSVG";
import ClickHint from "./ClickHint";
import HouseModal, { vargaAsc, vargaSign, type Varga } from "./HouseModal";
import DashaSection from "./DashaSection";
import PlanetDetails from "./PlanetDetails";
import Predictions from "./Predictions";
import Overview from "./Overview";
import { Doshas, YogaExplorer } from "./YogaExplorer";
import DetailsSection from "./DetailsSection";
import BrandLogo from "@/components/BrandLogo";
import SiteFooter from "@/components/SiteFooter";
import { ChartEasySummary, DashaEasySummary } from "./EasySummary";

const NAV = [
  ["details", "Details"],
  ["charts", "Charts"],
  ["chart-summary", "Chart summary"],
  ["dashas", "Dashas"],
  ["dasha-summary", "Dasha summary"],
  ["predictions", "Predictions"],
  ["planets", "Planet Details"],
  ["overview", "Overview"],
  ["yogas", "Yogas"],
  ["doshas", "Doshas"],
  ["report", "PDF Report"],
];

function SectionTitle({ id, kicker, title, sub }: { id: string; kicker: string; title: string; sub?: string }) {
  return (
    <div id={id} className="mb-6 scroll-mt-24">
      <p className="label-caps !text-amber-300">{kicker}</p>
      <h2 className="mt-1 font-serif text-4xl font-semibold text-slate-100">{title}</h2>
      {sub && <p className="mt-2 max-w-3xl text-slate-400">{sub}</p>}
    </div>
  );
}

const VARGA_INFO: Record<Varga, { title: string; sub: string }> = {
  D1: { title: "D1 · Rāśi", sub: "Birth chart — body, life & overall destiny" },
  D9: { title: "D9 · Navāṁśa", sub: "Marriage, dharma & inner strength" },
  D10: { title: "D10 · Daśāṁśa", sub: "Career, profession & achievements" },
};

export default function ChartReport({ c, transits, now, slug }: { c: ChartData; transits: Record<PlanetId, number>; now: number; slug: string }) {
  const [style, setStyle] = useState<"north" | "south">(c.input.style);
  const [modal, setModal] = useState<{ varga: Varga; house: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const yogas = useMemo(() => detectYogas(c, now), [c, now]);
  const doshas = useMemo(() => detectDoshas(c, transits, now), [c, transits, now]);
  const plan = useMemo(() => remedyPlan(c, yogas, doshas), [c, yogas, doshas]);
  const preds = useMemo(() => overallPredictions(c, now), [c, now]);
  const chartSummary = useMemo(() => buildEasyChartSummary(c, now, transits), [c, now, transits]);
  const dashaSummary = useMemo(() => buildEasyDashaSummary(c, now), [c, now]);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative">
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#0a0a1d]/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <BrandLogo compact />
          <nav className="scroll-thin flex flex-1 gap-1 overflow-x-auto">
            {NAV.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="shrink-0 rounded-full px-3 py-1.5 text-sm text-slate-400 transition hover:bg-white/5 hover:text-amber-200">
                {label}
              </a>
            ))}
          </nav>
          <Link href="/build" className="hidden shrink-0 rounded-full border border-amber-400/40 px-4 py-1.5 text-sm text-amber-200 hover:bg-amber-400/10 md:block">
            New Chart
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-20 px-4 py-10">
        <section className="animate-fade-up">
          <div className="card relative overflow-hidden p-6 sm:p-8">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
            <p className="label-caps !text-amber-300">Janma Kundli</p>
            <h1 className="mt-1 font-serif text-4xl font-semibold sm:text-5xl">{c.input.name}</h1>
            <p className="mt-2 text-slate-300">
              {new Date(c.input.date + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })} · {c.input.time} · {c.input.place}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <span className="rounded-full bg-amber-400/15 px-4 py-1.5 text-sm text-amber-200">Lagna: {SIGNS[c.asc.sign].sa}</span>
              <span className="rounded-full bg-violet-400/15 px-4 py-1.5 text-sm text-violet-200">Rashi: {SIGNS[c.planets[1].sign].sa}</span>
              <span className="rounded-full bg-sky-400/15 px-4 py-1.5 text-sm text-sky-200">Sun: {SIGNS[c.planets[0].sign].sa}</span>
              <button onClick={share} className="rounded-full border border-slate-600 px-4 py-1.5 text-sm text-slate-300 hover:border-slate-400">
                {copied ? "Link copied ✓" : "Share link"}
              </button>
              <a href={`/api/charts/${encodeURIComponent(slug)}/pdf`} className="inline-flex items-center justify-center rounded-full bg-amber-400 px-4 py-1.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-300">
                Download free PDF
              </a>
            </div>
          </div>
        </section>

        <section>
          <SectionTitle id="details" kicker="Who you are" title="Your Birth Profile" sub="Star, Rashi, Gana, Varna, Yoni, Nadi and all Avakhada details along with your personal lucky factors." />
          <DetailsSection c={c} />
        </section>

        <section>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionTitle id="charts" kicker="Accurate sidereal positions" title="Birth Charts — D1, D9 & D10" sub="Tap any house to explore its Rāśi, Bhāva meaning, Nakshatras and the planets placed there." />
            <div className="mb-6 flex rounded-xl border border-slate-600/40 p-1">
              {(["north", "south"] as const).map((s) => (
                <button key={s} onClick={() => setStyle(s)} className={`rounded-lg px-4 py-2 text-sm ${style === s ? "bg-amber-400 text-slate-950" : "text-slate-300"}`}>
                  {s === "north" ? "North Indian" : "South Indian"}
                </button>
              ))}
            </div>
          </div>
          <ClickHint title="Click on each house to see its details">
            Tap any house in the D1, D9 or D10 chart to open its Rāśi (sign), Bhāva (house meaning), Nakshatras and the Grahas placed there. Inside the popup use ‹ › to move between houses.
          </ClickHint>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {(["D1", "D9", "D10"] as Varga[]).map((v) => (
              <div key={v} className="card p-4 transition hover:border-amber-400/40 hover:shadow-[0_0_40px_rgba(167,139,250,0.15)]">
                <div className="mb-3 flex items-baseline justify-between">
                  <h3 className="font-serif text-2xl font-semibold text-amber-200">{VARGA_INFO[v].title}</h3>
                  <span className="text-xs text-slate-500">Asc {SIGNS[vargaAsc(c, v)].sa}</span>
                </div>
                <ChartSVG style={style} ascSign={vargaAsc(c, v)} placements={c.planets.map((p) => ({ id: p.id, sign: vargaSign(p, v), deg: p.deg, retro: p.retro }))} onHouseClick={(h) => setModal({ varga: v, house: h })} showDegrees={v === "D1"} />
                <p className="mt-2 text-center text-xs text-slate-400">{VARGA_INFO[v].sub}</p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <ChartLegend />
          </div>
          <ChartEasySummary data={chartSummary} />
        </section>

        <section>
          <SectionTitle id="dashas" kicker="Timing of life events" title="Vimshottari Dasha" sub="Mahadasha, Antardasha and Pratyantar Dasha. Click any row to see what happened, what is happening and what will happen, with guidance on what to do and avoid." />
          <DashaSection c={c} now={now} />
          {dashaSummary && <DashaEasySummary data={dashaSummary} />}
        </section>

        <section>
          <SectionTitle id="predictions" kicker="Past · Present · Future" title="Life Predictions" sub="Synthesised from D1 (Rāśi), D9 (Navāṁśa) and D10 (Daśāṁśa) together with your dasha timeline." />
          <ClickHint title="Click on each topic to read its prediction">Choose Personality, Past–Present–Future, Career, Marriage, Children, Wealth, Health, Education or Spirituality from the list.</ClickHint>
          <Predictions sections={preds} />
        </section>

        <section>
          <SectionTitle id="planets" kicker="Graha details" title="Planetary Details" sub="Choose a view: positions & karakas, strength & conditions, Shadbala breakdown, velocity & brightness, Rahu & Ketu behaviour, and presiding deities." />
          <PlanetDetails c={c} />
        </section>

        <section>
          <SectionTitle id="overview" kicker="Placement summary" title="Planetary Overview" sub="Each planet explained in plain language — its strengths and weaknesses, the houses and planets it aspects and what that brings, aspects it receives, conjunctions and personalised remedies." />
          <ClickHint title="Click on each planet to see its full details">Each planet opens to show its strengths, weaknesses, the houses it aspects and what that brings, aspects it receives, conjunctions, remedies and what to avoid.</ClickHint>
          <Overview c={c} />
        </section>

        <section>
          <SectionTitle id="yogas" kicker={`${yogas.length} classical combinations`} title="Yoga Explorer" sub="Raja, Dhana, Pancha Mahapurusha, Chandra, Surya, Nabhasa and Arishta yogas checked against your chart — with remedies to activate good yogas, reduce challenging ones, and the dasha periods when each gives results." />
          <YogaExplorer yogas={yogas} plan={plan} />
        </section>

        <section>
          <SectionTitle id="doshas" kicker="Afflictions & remedies" title="Doshas" sub="Each dosha with its cancellation check, planets involved and complete remedies — mantra, puja, fasting, charity, gemstone guidance, lifestyle and timing." />
          <Doshas doshas={doshas} />
        </section>

        <section>
          <SectionTitle id="report" kicker="Take it with you" title="Detailed PDF Report" />
          <div className="card flex flex-col items-center gap-6 p-8 text-center md:flex-row md:text-left">
            <div className="text-6xl">📜</div>
            <div className="flex-1">
              <p className="text-lg text-slate-200">A traditional, print-friendly multi-page Kundli: basic details, Avakahada & Ghatak Chakra, planetary degrees with KP lords, Lagna / Moon / Navamsa / Chalit / Cusp / KP charts, Bhava Chalit & Tara Chakra, Shodashvarga & Vimsopaka, Shadbala & Bhavabala, full Vimshottari dasha with sub-sub periods, favourable points & gemstones, Manglik & Kaal Sarp analysis, life predictions and 5-year yearly predictions.</p>
            </div>
            <div className="shrink-0">
              <a href={`/api/charts/${encodeURIComponent(slug)}/pdf`} className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 px-8 py-4 text-lg font-semibold text-slate-950 shadow-[0_10px_40px_rgba(249,115,22,0.35)] transition hover:brightness-110">
                Download free PDF
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter note="Calculations: sidereal zodiac, Lahiri (Chitrapaksha) ayanamsa, whole-sign houses, mean nodes. Predictions are interpretive guidance based on classical Jyotisha principles." />

      {modal && <HouseModal c={c} varga={modal.varga} house={modal.house} onClose={() => setModal(null)} />}
    </div>
  );
}
