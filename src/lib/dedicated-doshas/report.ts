import { currentTransits, fmtDeg, type ChartData } from "@/lib/astro/calc";
import { BHAVAS, NAKSHATRAS, PLANET_INFO, SIGNS, type PlanetId } from "@/lib/astro/data";
import { aspectedHouses, avakhada, dignity, houseFrom, houseLord, planet, planetsInHouse } from "@/lib/astro/analysis";
import { allPlanetReports } from "@/lib/astro/planetReport";
import { detectDoshas, type DoshaResult } from "@/lib/astro/yogas";
import { buildSadeSati, type SadeSatiPhase } from "@/lib/dosha/report";
import type { Remedy } from "@/lib/astro/remedies";

const SEVEN: PlanetId[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
const norm = (x: number) => ((x % 360) + 360) % 360;

export interface DedicatedSummary {
  name: string; date: string; time: string; place: string;
  lagna: string; moonSign: string; nakshatra: string; pada: number;
}

export interface KaalSarpReport {
  version: string; kind: "kaal-sarp"; calculatedAt: string; method: string;
  present: boolean; partial: boolean; enclosedCount: number; direction: string;
  typeName: string; typeNumber: number; rahuHouse: number; ketuHouse: number;
  axis: { rahu: string; ketu: string; rahuDegree: string; ketuDegree: string };
  sequence: { id: PlanetId; offsetFromRahu: number; side: string; sign: string; house: number; distanceToNearestNode: number }[];
  outside: PlanetId[]; affectedAreas: string[]; supports: string[];
  sharedResult: DoshaResult; remedies: Remedy[]; summary: DedicatedSummary; notes: string[];
}

const KS_NAMES = ["Anant", "Kulik", "Vasuki", "Shankhpal", "Padma", "Mahapadma", "Takshak", "Karkotak", "Shankhachood", "Ghatak", "Vishdhar", "Sheshnag"];
const KS_EFFECTS = [
  "identity, confidence and partnership balance", "family wealth, speech and longevity", "siblings, courage, travel and fortune", "home, mother, property and career", "education, children, creativity and gains", "health, debt, competition and expenses",
  "marriage, public life and self-image", "sudden change, inheritance and family resources", "fortune, beliefs, father and communication", "career, reputation, home and emotional security", "gains, friendships, children and learning", "expenses, foreign lands, service and disease-resistance",
];

function summary(c: ChartData): DedicatedSummary {
  const a = avakhada(c);
  return { name: c.input.name, date: c.input.date, time: c.input.time, place: c.input.place, lagna: `${a.lagna.sa} (${a.lagna.en})`, moonSign: `${a.rashi.sa} (${a.rashi.en})`, nakshatra: a.nakshatra.name, pada: a.pada };
}

export function buildKaalSarpReport(c: ChartData, now = Date.now()): KaalSarpReport {
  const rahu = planet(c, "Rahu"), ketu = planet(c, "Ketu");
  const forward = SEVEN.map((id) => ({ id, offset: norm(planet(c, id).lon - rahu.lon) }));
  const forwardCount = forward.filter((p) => p.offset > 1e-7 && p.offset < 180 - 1e-7).length;
  const backwardCount = 7 - forwardCount;
  const present = forwardCount === 7 || backwardCount === 7;
  const enclosedCount = Math.max(forwardCount, backwardCount);
  const partial = !present && enclosedCount === 6;
  const useForward = forwardCount >= backwardCount;
  const outside = forward.filter((p) => useForward ? !(p.offset > 0 && p.offset < 180) : p.offset > 0 && p.offset < 180).map((p) => p.id);
  const typeNumber = rahu.house;
  const typeName = KS_NAMES[typeNumber - 1];
  const reports = allPlanetReports(c);
  const jupiter = planet(c, "Jupiter");
  const supports: string[] = [];
  if ([1, 4, 5, 7, 9, 10, 11].includes(planet(c, houseLord(c, 1)).house)) supports.push("Lagna lord is placed in a supportive Kendra, Trikona or gain house.");
  if (["Exalted", "Moolatrikona", "Own Sign"].includes(dignity("Jupiter", jupiter.sign, jupiter.deg, c))) supports.push("Jupiter is strong by sign, offering judgment and protection.");
  if (aspectedHouses(jupiter).includes(rahu.house) || aspectedHouses(jupiter).includes(ketu.house)) supports.push("Jupiter aspects one end of the node axis.");
  const shared = detectDoshas(c, undefined, now).find((d) => d.name === "Kaal Sarp Dosha")!;
  const sequence = forward
    .map(({ id, offset }) => {
      const p = planet(c, id);
      return { id, offsetFromRahu: Math.round(offset * 1000) / 1000, side: offset < 180 ? "Rahu → Ketu" : "Ketu → Rahu", sign: SIGNS[p.sign].sa, house: p.house, distanceToNearestNode: Math.round(Math.min(norm(p.lon - rahu.lon), norm(rahu.lon - p.lon), norm(p.lon - ketu.lon), norm(ketu.lon - p.lon)) * 1000) / 1000 };
    })
    .sort((a, b) => a.offsetFromRahu - b.offsetFromRahu);
  return {
    version: "kaal-sarp-1.0", kind: "kaal-sarp", calculatedAt: new Date(now).toISOString(),
    method: "Seven classical planets tested on the Rahu–Ketu semicircle · Lahiri sidereal · mean nodes",
    present, partial, enclosedCount,
    direction: useForward ? "Rahu-to-Ketu semicircle contains the greater number of planets" : "Ketu-to-Rahu semicircle contains the greater number of planets",
    typeName, typeNumber, rahuHouse: rahu.house, ketuHouse: ketu.house,
    axis: { rahu: `${SIGNS[rahu.sign].sa} · house ${rahu.house}`, ketu: `${SIGNS[ketu.sign].sa} · house ${ketu.house}`, rahuDegree: fmtDeg(rahu.deg), ketuDegree: fmtDeg(ketu.deg) },
    sequence, outside,
    affectedAreas: KS_EFFECTS[typeNumber - 1].split(", "),
    supports,
    sharedResult: shared,
    remedies: shared.remedies,
    summary: summary(c),
    notes: [
      "Full Kaal Sarp is reported only when all seven classical planets lie in one open semicircle between Rahu and Ketu. Rahu and Ketu themselves are not counted among the seven.",
      "One planet outside the enclosure is shown as a partial pattern, not a full Kaal Sarp Dosha. Two or more outside means the pattern is absent.",
      "The type name is determined by Rahu's whole-sign house. Some schools reverse or rename Kaal Sarp and Kaal Amrita; this report shows the actual enclosure direction rather than hiding that disagreement.",
      "A planet exactly conjunct a node is a boundary case. The degree table shows its distance so an astrologer can review it.",
      "There is no universally accepted cancellation formula. Supportive factors are shown as mitigation context and do not change the raw present/absent result.",
      "This dedicated calculator uses the same node setting as the main horoscope (mean nodes). Other software using true nodes can differ near a boundary.",
      "Kaal Sarp is a traditional interpretive concept, not a scientific diagnosis or a guarantee of obstacles. Avoid fear-based or expensive remedies.",
    ],
  };
}

export interface MangalReference {
  reference: "Lagna" | "Moon" | "Venus";
  house: number;
  manglik: boolean;
  theme: string;
}

export interface MangalReport {
  version: string; kind: "mangal-dosha"; calculatedAt: string; method: string;
  present: boolean; severity: string; score: number;
  mars: { sign: string; degree: string; house: number; dignity: string; strength: number; retro: boolean; combust: boolean; navamsaSign: string; navamsaHouse: number; conjunctions: PlanetId[]; aspects: number[] };
  references: MangalReference[]; cancellations: string[]; sharedResult: DoshaResult;
  marriage: { seventhSign: string; seventhLord: PlanetId; lordHouse: number; planetsInSeventh: PlanetId[]; venusHouse: number; venusDignity: string; jupiterHouse: number; navamsaSeventhLord: PlanetId; navamsaLordHouse: number };
  remedies: Remedy[]; summary: DedicatedSummary; notes: string[];
}

const MANGAL_HOUSES = [1, 2, 4, 7, 8, 12];
const MANGAL_THEME: Record<number, string> = {
  1: "Mars colours temperament and self-expression; impatience can enter relationships.",
  2: "Family atmosphere, speech and shared finances need restraint.",
  4: "Domestic peace, property and emotional security can feel heated.",
  7: "Mars directly influences spouse, partnership and conflict style.",
  8: "Intimacy, in-laws, joint assets and sudden changes need maturity.",
  12: "Private life, sleep, expenses and intimacy can carry restlessness.",
};

function cancellationList(c: ChartData, shared: DoshaResult): string[] {
  const out: string[] = [];
  const mars = planet(c, "Mars");
  if ([0, 7, 9].includes(mars.sign)) out.push("Mars is in its own or exaltation sign (Aries, Scorpio or Capricorn).");
  const j = planet(c, "Jupiter");
  if (j.sign === mars.sign || aspectedHouses(j).includes(mars.house)) out.push("Jupiter joins or aspects Mars.");
  if (mars.house === 2 && [2, 5].includes(mars.sign)) out.push("Mars in the 2nd house is in Gemini or Virgo.");
  if (mars.house === 4 && [0, 7].includes(mars.sign)) out.push("Mars in the 4th is in its own sign.");
  const parsed = shared.details.match(/Cancelled \/ reduced by:\s*([^.]+)\./i)?.[1].split(";").map((s) => s.trim()) ?? [];
  for (const x of parsed) if (!out.some((v) => v.toLowerCase().includes(x.toLowerCase()))) out.push(x + ".");
  return out;
}

export function buildMangalReport(c: ChartData, now = Date.now()): MangalReport {
  const mars = planet(c, "Mars"), moon = planet(c, "Moon"), venus = planet(c, "Venus"), jupiter = planet(c, "Jupiter");
  const refs: MangalReference[] = [
    { reference: "Lagna", house: mars.house, manglik: MANGAL_HOUSES.includes(mars.house), theme: MANGAL_THEME[mars.house] ?? "Mars does not occupy a Manglik house from this reference." },
    { reference: "Moon", house: houseFrom(moon.sign, mars.sign), manglik: MANGAL_HOUSES.includes(houseFrom(moon.sign, mars.sign)), theme: MANGAL_THEME[houseFrom(moon.sign, mars.sign)] ?? "Mars does not occupy a Manglik house from this reference." },
    { reference: "Venus", house: houseFrom(venus.sign, mars.sign), manglik: MANGAL_HOUSES.includes(houseFrom(venus.sign, mars.sign)), theme: MANGAL_THEME[houseFrom(venus.sign, mars.sign)] ?? "Mars does not occupy a Manglik house from this reference." },
  ];
  const shared = detectDoshas(c, undefined, now).find((d) => d.name.startsWith("Mangal"))!;
  const hits = refs.filter((r) => r.manglik).length;
  const cancellations = cancellationList(c, shared);
  const strength = allPlanetReports(c).find((r) => r.id === "Mars")?.score ?? 0;
  const seventhLord = houseLord(c, 7);
  const d9Asc = c.asc.d9;
  const d9SeventhLord = SIGNS[(d9Asc + 6) % 12].lord;
  const score = hits === 0 ? 0 : Math.max(10, Math.min(100, hits * 30 + (strength >= 70 ? 10 : 0) - cancellations.length * 20));
  return {
    version: "mangal-dosha-1.0", kind: "mangal-dosha", calculatedAt: new Date(now).toISOString(),
    method: "Mars tested from Lagna, Moon and Venus in houses 1, 2, 4, 7, 8 and 12 · shared main-horoscope cancellation rules",
    present: shared.present, severity: shared.severity, score,
    mars: {
      sign: SIGNS[mars.sign].sa, degree: fmtDeg(mars.deg), house: mars.house,
      dignity: dignity("Mars", mars.sign, mars.deg, c), strength,
      retro: mars.retro, combust: mars.combust,
      navamsaSign: SIGNS[mars.d9].sa, navamsaHouse: houseFrom(d9Asc, mars.d9),
      conjunctions: c.planets.filter((p) => p.id !== "Mars" && p.sign === mars.sign).map((p) => p.id),
      aspects: aspectedHouses(mars),
    },
    references: refs, cancellations, sharedResult: shared,
    marriage: {
      seventhSign: SIGNS[(c.asc.sign + 6) % 12].en,
      seventhLord,
      lordHouse: planet(c, seventhLord).house,
      planetsInSeventh: planetsInHouse(c, 7).map((p) => p.id),
      venusHouse: venus.house,
      venusDignity: dignity("Venus", venus.sign, venus.deg, c),
      jupiterHouse: jupiter.house,
      navamsaSeventhLord: d9SeventhLord,
      navamsaLordHouse: houseFrom(d9Asc, planet(c, d9SeventhLord).d9),
    },
    remedies: shared.remedies,
    summary: summary(c),
    notes: [
      "This app uses the 1st, 2nd, 4th, 7th, 8th and 12th houses from Lagna, Moon and Venus. Some traditions omit the 2nd house; their result can differ.",
      "A raw Manglik placement and an active dosha are not the same: classical cancellations are checked and shown separately.",
      "The score is this app's visual intensity summary (number of reference hits, Mars strength and cancellations), not a classical numerical score.",
      "Mars becoming older or marriage after age 28 does not automatically erase the placement; that popular claim is not universally accepted.",
      "Marriage judgment cannot be made from Mars alone. The 7th house, its lord, Venus/Jupiter, Navamsa and both partners' charts also matter and are displayed here.",
      "Matching with another Manglik can offer balancing context in some traditions, but is not a guarantee and should not override relationship compatibility.",
      "This is traditional interpretive guidance. It is not a reason to fear marriage, and no ritual can guarantee an outcome.",
    ],
  };
}

export interface SadeSatiReport {
  version: string; kind: "sade-sati"; calculatedAt: string; method: string;
  active: boolean; summaryText: string; currentSaturn: { sign: string; degree: string; houseFromMoon: number; houseFromLagna: number };
  phase: SadeSatiPhase | null; phases: SadeSatiPhase[]; dhaiya: { active: boolean; type: string | null; summary: string };
  natalSaturn: { sign: string; degree: string; house: number; dignity: string; strength: number; retro: boolean };
  runningDasha: { chain: PlanetId[]; saturnInChain: boolean };
  sharedResult: DoshaResult; remedies: Remedy[]; summary: DedicatedSummary; notes: string[];
}

export function buildSadeSatiReport(c: ChartData, transits = currentTransits(), now = Date.now()): SadeSatiReport {
  const timeline = buildSadeSati(c, now)!;
  const moon = planet(c, "Moon"), saturn = planet(c, "Saturn");
  const satSign = Math.floor(transits.Saturn / 30);
  const hMoon = houseFrom(moon.sign, satSign), hLagna = ((satSign - c.asc.sign + 12) % 12) + 1;
  const currentPhase = timeline.phases.find((p) => p.status === "current") ?? null;
  const dhaiya = [4, 8].includes(hMoon);
  const shared = detectDoshas(c, transits, now).find((d) => d.name.startsWith("Shani Sade Sati"))!;
  const md = c.dashas.find((p) => p.start <= now && p.end > now);
  const ad = md && (() => { const periods = (awaitSub(md)); return periods.find((p) => p.start <= now && p.end > now); })();
  const pd = ad && (() => { const periods = (awaitSub(ad)); return periods.find((p) => p.start <= now && p.end > now); })();
  const chain = [md?.lord, ad?.lord, pd?.lord].filter((x): x is PlanetId => Boolean(x));
  const strength = allPlanetReports(c).find((r) => r.id === "Saturn")?.score ?? 0;
  return {
    version: "sade-sati-1.0", kind: "sade-sati", calculatedAt: new Date(now).toISOString(),
    method: "Live sidereal Saturn transits through the 12th, 1st and 2nd signs from the natal Moon · ingress dates by scan + bisection",
    active: timeline.active, summaryText: timeline.summary,
    currentSaturn: { sign: SIGNS[satSign].en, degree: fmtDeg(transits.Saturn % 30), houseFromMoon: hMoon, houseFromLagna: hLagna },
    phase: currentPhase,
    phases: timeline.phases,
    dhaiya: {
      active: dhaiya,
      type: hMoon === 4 ? "Kantaka Shani (4th from Moon)" : hMoon === 8 ? "Ashtama Shani (8th from Moon)" : null,
      summary: dhaiya ? `Sade Sati is not the only Saturn transit considered: Saturn is ${hMoon}th from the Moon, so ${hMoon === 4 ? "Kantaka" : "Ashtama"} Shani (Dhaiya) is active.` : `Saturn is ${hMoon}th from the Moon, so Shani Dhaiya is not active.`,
    },
    natalSaturn: { sign: SIGNS[saturn.sign].sa, degree: fmtDeg(saturn.deg), house: saturn.house, dignity: dignity("Saturn", saturn.sign, saturn.deg, c), strength, retro: saturn.retro },
    runningDasha: { chain, saturnInChain: chain.includes("Saturn") },
    sharedResult: shared,
    remedies: shared.remedies,
    summary: summary(c),
    notes: [
      "Sade Sati is a transit, not a permanent birth-chart dosha. It runs while Saturn occupies the 12th, same and 2nd signs from the natal Moon.",
      "Phase dates are calculated from sidereal Saturn sign ingresses. Retrograde motion can briefly re-enter a sign; this report follows the first sustained ingress boundaries used by the scanner.",
      "Dhaiya (4th or 8th from Moon) is shown separately. It is not part of the seven-and-a-half-year Sade Sati cycle.",
      "Natal Saturn, its dignity and the running dasha strongly affect how the transit is experienced; they are displayed here.",
      "A strong or benefic Saturn does not remove the transit, but discipline and honest work can make the period constructive.",
      "Fear-based predictions are inappropriate. Sade Sati does not automatically cause job loss, illness, divorce or death.",
      "This is traditional interpretive guidance, not medical, financial, legal or psychological advice.",
    ],
  };
}

// Kept local to avoid another import cycle in the dedicated report module.
import { subPeriods as awaitSub } from "@/lib/astro/calc";
