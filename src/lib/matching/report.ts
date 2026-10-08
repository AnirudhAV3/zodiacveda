import { subPeriods, YEAR_MS, type ChartData, type DashaPeriod } from "@/lib/astro/calc";
import { NAKSHATRAS, PLANET_INFO, SIGNS, type PlanetId } from "@/lib/astro/data";
import { houseFrom, houseLord, planet } from "@/lib/astro/analysis";
import { naturalRel } from "@/lib/astro/shadbala";
import { overallPredictions } from "@/lib/astro/predictions";
import { detectDoshas, type DoshaResult } from "@/lib/astro/yogas";
import { WORSHIP, type Remedy } from "@/lib/astro/remedies";
import { MATCHING_METHOD, scoreKootas, type Koota } from "./rules";

export interface MatchCheck {
  key: string;
  title: string;
  status: "clear" | "review" | "mitigated";
  summary: string;
  evidence: string[];
  remedies: Remedy[];
}

export interface MarriageIndicators {
  seventhSign: string;
  seventhLord: PlanetId;
  lordHouse: number;
  planetsInSeventh: PlanetId[];
  navamsaLagna: string;
  navamsaSeventhLord: PlanetId;
  navamsaLordHouse: number;
  paragraphs: string[];
}

export interface RunningDasha {
  chain: PlanetId[];
  end: number | null;
  themes: string;
}

export interface MatchResult {
  version: string;
  calculatedAt: string;
  method: string;
  total: number;
  maximum: 36;
  percentage: number;
  band: string;
  summary: string;
  kootas: Koota[];
  checks: MatchCheck[];
  manglik: {
    first: DoshaResult;
    second: DoshaResult;
    firstHouses: number[];
    secondHouses: number[];
    status: "balanced" | "different" | "review";
    summary: string;
  };
  marriage: { first: MarriageIndicators; second: MarriageIndicators };
  running: { first: RunningDasha; second: RunningDasha };
  commonWindows: { start: number; end: number; first: string; second: string }[];
  strengths: string[];
  considerations: string[];
  timeWarnings: string[];
  remedies: Remedy[];
  notes: string[];
}

const moonSignature = (c: ChartData) => {
  const m = planet(c, "Moon");
  return { sign: m.sign, degree: m.deg, nak: m.nak, pada: m.pada };
};
const factor = (k: Koota[], key: string) => k.find((f) => f.key === key)!;
const mutualFriends = (a: PlanetId, b: PlanetId) => a === b || (naturalRel(a, b) === 1 && naturalRel(b, a) === 1);

function marriageIndicators(c: ChartData, now: number): MarriageIndicators {
  const sign = (c.asc.sign + 6) % 12;
  const lord = houseLord(c, 7);
  const l7 = planet(c, lord);
  const d9Lord = SIGNS[(c.asc.d9 + 6) % 12].lord;
  return {
    seventhSign: SIGNS[sign].en,
    seventhLord: lord,
    lordHouse: l7.house,
    planetsInSeventh: c.planets.filter((p) => p.house === 7).map((p) => p.id),
    navamsaLagna: SIGNS[c.asc.d9].en,
    navamsaSeventhLord: d9Lord,
    navamsaLordHouse: houseFrom(c.asc.d9, planet(c, d9Lord).d9),
    paragraphs: overallPredictions(c, now).find((p) => p.key === "partner")?.paragraphs ?? [],
  };
}

function runningDasha(c: ChartData, now: number): RunningDasha {
  const md = c.dashas.find((p) => p.start <= now && p.end > now);
  if (!md) return { chain: [], end: null, themes: "No period covering the calculation date was found." };
  const ad = subPeriods(md).find((p) => p.start <= now && p.end > now);
  const pd = ad && subPeriods(ad).find((p) => p.start <= now && p.end > now);
  const last = pd ?? ad ?? md;
  return { chain: [md.lord, ...(ad ? [ad.lord] : []), ...(pd ? [pd.lord] : [])], end: last.end, themes: PLANET_INFO[(ad ?? md).lord].karaka };
}

