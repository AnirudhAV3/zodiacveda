import type { ChartData } from "@/lib/astro/calc";
import { fmtDeg } from "@/lib/astro/calc";
import { NAKSHATRAS, PLANET_INFO, SIGNS, type PlanetId } from "@/lib/astro/data";
import { avakhada, dignity, functionalNature, houseLord, planet } from "@/lib/astro/analysis";
import { allPlanetReports } from "@/lib/astro/planetReport";
import { computeShadbala } from "@/lib/astro/shadbala";
import { detectYogas, remedyPlan, type PlanEntry, type YogaResult } from "@/lib/astro/yogas";
import type { Remedy } from "@/lib/astro/remedies";

export interface ScoredYoga extends YogaResult {
  /** 0–100 capacity of the yoga's own planets to deliver, from the shared strength engine. */
  strength: number | null;
  strengthLabel: string;
  planetNotes: { id: PlanetId; dignity: string; house: number; shadbala: string; functional: string; score: number }[];
}

export interface YogaCategorySummary {
  category: string;
  present: number;
  total: number;
  auspicious: number;
  challenging: number;
}

export interface YogaReport {
  version: string;
  kind: "all-yogas";
  calculatedAt: string;
  method: string;
  analysed: number;
  presentCount: number;
  auspiciousCount: number;
  challengingCount: number;
  mixedCount: number;
  strongest: string[];
  categories: YogaCategorySummary[];
  yogas: ScoredYoga[];
  plan: { strengthen: PlanEntry[]; pacify: PlanEntry[] };
  generalRemedies: Remedy[];
  chartSummary: {
    name: string;
    date: string;
    time: string;
    place: string;
    lagna: string;
    lagnaLord: PlanetId;
    moonSign: string;
    nakshatra: string;
    pada: number;
    planets: { id: PlanetId; sign: string; degree: string; house: number; dignity: string; retro: boolean; strength: number; shadbala: string }[];
  };
  notes: string[];
}

const label = (score: number | null) =>
  score === null ? "Not scored" : score >= 75 ? "Very strong" : score >= 60 ? "Strong" : score >= 45 ? "Moderate" : score >= 30 ? "Weak" : "Very weak";

export function buildYogaReport(c: ChartData, now = Date.now()): YogaReport {
  const yogas = detectYogas(c, now);
  const reports = allPlanetReports(c);
  const shadbala = computeShadbala(c).rows;
  const scoreOf = (id: PlanetId) => reports.find((r) => r.id === id)?.score ?? null;
  const shadbalaOf = (id: PlanetId) => {
    const row = shadbala.find((r) => r.id === id);
    return row ? `${row.rupas.toFixed(2)} / ${row.required} Rupas` : "Not applicable (shadow planet)";
  };

  const scored: ScoredYoga[] = yogas.map((y) => {
    const planetNotes = y.planets.map((id) => {
      const p = planet(c, id);
      return {
        id,
        dignity: dignity(id, p.sign, p.deg, c),
        house: p.house,
        shadbala: shadbalaOf(id),
        functional: functionalNature(c, id).label,
        score: scoreOf(id) ?? 0,
      };
    });
    const scores = y.planets.map(scoreOf).filter((s): s is number => s !== null);
    const strength = y.present && scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    return { ...y, strength, strengthLabel: label(strength), planetNotes };
  });

  const present = scored.filter((y) => y.present);
  const categories = Array.from(new Set(scored.map((y) => y.category))).map((category) => {
    const all = scored.filter((y) => y.category === category);
    const inChart = all.filter((y) => y.present);
    return {
      category,
      present: inChart.length,
      total: all.length,
      auspicious: inChart.filter((y) => y.nature === "good").length,
      challenging: inChart.filter((y) => y.nature === "bad").length,
    };
  });

  const a = avakhada(c);
  const strongest = present
    .filter((y) => y.nature !== "bad" && y.strength !== null)
    .sort((x, y) => (y.strength ?? 0) - (x.strength ?? 0))
    .slice(0, 5)
    .map((y) => `${y.name} — ${y.strength}/100 (${y.strengthLabel})`);

  return {
    version: "all-yogas-1.0",
    kind: "all-yogas",
    calculatedAt: new Date(now).toISOString(),
    method: "Classical Parashari yoga definitions evaluated on the saved birth chart · Lahiri sidereal · whole-sign houses",
    analysed: scored.length,
    presentCount: present.length,
    auspiciousCount: present.filter((y) => y.nature === "good").length,
    challengingCount: present.filter((y) => y.nature === "bad").length,
    mixedCount: present.filter((y) => y.nature === "mixed").length,
    strongest,
    categories,
    yogas: scored,
    plan: remedyPlan(c, yogas, []),
    generalRemedies: [
      { kind: "Lifestyle", text: "A yoga shows potential, not a guaranteed event. Consistent effort, education and ethical conduct are what let a strong yoga express itself." },
      { kind: "Timing", text: "Most yogas deliver during the dasha and antardasha of the planets forming them. Each yoga below lists its own upcoming periods." },
      { kind: "Puja", text: "Strengthening practices are voluntary. Start with simple mantra or charity before considering expensive rituals or gemstones." },
    ],
    chartSummary: {
      name: c.input.name,
      date: c.input.date,
      time: c.input.time,
      place: c.input.place,
      lagna: `${a.lagna.sa} (${a.lagna.en})`,
      lagnaLord: houseLord(c, 1),
      moonSign: `${a.rashi.sa} (${a.rashi.en})`,
      nakshatra: NAKSHATRAS[planet(c, "Moon").nak].name,
      pada: a.pada,
      planets: c.planets.map((p) => ({
        id: p.id,
        sign: SIGNS[p.sign].sa,
        degree: fmtDeg(p.deg),
        house: p.house,
        dignity: dignity(p.id, p.sign, p.deg, c),
        retro: p.retro && !["Rahu", "Ketu"].includes(p.id),
        strength: scoreOf(p.id) ?? 0,
        shadbala: shadbalaOf(p.id),
      })),
    },
    notes: [
      "Yogas are detected from the same chart engine as your main horoscope: Astronomy Engine positions, Lahiri sidereal ayanamsa, whole-sign houses and mean lunar nodes.",
      "Every definition is listed, including yogas that are absent, so you can see exactly what was checked rather than only favourable results.",
      "Yoga strength is the average overall strength of that yoga's own planets, taken from the shared planet-strength engine (dignity, Shadbala, house placement, combustion and aspects). It is this app's summary measure, not a classical number.",
      "Classical texts differ on several yoga definitions and cancellations. A qualified astrologer may read some combinations differently.",
      "Dasha windows show when a yoga's planets next rule a period. They indicate timing themes, not guaranteed events.",
      "This is traditional interpretive guidance. It is not medical, financial, legal or psychological advice.",
    ],
  };
}

export { PLANET_INFO };
