import { fmtDeg, siderealLon, YEAR_MS, type ChartData } from "@/lib/astro/calc";
import { NAKSHATRAS, PLANET_INFO, SIGNS, type PlanetId } from "@/lib/astro/data";
import { avakhada, dignity, houseFrom, houseLord, planet } from "@/lib/astro/analysis";
import { allPlanetReports } from "@/lib/astro/planetReport";
import { detectDoshas, remedyPlan, type DoshaResult, type PlanEntry } from "@/lib/astro/yogas";
import type { Remedy } from "@/lib/astro/remedies";

export interface ScoredDosha extends DoshaResult {
  key: string;
  /** Short plain-language label of what this dosha traditionally concerns. */
  topic: string;
  lifeAreas: string[];
  /** 0 when absent; otherwise 25/55/85 for Mild/Moderate/Strong. */
  impact: number;
  /** Explicit list of cancellations found, parsed from the shared engine's reasoning. */
  cancellations: string[];
  planetNotes: { id: PlanetId; sign: string; house: number; dignity: string; strength: number }[];
}

export interface SadeSatiPhase {
  phase: string;
  sign: string;
  start: string;
  end: string;
  status: "past" | "current" | "upcoming";
  note: string;
}

export interface DoshaReport {
  version: string;
  kind: "all-doshas";
  calculatedAt: string;
  method: string;
  checked: number;
  activeCount: number;
  cancelledCount: number;
  clearCount: number;
  overallLoad: number;
  loadLabel: string;
  doshas: ScoredDosha[];
  sadeSati: { active: boolean; summary: string; phases: SadeSatiPhase[] } | null;
  plan: { strengthen: PlanEntry[]; pacify: PlanEntry[] };
  priorityRemedies: Remedy[];
  generalNotes: Remedy[];
  chartSummary: {
    name: string; date: string; time: string; place: string;
    lagna: string; moonSign: string; nakshatra: string; pada: number;
    planets: { id: PlanetId; sign: string; degree: string; house: number; dignity: string; retro: boolean }[];
  };
  notes: string[];
}

const TOPICS: Record<string, { topic: string; areas: string[] }> = {
  "Mangal Dosha (Kuja Dosha)": { topic: "Mars placement affecting marital harmony", areas: ["Marriage & partnership", "Temper & conflict", "Property matters"] },
  "Kaal Sarp Dosha": { topic: "All planets hemmed between Rahu and Ketu", areas: ["Delays in early life", "Sudden ups and downs", "Mental restlessness"] },
  "Pitra Dosha": { topic: "Afflicted Sun or 9th house — ancestral karma", areas: ["Father & elders", "Progress & fortune", "Family lineage"] },
  "Grahan Dosha": { topic: "Sun or Moon conjunct a lunar node", areas: ["Confidence", "Emotional steadiness", "Clarity of mind"] },
  "Guru Chandal Dosha": { topic: "Jupiter joined with a lunar node", areas: ["Guidance & teachers", "Ethics & beliefs", "Decision making"] },
  "Kemadruma Dosha": { topic: "Moon without supporting planets alongside", areas: ["Emotional support", "Financial stability", "Social connection"] },
  "Shrapit Dosha": { topic: "Saturn conjunct Rahu", areas: ["Persistent delays", "Karmic obstacles", "Slow progress"] },
  "Angarak Dosha": { topic: "Mars joined with a lunar node", areas: ["Anger & impulsiveness", "Accident caution", "Disputes"] },
  "Shani Sade Sati (current)": { topic: "Saturn transiting 12th, 1st or 2nd from the Moon", areas: ["Responsibility & workload", "Health & stamina", "Life restructuring"] },
};

const IMPACT = { None: 0, Mild: 25, Moderate: 55, Strong: 85 } as const;
const key = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Pull the cancellation clause out of the shared engine's own wording, so nothing is invented here. */
function cancellationsFrom(d: DoshaResult): string[] {
  const match = d.details.match(/Cancelled \/ reduced by:\s*([^.]+)\./i);
  if (match) return match[1].split(";").map((s) => s.trim()).filter(Boolean);
  if (/cancelled by planets in Kendras/i.test(d.details)) return ["Planets in Kendras from the Lagna support the Moon"];
  return [];
}