function relationshipPeriods(c: ChartData, now: number): { md: PlanetId; ad: PlanetId; period: DashaPeriod }[] {
  const significators: PlanetId[] = [houseLord(c, 7), "Venus", "Jupiter"];
  const end = now + 5 * YEAR_MS;
  const periods: { md: PlanetId; ad: PlanetId; period: DashaPeriod }[] = [];
  for (const md of c.dashas) {
    if (md.end <= now || md.start >= end) continue;
    for (const ad of subPeriods(md)) {
      if (ad.end > now && ad.start < end && significators.includes(ad.lord)) {
        periods.push({ md: md.lord, ad: ad.lord, period: { ...ad, start: Math.max(ad.start, now), end: Math.min(ad.end, end) } });
      }
    }
  }
  return periods;
}

function commonWindows(first: ChartData, second: ChartData, now: number): MatchResult["commonWindows"] {
  const out: MatchResult["commonWindows"] = [];
  for (const a of relationshipPeriods(first, now)) {
    for (const b of relationshipPeriods(second, now)) {
      const start = Math.max(a.period.start, b.period.start);
      const end = Math.min(a.period.end, b.period.end);
      if (end - start > 7 * 86400000) out.push({ start, end, first: `${a.md}–${a.ad}`, second: `${b.md}–${b.ad}` });
    }
  }
  return out.sort((a, b) => a.start - b.start).slice(0, 4);
}

function moonBoundaryWarnings(c: ChartData) {
  const p = planet(c, "Moon");
  const width = Math.abs(p.speed) * 10 / 1440;
  const warnings: string[] = [];
  for (const [unit, name] of [[30, "Moon-sign"], [360 / 27, "nakshatra"], [360 / 108, "pada"]] as const) {
    const d = p.lon % unit;
    if (Math.min(d, unit - d) <= width) warnings.push(`${c.input.name}'s Moon is close to a ${name} boundary. A birth-time error of about ten minutes could change that classification; verify the recorded time.`);
  }
  return warnings;
}

