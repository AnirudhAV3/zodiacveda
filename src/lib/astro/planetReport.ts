import { BHAVAS, NAKSHATRAS, PLANET_INFO, SIGNS, type PlanetId } from "./data";
import type { ChartData, PlanetPos } from "./calc";
import { aspectedHouses, baladiAvastha, charaKarakas, dignity, functionalNature, housesOwned, KARAKA_FULL, naturalNature } from "./analysis";
import { compoundRel, computeShadbala, type ShadbalaRow } from "./shadbala";
import { IN_HOUSE, IN_SIGN } from "./texts";

export interface AspectNote {
  house: number;
  sign: number;
  drishti: string;
  planets: PlanetId[];
  effect: string;
}
export interface ReceivedNote {
  from: PlanetId;
  benefic: boolean;
  effect: string;
}
export interface PlanetReport {
  id: PlanetId;
  p: PlanetPos;
  headline: string;
  summary: string[];
  dignity: string;
  functional: { label: string; good: boolean };
  natural: string;
  karaka?: string;
  owns: number[];
  score: number; // 0-100 overall strength score
  verdict: "Very Strong" | "Strong" | "Moderate" | "Weak" | "Very Weak";
  strengths: string[];
  weaknesses: string[];
  aspectsCast: AspectNote[];
  aspectsReceived: ReceivedNote[];
  conjunctions: string[];
  shadbala?: ShadbalaRow;
  remedies: string[];
  avoid: string[];
  gemAdvice: string;
  governs: string;
}

const KEN = [1, 4, 7, 10];
const TRI = [1, 5, 9];
const DUS = [6, 8, 12];
const UPA = [3, 6, 10, 11];
const ord = (n: number) => `${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"}`;
const topics = (h: number, n = 4) => BHAVAS[h - 1].significations.split(",").slice(0, n).map((s) => s.trim().toLowerCase()).join(", ");

const ASPECT_STYLE: Record<PlanetId, (h: number) => string> = {
  Sun: (h) => `brings authority, visibility and ego into ${topics(h)}; can dry up or create pride-driven friction here, but also gives government support and leadership`,
  Moon: (h) => `nourishes and emotionally sensitises ${topics(h)}; results fluctuate with the Moon's phase and your moods, and public support comes through these areas`,
  Mars: (h) => `energises ${topics(h)} with drive and courage, but can bring conflict, haste, cuts or accidents in these matters; channel it through disciplined action`,
  Mercury: (h) => `sharpens intelligence, communication and trade in ${topics(h)}; good for analysis, documentation and negotiation in these areas`,
  Jupiter: (h) => `protects and expands ${topics(h)} — Jupiter's aspect is the greatest blessing, bringing wisdom, growth, good counsel and grace to these matters`,
  Venus: (h) => `brings harmony, beauty, comfort and pleasure to ${topics(h)}; relationships and finances linked to these areas benefit`,
  Saturn: (h) => `delays and tests ${topics(h)}, demanding patience and hard work; results come late but are durable. It may bring burden, separation or restriction here`,
  Rahu: (h) => `creates obsession, ambition and unconventional events around ${topics(h)}; sudden gains or confusion, foreign influences`,
  Ketu: (h) => `brings detachment, sudden breaks and spiritual insight in ${topics(h)}; interest here may feel unsatisfying or karmic`,
};

const DRISHTI_NAME = (id: PlanetId, n: number) => (n === 7 ? "7th (full) aspect" : `special ${ord(n)} aspect`) + (id === "Rahu" || id === "Ketu" ? " (as per Parashari school)" : "");

function isBen(c: ChartData, id: PlanetId) {
  return naturalNature(c, id) === "Benefic";
}