/** Find the moment Saturn enters a sign, by scanning then bisecting its real longitude. */
function saturnIngress(targetSign: number, from: number, searchYears = 32): number | null {
  const step = 10 * 86400000;
  const signAt = (t: number) => Math.floor(siderealLon("Saturn", new Date(t)) / 30);
  let prev = signAt(from);
  for (let t = from + step; t < from + searchYears * YEAR_MS; t += step) {
    const now = signAt(t);
    if (now !== prev && now === targetSign) {
      let lo = t - step;
      let hi = t;
      for (let i = 0; i < 40; i++) {
        const mid = (lo + hi) / 2;
        if (signAt(mid) === targetSign) hi = mid; else lo = mid;
      }
      return hi;
    }
    prev = now;
  }
  return null;
}

export function buildSadeSati(c: ChartData, now: number): DoshaReport["sadeSati"] {
  const moonSign = planet(c, "Moon").sign;
  const signs = [(moonSign + 11) % 12, moonSign, (moonSign + 1) % 12];
  const labels = ["Rising phase (12th from Moon)", "Peak phase (over the Moon)", "Setting phase (2nd from Moon)"];
  const notes = [
    "Responsibilities and expenses typically increase; pace yourself and plan finances.",
    "The most demanding stretch — Saturn asks for discipline, honesty and patience.",
    "Pressure eases gradually; lessons consolidate into lasting stability.",
  ];
  // Start a full cycle before now so a currently running phase is captured with its true start.
  const phases: SadeSatiPhase[] = [];
  let cursor = now - 32 * YEAR_MS;
  // The three phases are consecutive signs, so each one begins where the previous ends.
  for (let cycle = 0; cycle < 2 && phases.length < 6; cycle++) {
    const cycleStart = saturnIngress(signs[0], cursor);
    if (cycleStart === null) break;
    let phaseStart = cycleStart;
    for (let i = 0; i < 3; i++) {
      const end = saturnIngress((signs[i] + 1) % 12, phaseStart + 60 * 86400000) ?? phaseStart + 2.5 * YEAR_MS;
      if (end >= now - 3 * YEAR_MS) {
        phases.push({
          phase: labels[i],
          sign: SIGNS[signs[i]].en,
          start: new Date(phaseStart).toISOString(),
          end: new Date(end).toISOString(),
          status: end < now ? "past" : phaseStart <= now ? "current" : "upcoming",
          note: notes[i],
        });
      }
      phaseStart = end;
    }
    cursor = phaseStart + 30 * 86400000;
  }
  phases.sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  const current = phases.find((p) => p.status === "current");
  const next = phases.find((p) => p.status === "upcoming");
  const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
  return {
    active: Boolean(current),
    summary: current
      ? `Sade Sati is running now — ${current.phase.toLowerCase()} in ${current.sign}, until ${fmt(current.end)}.`
      : next
        ? `Sade Sati is not running now. The next phase begins in ${fmt(next.start)} (${next.phase.toLowerCase()} in ${next.sign}).`
        : "No Sade Sati phase was found in the scanned window.",
    phases,
  };
}

