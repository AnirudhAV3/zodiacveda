import { subPeriods, YEAR_MS, type ChartData, type DashaPeriod } from "@/lib/astro/calc";
import { NAKSHATRAS, PLANET_INFO, type PlanetId } from "@/lib/astro/data";
import { planet } from "@/lib/astro/analysis";
import { dashaPrediction, type DashaPrediction } from "@/lib/astro/predictions";

export interface DashaLine {
  lord: PlanetId;
  start: number;
  end: number;
  years: number;
  status: "past" | "current" | "future";
  ageStart: number;
  ageEnd: number;
}

export interface DashaSnapshot {
  chain: PlanetId[];
  periods: DashaPeriod[];
  predictions: DashaPrediction[];
}

export interface DashaReport {
  version: string;
  kind: "vimshottari-dasha";
  calculatedAt: string;
  method: string;
  balanceAtBirth: { lord: PlanetId; years: number; text: string };
  current: DashaSnapshot | null;
  mahadashas: DashaLine[];
  nextTransitions: { level: "Mahadasha" | "Antardasha" | "Pratyantar"; lord: PlanetId; date: number }[];
  nextFiveYears: { start: number; end: number; chain: PlanetId[]; rating: number; summary: string; benefits: string[]; challenges: string[] }[];
  chartSummary: { name: string; date: string; time: string; place: string; moonNakshatra: string; moonPada: number; moonLord: PlanetId; moonLongitude: number };
  notes: string[];
}

const status = (p: DashaPeriod, now: number): DashaLine["status"] => p.end < now ? "past" : p.start > now ? "future" : "current";
const ymd = (years: number) => {
  const days = years * 365.25;
  const y = Math.floor(days / 365.25);
  const m = Math.floor((days - y * 365.25) / 30.4375);
  const d = Math.floor(days - y * 365.25 - m * 30.4375);
  return `${y} years ${m} months ${d} days`;
};

export function buildDashaReport(c: ChartData, now = Date.now()): DashaReport {
  const birth = Date.parse(c.utc);
  const md = c.dashas.find((p) => p.start <= now && p.end > now);
  const ad = md && subPeriods(md).find((p) => p.start <= now && p.end > now);
  const pd = ad && subPeriods(ad).find((p) => p.start <= now && p.end > now);
  let current: DashaSnapshot | null = null;
  if (md) {
    const periods = [md, ...(ad ? [ad] : []), ...(pd ? [pd] : [])];
    const chain = periods.map((p) => p.lord);
    current = {
      chain,
      periods,
      predictions: periods.map((p, i) => dashaPrediction(c, chain.slice(0, i + 1), p, now)),
    };
  }

  const mahadashas = c.dashas
    .filter((p) => p.end > birth && p.start < birth + 121 * YEAR_MS)
    .map((p) => ({
      lord: p.lord,
      start: Math.max(p.start, birth),
      end: p.end,
      years: PLANET_INFO[p.lord].years,
      status: status(p, now),
      ageStart: Math.max(0, (p.start - birth) / YEAR_MS),
      ageEnd: (p.end - birth) / YEAR_MS,
    }));

  const transitions: DashaReport["nextTransitions"] = [];
  if (md && ad && pd) {
    const pds = subPeriods(ad);
    const pdi = pds.findIndex((p) => p.start <= now && p.end > now);
    if (pdi >= 0 && pds[pdi + 1]) transitions.push({ level: "Pratyantar", lord: pds[pdi + 1].lord, date: pds[pdi].end });
    const ads = subPeriods(md);
    const adi = ads.findIndex((p) => p.start <= now && p.end > now);
    if (adi >= 0 && ads[adi + 1]) transitions.push({ level: "Antardasha", lord: ads[adi + 1].lord, date: ads[adi].end });
    const mdi = c.dashas.indexOf(md);
    if (c.dashas[mdi + 1]) transitions.push({ level: "Mahadasha", lord: c.dashas[mdi + 1].lord, date: md.end });
  }

  const end5 = now + 5 * YEAR_MS;
  const nextFive: DashaReport["nextFiveYears"] = [];
  for (const m of c.dashas) {
    if (m.end <= now || m.start >= end5) continue;
    for (const a of subPeriods(m)) {
      if (a.end <= now || a.start >= end5) continue;
      for (const p of subPeriods(a)) {
        if (p.end <= now || p.start >= end5) continue;
        const clipped = { ...p, start: Math.max(p.start, now), end: Math.min(p.end, end5) };
        const pred = dashaPrediction(c, [m.lord, a.lord, p.lord], clipped, now);
        nextFive.push({ start: clipped.start, end: clipped.end, chain: [m.lord, a.lord, p.lord], rating: pred.rating, summary: pred.summary, benefits: pred.favourable, challenges: pred.challenges });
      }
    }
  }

  const moon = planet(c, "Moon");
  return {
    version: "vimshottari-dasha-1.0",
    kind: "vimshottari-dasha",
    calculatedAt: new Date(now).toISOString(),
    method: "Classical 120-year Vimshottari cycle from the Moon's sidereal nakshatra · Lahiri ayanamsa",
    balanceAtBirth: { lord: c.dashaBalance.lord, years: c.dashaBalance.years, text: `${c.dashaBalance.lord} — ${ymd(c.dashaBalance.years)}` },
    current,
    mahadashas,
    nextTransitions: transitions.sort((x, y) => x.date - y.date),
    nextFiveYears: nextFive.sort((x, y) => x.start - y.start),
    chartSummary: {
      name: c.input.name,
      date: c.input.date,
      time: c.input.time,
      place: c.input.place,
      moonNakshatra: NAKSHATRAS[moon.nak].name,
      moonPada: moon.pada,
      moonLord: NAKSHATRAS[moon.nak].lord,
      moonLongitude: moon.lon,
    },
    notes: [
      "The sequence starts from the lord of your Moon's birth nakshatra. The part of that nakshatra already traversed determines how much of the first Mahadasha had elapsed at birth.",
      "One Vimshottari year is treated as 365.25 days in this app. Traditional software can differ by a few days when it uses a 360-day savana year.",
      "Mahadasha, Antardasha and Pratyantar periods are nested in proportion to each planet's years in the 120-year cycle. Boundaries are calculated from the same start point, so there are no gaps or overlaps.",
      "Predictions combine the period lord's natal house, house lordships, dignity, functional nature, combustion, retrogression and its relationship to the parent period lord.",
      "The date labels are UTC calendar dates derived from exact epoch boundaries; a user's local date can differ by one day near midnight.",
      "Dasha periods show timing themes, not guaranteed events. Transits, divisional charts, individual circumstances and free will also matter.",
      "Remedies are optional devotional practices. They cannot guarantee an outcome and do not replace medical, legal, financial or psychological care.",
    ],
  };
}