export function buildMatchResult(first: ChartData, second: ChartData, now = Date.now()): MatchResult {
  const kootas = scoreKootas(moonSignature(first), moonSignature(second));
  const total = kootas.reduce((sum, k) => sum + k.score, 0);
  const band = total >= 33 ? "High traditional score" : total >= 25 ? "Good traditional score" : total >= 18 ? "Moderate traditional score" : "Below the traditional 18-point threshold";
  const am = planet(first, "Moon");
  const bm = planet(second, "Moon");
  const aLord = SIGNS[am.sign].lord;
  const bLord = SIGNS[bm.sign].lord;
  const checks: MatchCheck[] = [];

  const nadiReasons: string[] = [];
  if (am.sign === bm.sign && am.nak !== bm.nak) nadiReasons.push("Same Moon sign but different nakshatras: an exception accepted in some traditions.");
  if (am.nak === bm.nak && am.sign !== bm.sign) nadiReasons.push("Same nakshatra in different Moon signs: an exception accepted in some traditions.");
  if (am.nak === bm.nak && am.pada !== bm.pada) nadiReasons.push("Same nakshatra but different padas: some lineages treat this as mitigation.");
  if (am.sign !== bm.sign && aLord === bLord) nadiReasons.push(`Different Moon signs with the same lord (${aLord}): some lineages accept this exception.`);
  const nadi = factor(kootas, "nadi");
  checks.push({
    key: "nadi", title: "Nadi review", status: nadi.score ? "clear" : nadiReasons.length ? "mitigated" : "review",
    summary: nadi.score ? "The Nadi groups differ. No raw Nadi dosha is flagged." : nadiReasons.length ? "The Nadi groups match, with a possible tradition-specific exception. The raw score remains 0/8." : "The Nadi groups match; seek a whole-chart review rather than judging from the total alone.",
    evidence: [`${first.input.name}: ${NAKSHATRAS[am.nak].nadi}. ${second.input.name}: ${NAKSHATRAS[bm.nak].nadi}.`, ...nadiReasons],
    remedies: [
      { kind: "Puja", text: "If meaningful to both partners, consult a qualified priest or astrologer about a Nadi-shanti or Shiva–Parvati prayer; it does not medically change compatibility." },
      { kind: "Lifestyle", text: "Discuss family plans openly. Consult a medical professional for fertility, health or genetic questions; Nadi is not a medical test." },
    ],
  });

  const bhakoot = factor(kootas, "bhakoot");
  const bMitigation = !bhakoot.score && mutualFriends(aLord, bLord);
  checks.push({
    key: "bhakoot", title: "Bhakoot review", status: bhakoot.score ? "clear" : bMitigation ? "mitigated" : "review",
    summary: bhakoot.score ? "The Moon-sign relationship passes the raw Bhakoot test." : bMitigation ? "A raw Bhakoot mismatch is present, but the Moon-sign lords are the same or mutual friends—a commonly considered mitigation. No points have been added." : "A 2/12, 5/9 or 6/8 Moon-sign relationship is flagged by the selected scoring tradition.",
    evidence: [...bhakoot.evidence, `Moon-sign lords: ${aLord} and ${bLord}.`],
    remedies: [
      { kind: "Puja", text: "Optional: worship Uma–Maheshwara (Shiva and Parvati) together for harmony, and review both complete horoscopes before selecting rituals." },
      { kind: "Lifestyle", text: "Discuss spending, savings, family involvement and responsibilities before making a long-term commitment." },
    ],
  });

  const gana = factor(kootas, "gana");
  const navFriends = mutualFriends(SIGNS[am.d9].lord, SIGNS[bm.d9].lord);
  const gMitigation = gana.score < 5 && (factor(kootas, "maitri").score >= 4 || navFriends);
  checks.push({
    key: "gana", title: "Temperament review", status: gana.score >= 5 ? "clear" : gMitigation ? "mitigated" : "review",
    summary: gana.score >= 5 ? "The Gana pairing is supportive in this scoring table." : gMitigation ? "The Gana table gives a low score, but Moon-sign or Navamsa-sign lord friendship offers supportive context. The raw score is unchanged." : "The Gana classifications differ; compare communication and conflict styles rather than attaching negative labels.",
    evidence: [...gana.evidence, `Moon-lord friendship: ${factor(kootas, "maitri").score}/5.`, `Moon Navamsa lords: ${SIGNS[am.d9].lord} / ${SIGNS[bm.d9].lord}.`],
    remedies: [{ kind: "Lifestyle", text: "Learn how each person handles disagreements. Make time for calm conversations and use relationship counselling if helpful." }],
  });

  const manglikFirst = detectDoshas(first, undefined, now).find((d) => d.name.startsWith("Mangal"))!;
  const manglikSecond = detectDoshas(second, undefined, now).find((d) => d.name.startsWith("Mangal"))!;
  const marsHouses = (c: ChartData) => { const m = planet(c, "Mars"); return [m.house, houseFrom(planet(c, "Moon").sign, m.sign), houseFrom(planet(c, "Venus").sign, m.sign)]; };
  const bothActive = manglikFirst.present && manglikSecond.present;
  const oneActive = manglikFirst.present !== manglikSecond.present;
  const reduced = manglikFirst.severity !== "None" || manglikSecond.severity !== "None";
  const manglikStatus = oneActive ? "different" : bothActive ? "review" : "balanced";
  const manglikSummary = oneActive ? "One chart has an active Mangal flag and the other does not. Review the houses, severity and cancellations together; this is not an automatic rejection." : bothActive ? "Both charts have an active Mangal flag. Similar placements can offer balancing context in some traditions, but severity and full charts still matter." : reduced ? "Neither chart has an uncancelled Mangal flag in the shared engine. Reduced or cancelled placements are listed below." : "Neither chart has a Mangal flag under the same rules used in the main horoscope.";

  const strengths = kootas.filter((k) => k.score / k.max >= 0.75).map((k) => `${k.name}: ${k.score}/${k.max} — ${k.topic.toLowerCase()}.`);
  const considerations = checks.filter((c) => c.status !== "clear").map((c) => c.summary);
  if (manglikStatus !== "balanced") considerations.push(manglikSummary);
  if (factor(kootas, "yoni").score < 2) considerations.push("Yoni scores below 2/4; discuss intimacy expectations openly and respectfully.");

  const remedies: Remedy[] = [
    { kind: "Puja", text: "Optional shared practice: pray to Shiva and Parvati (Uma–Maheshwara) on Mondays or Fridays, with both partners' consent." },
    { kind: "Lifestyle", text: "Have practical conversations about finances, family expectations, children, communication, consent and personal boundaries. These cannot be replaced by a score." },
  ];
  for (const c of [first, second]) {
    const lord = SIGNS[planet(c, "Moon").sign].lord;
    remedies.push({ kind: "Mantra", text: `${c.input.name}: for a voluntary Moon-lord practice, recite “${PLANET_INFO[lord].mantra}” on ${PLANET_INFO[lord].day}s. Worship ${WORSHIP[lord]} if it fits your beliefs.` });
  }
  if (reduced) remedies.push({ kind: "Puja", text: "For a Mangal flag: a simple Hanuman prayer or Hanuman Chalisa on Tuesdays is a traditional option. Avoid expensive remedies without individual guidance." });
  remedies.push({ kind: "Gemstone", text: "No joint gemstone is prescribed from Guna Milan alone. Review each person's functional planets separately before buying or wearing a stone." });

  return {
    version: "marriage-matching-1.0", calculatedAt: new Date(now).toISOString(), method: MATCHING_METHOD,
    total, maximum: 36, percentage: Math.round(total / 36 * 1000) / 10, band,
    summary: `${total}/36 points in the selected Ashtakoota convention. ${total >= 18 ? "The raw total meets the commonly used 18-point threshold." : "The raw total is below the commonly used 18-point threshold."} ${considerations.length ? "Review the flagged factors and both complete charts, not the number alone." : "The reviewed major factors show no unresolved flags in this method."} This is traditional astrological guidance, not a guarantee or a decision about the relationship.`,
    kootas, checks,
    manglik: { first: manglikFirst, second: manglikSecond, firstHouses: marsHouses(first), secondHouses: marsHouses(second), status: manglikStatus, summary: manglikSummary },
    marriage: { first: marriageIndicators(first, now), second: marriageIndicators(second, now) },
    running: { first: runningDasha(first, now), second: runningDasha(second, now) },
    commonWindows: commonWindows(first, second, now), strengths, considerations,
    timeWarnings: [...moonBoundaryWarnings(first), ...moonBoundaryWarnings(second)], remedies,
    notes: [
      "Both horoscopes are calculated with the same Astronomy Engine, Lahiri sidereal ayanamsa, whole-sign houses and mean nodes as the main horoscope.",
      "Person 1 is used in the traditional groom column and Person 2 in the traditional bride column. Varna, Vashya and Gana can be directional; this is a table orientation, not an assessment of gender or personal worth.",
      "This is North Indian Ashtakoota, not the separate South Indian ten-Porutham system. North/South chart style changes the drawing only, not the scoring method.",
      "Regional tables and cancellation rules differ. This report names its tables, shows every calculation and preserves the raw score; notes do not add points.",
      "Mean-node positions and Mangal rules (including the 2nd-house convention) follow the existing main-horoscope engine. Match with another site only after aligning settings and birth data.",
      "The score percentage is the fraction of 36 traditional points, not a probability of a successful marriage. Astrology is not a scientific, genetic, fertility or medical compatibility test.",
      "Dasha snapshots and timing windows are calculated at the displayed calculation date. Overlapping significator periods are broad themes, not promised wedding dates.",
    ],
  };
}