export function buildDoshaReport(c: ChartData, transits: Record<PlanetId, number>, now = Date.now()): DoshaReport {
  const detected = detectDoshas(c, transits, now);
  const reports = allPlanetReports(c);
  const strengthOf = (id: PlanetId) => reports.find((r) => r.id === id)?.score ?? 0;

  const doshas: ScoredDosha[] = detected.map((d) => {
    const meta = TOPICS[d.name] ?? { topic: "Traditional affliction", areas: [] };
    return {
      ...d,
      key: key(d.name),
      topic: meta.topic,
      lifeAreas: meta.areas,
      impact: IMPACT[d.severity],
      cancellations: cancellationsFrom(d),
      planetNotes: d.planets.map((id) => {
        const p = planet(c, id);
        return { id, sign: SIGNS[p.sign].sa, house: p.house, dignity: dignity(id, p.sign, p.deg, c), strength: strengthOf(id) };
      }),
    };
  });

  const active = doshas.filter((d) => d.present);
  const cancelled = doshas.filter((d) => !d.present && d.severity !== "None");
  const clear = doshas.filter((d) => d.severity === "None");
  const overallLoad = doshas.length ? Math.round(doshas.reduce((s, d) => s + d.impact, 0) / (doshas.length * 85) * 100) : 0;

  const priorityRemedies: Remedy[] = active
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 3)
    .flatMap((d) => d.remedies.filter((r) => r.kind === "Mantra" || r.kind === "Charity").slice(0, 1).map((r) => ({ ...r, text: `${d.name}: ${r.text}` })));

  const a = avakhada(c);
  return {
    version: "all-doshas-1.0",
    kind: "all-doshas",
    calculatedAt: new Date(now).toISOString(),
    method: "Classical dosha rules evaluated on the saved birth chart · Lahiri sidereal · whole-sign houses · Sade Sati from live Saturn transits",
    checked: doshas.length,
    activeCount: active.length,
    cancelledCount: cancelled.length,
    clearCount: clear.length,
    overallLoad,
    loadLabel: overallLoad === 0 ? "No active afflictions" : overallLoad < 20 ? "Light" : overallLoad < 40 ? "Moderate" : "Significant",
    doshas,
    sadeSati: buildSadeSati(c, now),
    plan: remedyPlan(c, [], detected),
    priorityRemedies,
    generalNotes: [
      { kind: "Lifestyle", text: "A dosha describes a traditional area of difficulty, not a fixed fate. Many charts carry one or more, and classical texts list cancellations for most of them." },
      { kind: "Timing", text: "Doshas are felt most during the dasha periods of the planets involved. Each dosha below lists its own upcoming periods where applicable." },
      { kind: "Puja", text: "Begin with simple, low-cost practices — mantra, charity and honest conduct. Be cautious of anyone demanding expensive rituals to 'remove' a dosha." },
    ],
    chartSummary: {
      name: c.input.name, date: c.input.date, time: c.input.time, place: c.input.place,
      lagna: `${a.lagna.sa} (${a.lagna.en})`,
      moonSign: `${a.rashi.sa} (${a.rashi.en})`,
      nakshatra: NAKSHATRAS[planet(c, "Moon").nak].name,
      pada: a.pada,
      planets: c.planets.map((p) => ({
        id: p.id, sign: SIGNS[p.sign].sa, degree: fmtDeg(p.deg), house: p.house,
        dignity: dignity(p.id, p.sign, p.deg, c), retro: p.retro && !["Rahu", "Ketu"].includes(p.id),
      })),
    },
    notes: [
      "Doshas are detected with the same engine as your main horoscope and the marriage calculator: Astronomy Engine positions, Lahiri sidereal ayanamsa, whole-sign houses and mean lunar nodes.",
      "Every dosha that was checked is listed, including those not present, so you can see the full scope of the analysis.",
      "Where a classical cancellation applies, it is shown explicitly and the dosha is reported as reduced rather than silently hidden.",
      "The affliction load is this app's summary of the listed severities. It is a reading aid, not a classical measurement.",
      "Sade Sati phase dates come from live Saturn transits and are rounded to the ingress moment; your main horoscope uses the same transit source.",
      "Classical texts differ on several dosha definitions, especially Mangal Dosha from the 2nd house and Pitra Dosha. A qualified astrologer may read your chart differently.",
      "This is traditional interpretive guidance. It is not medical, financial, legal or psychological advice, and no remedy can guarantee an outcome.",
    ],
  };
}

export { houseFrom, houseLord, PLANET_INFO };