export function planetReport(c: ChartData, id: PlanetId, sbRows?: ShadbalaRow[]): PlanetReport {
  const p = c.planets.find((x) => x.id === id)!;
  const pi = PLANET_INFO[id];
  const sign = SIGNS[p.sign];
  const d1 = dignity(id, p.sign, p.deg, c);
  const d9 = dignity(id, p.d9, undefined, c);
  const fn = functionalNature(c, id);
  const nat = naturalNature(c, id);
  const owns = housesOwned(c, id);
  const kar = charaKarakas(c)[id];
  const rows = sbRows ?? computeShadbala(c).rows;
  const sb = rows.find((r) => r.id === id);
  const nodes = id === "Rahu" || id === "Ketu";
  const av = baladiAvastha(p);

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  let score = 50;

  // Dignity
  if (d1 === "Exalted") (strengths.push(`Exalted in ${sign.sa} — ${id} is at its peak and delivers its significations generously.`), (score += 20));
  else if (d1 === "Moolatrikona") (strengths.push(`In its Moolatrikona sign ${sign.sa} — works like an official in its own office: dependable, purposeful results.`), (score += 15));
  else if (d1 === "Own Sign") (strengths.push(`In its own sign ${sign.sa} — comfortable, self-reliant and protective of its houses.`), (score += 12));
  else if (d1 === "Great Friend's Sign") (strengths.push(`In a great friend's sign (${sign.sa}, ruled by ${sign.lord}) — well supported and cooperative.`), (score += 8));
  else if (d1 === "Friend's Sign") (strengths.push(`In a friendly sign (${sign.sa}, ruled by ${sign.lord}) — gets support from its dispositor.`), (score += 4));
  else if (d1 === "Debilitated") (weaknesses.push(`Debilitated in ${sign.sa} — ${id}'s significations struggle to manifest and may come with humiliation or delay unless cancelled (Neecha Bhanga).`), (score -= 20));
  else if (d1 === "Great Enemy's Sign") (weaknesses.push(`In a bitter enemy's sign (${sign.sa}, ruled by ${sign.lord}) — uncomfortable, results come with friction.`), (score -= 10));
  else if (d1 === "Enemy's Sign") (weaknesses.push(`In an enemy's sign (${sign.sa}, ruled by ${sign.lord}) — results are mixed and require effort.`), (score -= 6));

  if (p.sign === p.d9) (strengths.push("Vargottama (same sign in D1 and D9) — gains great stability and consistency, acting almost like an exalted planet."), (score += 10));
  if (d9 === "Exalted" || d9 === "Own Sign") (strengths.push(`${d9} in the Navamsa (${SIGNS[p.d9].sa}) — strong inner strength; results improve with age.`), (score += 6));
  if (d9 === "Debilitated") (weaknesses.push(`Debilitated in the Navamsa (${SIGNS[p.d9].sa}) — outer promise may lack inner substance; results weaken over time.`), (score -= 6));

  // House
  if (KEN.includes(p.house) && TRI.includes(p.house)) (strengths.push(`Placed in the Lagna — both a Kendra and a Trikona; ${id} strongly colours your personality and body.`), (score += 8));
  else if (KEN.includes(p.house)) (strengths.push(`In a Kendra (house ${p.house}) — an angular, powerful house where ${id} acts visibly in life.`), (score += 6));
  else if (TRI.includes(p.house)) (strengths.push(`In a Trikona (house ${p.house}) — a house of fortune; ${id} brings luck and dharma.`), (score += 6));
  if (DUS.includes(p.house)) {
    if (!nodes && ["Mars", "Saturn", "Sun"].includes(id) && p.house === 6) (strengths.push("A malefic in the 6th destroys enemies, disease and debt — an excellent placement for competition."), (score += 4));
    else (weaknesses.push(`In a Dusthana (house ${p.house} — ${BHAVAS[p.house - 1].title.toLowerCase()}) — its energy is spent on obstacles, hidden matters or losses.`), (score -= 7));
  }
  if (UPA.includes(p.house) && nat === "Malefic") (strengths.push(`A natural malefic in an Upachaya house (${p.house}) — improves steadily with age and gives fighting spirit.`), (score += 4));

  // Shadbala
  if (sb) {
    if (sb.ratio >= 1.25) (strengths.push(`High Shadbala: ${sb.rupas.toFixed(2)} Rupas vs ${sb.required} required (${(sb.ratio * 100).toFixed(0)}%) — rank #${sb.rank} of 7.`), (score += 8));
    else if (sb.ratio >= 1) (strengths.push(`Adequate Shadbala: ${sb.rupas.toFixed(2)} Rupas vs ${sb.required} required (${(sb.ratio * 100).toFixed(0)}%) — rank #${sb.rank}.`), (score += 3));
    else (weaknesses.push(`Low Shadbala: ${sb.rupas.toFixed(2)} Rupas vs ${sb.required} required (${(sb.ratio * 100).toFixed(0)}%) — rank #${sb.rank}; it struggles to fulfil its promise.`), (score -= 10));
    if (sb.dig >= 45) strengths.push(`Strong Dig Bala (${sb.dig.toFixed(1)}/60) — well placed directionally.`);
    else if (sb.dig <= 12) (weaknesses.push(`Very weak Dig Bala (${sb.dig.toFixed(1)}/60) — placed near its point of directional weakness.`), (score -= 3));
    if (sb.ishta > sb.kashta + 10) strengths.push(`Ishta Phala (${sb.ishta.toFixed(1)}) exceeds Kashta Phala (${sb.kashta.toFixed(1)}) — tends to give auspicious results in its periods.`);
    else if (sb.kashta > sb.ishta + 10) weaknesses.push(`Kashta Phala (${sb.kashta.toFixed(1)}) exceeds Ishta Phala (${sb.ishta.toFixed(1)}) — its periods may bring more struggle than comfort.`);
  }

  // Motion & combustion
  if (p.retro && !nodes) {
    strengths.push("Retrograde (Vakri) — gains Cheshta Bala; closer to Earth and brighter, acting intensely.");
    weaknesses.push("Retrograde results are internalised, repetitive or delayed — revisiting past matters.");
  }
  if (p.combust) (weaknesses.push(`Combust (too close to the Sun) — its significations are overshadowed by ego/authority matters and lose independence.`), (score -= 8));
  if (av.startsWith("Yuva")) strengths.push(`Baladi avastha: ${av} — full capacity to give results.`);
  else if (av.startsWith("Mrita")) (weaknesses.push(`Baladi avastha: ${av} — very limited capacity to give results.`), (score -= 4));

  // Functional
  if (fn.label === "Yogakaraka") (strengths.push("Yogakaraka for your Lagna — rules both a Kendra and a Trikona; its periods can bring a major rise."), (score += 8));
  else if (fn.label.startsWith("Lagna Lord")) strengths.push("Your Lagna lord — its well-being directly reflects your health, confidence and life direction.");
  else if (!fn.good) weaknesses.push(`Functional malefic for ${SIGNS[c.asc.sign].en} Lagna (rules house${owns.length > 1 ? "s" : ""} ${owns.join(" & ")}) — even if strong, it may bring the troubles of these houses.`);

  // Conjunctions
  const conj = c.planets.filter((q) => q.id !== id && q.sign === p.sign);
  const conjunctions = conj.map((q) => {
    const orb = Math.abs(q.deg - p.deg);
    const rel = !nodes && !(q.id === "Rahu" || q.id === "Ketu") ? compoundRel(c, id, q.id) : "—";
    const good = isBen(c, q.id);
    return `${q.id} (${orb.toFixed(1)}° apart${orb < 8 ? ", close" : ""}) — ${good ? "benefic" : "malefic"} influence${rel !== "—" ? `, ${rel.toLowerCase()}` : ""}. ${q.id === "Rahu" ? `Rahu amplifies and distorts ${id}'s significations.` : q.id === "Ketu" ? `Ketu detaches and spiritualises ${id}'s significations.` : good ? `${q.id} supports ${id}.` : `${q.id} pressures ${id}.`}`;
  });
  if (conj.some((q) => q.id === "Rahu" || q.id === "Ketu") && !nodes) (weaknesses.push(`Conjunct the lunar node${conj.filter((q) => q.id === "Rahu" || q.id === "Ketu").length > 1 ? "s" : ""} — ${id} is eclipsed; results can be erratic or confusing.`), (score -= 5));
  if (conj.some((q) => q.id === "Jupiter") && id !== "Jupiter") (strengths.push("Conjunct Jupiter — protected and blessed by the great benefic."), (score += 5));

  // Aspects cast
  const aspectsCast: AspectNote[] = aspectedHouses(p).map((h, i) => {
    const n = pi.aspects[i];
    const s = (c.asc.sign + h - 1) % 12;
    const pl = c.planets.filter((q) => q.house === h).map((q) => q.id);
    let effect = `${id}'s ${DRISHTI_NAME(id, n)} falls on house ${h} (${SIGNS[s].sa}, ${BHAVAS[h - 1].title.toLowerCase()}): it ${ASPECT_STYLE[id](h)}.`;
    if (pl.length) effect += ` It also aspects ${pl.join(", ")} placed there — ${pl.map((q) => `${q} (${compoundRelSafe(c, id, q)})`).join(", ")}.`;
    if (SIGNS[s].lord === id) effect += ` Since ${id} rules this house, its aspect protects and strengthens it.`;
    return { house: h, sign: s, drishti: DRISHTI_NAME(id, n), planets: pl, effect };
  });

  // Aspects received
  const aspectsReceived: ReceivedNote[] = c.planets
    .filter((q) => q.id !== id && aspectedHouses(q).includes(p.house))
    .map((q) => {
      const ben = isBen(c, q.id);
      const eff = ben ? `${q.id}'s aspect supports ${id}, softening its difficulties and improving its significations (${pi.karaka.split(",").slice(0, 3).join(",").toLowerCase()}).` : q.id === "Saturn" ? `Saturn's aspect restrains ${id}, bringing delay, seriousness and responsibility to its significations.` : q.id === "Mars" ? `Mars's aspect heats up ${id}, adding aggression, urgency or conflict to its matters.` : q.id === "Rahu" || q.id === "Ketu" ? `${q.id}'s aspect creates unusual, unexpected results for ${id}.` : `${q.id}'s aspect adds pressure and ego-related challenges to ${id}.`;
      return { from: q.id, benefic: ben, effect: eff };
    });
  const benAsp = aspectsReceived.filter((a) => a.benefic).length;
  const malAsp = aspectsReceived.length - benAsp;
  if (aspectsReceived.some((a) => a.from === "Jupiter")) (strengths.push("Aspected by Jupiter — protected by divine grace."), (score += 5));
  if (malAsp > benAsp && malAsp >= 2) (weaknesses.push(`Receives more malefic (${aspectsReceived.filter((a) => !a.benefic).map((a) => a.from).join(", ")}) than benefic aspects — afflicted.`), (score -= 5));

  score = Math.max(5, Math.min(98, Math.round(score)));
  const verdict: PlanetReport["verdict"] = score >= 78 ? "Very Strong" : score >= 62 ? "Strong" : score >= 45 ? "Moderate" : score >= 30 ? "Weak" : "Very Weak";

  if (strengths.length === 0) strengths.push("No major classical strengths; results depend on its dispositor and aspects.");
  if (weaknesses.length === 0) weaknesses.push("No significant afflictions — the planet is free to give its results.");

  // Remedies
  const remedies: string[] = [];
  const weak = verdict === "Weak" || verdict === "Very Weak";
  if (weak && fn.good) remedies.push(`Strengthen ${id}: recite "${pi.mantra}" 108 times on ${pi.day}s.`);
  else if (!fn.good) remedies.push(`Pacify ${id} (functional malefic): chant "${pi.mantra}" and donate ${pi.grain.toLowerCase()} on ${pi.day}s rather than strengthening it with a gem.`);
  else remedies.push(`Keep ${id} happy: recite "${pi.mantra}" on ${pi.day}s.`);
  remedies.push(...pi.remedies);
  remedies.push(`Worship ${pi.deity}${pi.deity.includes(pi.adhidevata.split(" ")[0]) ? "" : ` / ${pi.adhidevata}`}; wear ${pi.color2.toLowerCase()} on ${pi.day}s; face ${pi.direction} while praying.`);
  const gemAdvice = fn.good
    ? weak
      ? `${pi.gem} is recommended to strengthen this functional benefic — wear in ${pi.metal.toLowerCase()} on a ${pi.day} after proper consultation and trial.`
      : `${pi.gem} is favourable (functional benefic) but not essential since ${id} is already reasonably strong.`
    : `Avoid wearing ${pi.gem} — ${id} is a functional malefic for your Lagna; prefer mantra, charity and fasting.`;

  const karText = kar ? KARAKA_FULL[kar] : undefined;
  const governs = owns.length ? `Rules house${owns.length > 1 ? "s" : ""} ${owns.map((h) => `${h} (${BHAVAS[h - 1].title.toLowerCase()})`).join(" and ")} — these life areas depend on ${id}'s condition and its dasha periods.` : `As a shadow planet, ${id} rules no house; it gives the results of its dispositor ${sign.lord} and planets conjunct it.`;

  const summary = [
    `${id} (${pi.sa}) is in ${sign.sa} (${sign.en}) at ${Math.floor(p.deg)}°${String(Math.floor((p.deg % 1) * 60)).padStart(2, "0")}' in the ${ord(p.house)} house, in ${NAKSHATRAS[p.nak].name} nakshatra pada ${p.pada} ruled by ${NAKSHATRAS[p.nak].lord}.`,
    `In house ${p.house}: ${IN_HOUSE[id][p.house - 1]}. In ${sign.sa}: ${IN_SIGN[id][p.sign]}.`,
    `${id} signifies ${pi.karaka.toLowerCase()}. ${governs}`,
  ];

  return {
    id,
    p,
    headline: `${IN_HOUSE[id][p.house - 1]} · ${IN_SIGN[id][p.sign]}`,
    summary,
    dignity: d1,
    functional: fn,
    natural: nat,
    karaka: karText,
    owns,
    score,
    verdict,
    strengths,
    weaknesses,
    aspectsCast,
    aspectsReceived,
    conjunctions,
    shadbala: sb,
    remedies,
    avoid: pi.avoid,
    gemAdvice,
    governs,
  };
}

function compoundRelSafe(c: ChartData, a: PlanetId, b: PlanetId) {
  if (["Rahu", "Ketu"].includes(a) || ["Rahu", "Ketu"].includes(b)) return isBen(c, b) ? "benefic" : "malefic";
  return compoundRel(c, a, b).toLowerCase();
}

export function allPlanetReports(c: ChartData) {
  const rows = computeShadbala(c).rows;
  return c.planets.map((p) => planetReport(c, p.id, rows));
}
