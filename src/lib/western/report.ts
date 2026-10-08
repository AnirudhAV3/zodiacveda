import type { BirthInput } from "@/lib/astro/calc";
import {
  ASPECT_MEANING,
  BODY_META,
  HOUSE_ESSAY,
  HOUSE_TITLES,
  OUTER,
  PERSONAL,
  SIGN_ELEMENT,
  SIGN_GLYPH,
  SIGN_MODE,
  SIGN_NAMES,
  SIGN_RULER,
  WESTERN_BODIES,
  type WesternBody,
} from "./data";
import { angDist, computeWesternChart, fmt, houseOf, signOf, type WesternAspect, type WesternChart, type WesternPlanet } from "./calc";
import { DECAN_NOTE, MOON_SIGN, PLANET_SIGN, RISING_SIGN, SUN_SIGN, elementEssay, modeEssay, planetInHouse, signFlavour } from "./texts";

export interface PatternHit {
  name: string;
  present: boolean;
  detail: string;
  bodies: string[];
}

export interface HouseReport {
  house: number;
  title: string;
  cusp: string;
  sign: number;
  ruler: WesternBody;
  rulerHouse: number;
  planets: WesternBody[];
  essay: string;
  reading: string;
}

export interface TransitHit {
  transiting: WesternBody;
  natal: string;
  type: string;
  orb: number;
  note: string;
}

export interface WesternReport {
  version: string;
  kind: "western-astrology";
  calculatedAt: string;
  method: string[];
  identity: {
    name: string;
    date: string;
    time: string;
    place: string;
    sun: string;
    moon: string;
    rising: string;
    mc: string;
    isDay: boolean;
    lunarPhase: string;
    houseSystem: string;
  };
  bigThree: { title: string; placement: string; decan: string; text: string }[];
  angles: { name: string; placement: string; text: string }[];
  planets: {
    id: WesternBody;
    glyph: string;
    color: string;
    placement: string;
    house: number;
    dignity: string;
    retro: boolean;
    speed: string;
    signText: string;
    houseText: string;
    keywords: string;
  }[];
  houses: HouseReport[];
  aspects: (WesternAspect & { meaning: string })[];
  patterns: PatternHit[];
  balances: { elements: Record<string, number>; modes: Record<string, number>; elementText: string; modeText: string; dominantPlanet: string };
  fortune: { placement: string; house: number; text: string };
  lifeAreas: { title: string; text: string }[];
  transits: TransitHit[];
  progressions: { sun: string; moon: string; text: string };
  intercepted: string[];
  notes: string[];
}

function p(chart: WesternChart, id: WesternBody) {
  return chart.planets.find((x) => x.id === id)!;
}

function place(pl: { sign: number; deg: number }) {
  return `${fmt(pl.deg)} ${SIGN_NAMES[pl.sign]} ${SIGN_GLYPH[pl.sign]}`;
}

function jonesPattern(planets: WesternPlanet[]): PatternHit {
  const lons = planets.filter((x) => x.id !== "South Node").map((x) => x.lon).sort((a, b) => a - b);
  let maxGap = 0;
  for (let i = 0; i < lons.length; i++) {
    const gap = (lons[(i + 1) % lons.length] - lons[i] + 360) % 360;
    if (gap > maxGap) maxGap = gap;
  }
  const span = 360 - maxGap;
  if (span <= 120) return { name: "Bundle", present: true, detail: `All planets occupy about ${Math.round(span)}° — intense focus, specialist life.`, bodies: [] };
  if (span <= 180) return { name: "Bowl", present: true, detail: `Planets fill roughly a hemisphere (${Math.round(span)}°). One half of life is emphasised; the empty half is the invitation.`, bodies: [] };
  if (maxGap >= 60 && maxGap < 120) return { name: "Locomotive", present: true, detail: "A wide empty stretch with a leading planet that pulls the chart like an engine.", bodies: [] };
  return { name: "Splash / spread", present: true, detail: "Planets are widely distributed; interests and skills scatter unless a stellium concentrates them.", bodies: [] };
}

function detectPatterns(chart: WesternChart): PatternHit[] {
  const hits: PatternHit[] = [];
  const bodies = chart.planets.filter((x) => x.id !== "South Node");
  const bySign = new Map<number, WesternPlanet[]>();
  const byHouse = new Map<number, WesternPlanet[]>();
  for (const pl of bodies) {
    if (!bySign.has(pl.sign)) bySign.set(pl.sign, []);
    bySign.get(pl.sign)!.push(pl);
    if (!byHouse.has(pl.house)) byHouse.set(pl.house, []);
    byHouse.get(pl.house)!.push(pl);
  }
  for (const [sign, group] of bySign) {
    if (group.length >= 3) hits.push({ name: `Stellium in ${SIGN_NAMES[sign]}`, present: true, detail: `${group.length} planets in ${SIGN_NAMES[sign]} concentrate identity in that sign’s element and mode.`, bodies: group.map((g) => g.id) });
  }
  for (const [house, group] of byHouse) {
    if (group.length >= 3) hits.push({ name: `Stellium in house ${house}`, present: true, detail: `${group.length} planets in the ${HOUSE_TITLES[house - 1]}. That life area is a major stage.`, bodies: group.map((g) => g.id) });
  }

  const trines = chart.aspects.filter((a) => a.type === "Trine");
  const opps = chart.aspects.filter((a) => a.type === "Opposition");
  const squares = chart.aspects.filter((a) => a.type === "Square");
  const sextiles = chart.aspects.filter((a) => a.type === "Sextile");
  const quincs = chart.aspects.filter((a) => a.type === "Quincunx");

  const grandTrine = trines.length >= 3 && ["Fire", "Earth", "Air", "Water"].some((el) => {
    const set = new Set(bodies.filter((b) => b.element === el).map((b) => b.id));
    if (set.size < 3) return false;
    const names = [...set];
    const linked = names.filter((n) => names.some((m) => m !== n && trines.some((t) => (t.a === n && t.b === m) || (t.b === n && t.a === m))));
    if (linked.length >= 3) {
      hits.push({ name: `Grand Trine in ${el}`, present: true, detail: `A closed circuit of trines in ${el}. Talent flows; motivation must be added by squares or Saturn.`, bodies: names.slice(0, 4) });
      return true;
    }
    return false;
  });
  void grandTrine;

  for (const opp of opps) {
    const apex = bodies.filter((b) => b.id !== opp.a && b.id !== opp.b && squares.some((s) => (s.a === b.id && (s.b === opp.a || s.b === opp.b)) || (s.b === b.id && (s.a === opp.a || s.a === opp.b))));
    if (apex.length) hits.push({ name: "T-square", present: true, detail: `${opp.a} opposes ${opp.b}, both square ${apex[0].id}. The apex is the pressure valve — work it and the whole pattern moves.`, bodies: [opp.a, opp.b, apex[0].id] });
  }

  for (const q of quincs) {
    const mates = quincs.filter((o) => o !== q);
    for (const o of mates) {
      const ids = new Set([q.a, q.b, o.a, o.b]);
      if (ids.size !== 3) continue;
      const [x, y, z] = [...ids];
      const pair = [[x, y], [x, z], [y, z]];
      const hasSextile = pair.some(([a, b]) => sextiles.some((s) => (s.a === a && s.b === b) || (s.b === a && s.a === b)));
      if (hasSextile) {
        hits.push({ name: "Yod (Finger of the World)", present: true, detail: `Two quincunxes on a sextile base involving ${[...ids].join(", ")}. The apex planet must adjust; it is a vocation of awkward excellence.`, bodies: [...ids] });
        break;
      }
    }
  }

  hits.push(jonesPattern(bodies));
  if (!hits.some((h) => h.name !== "Splash / spread" && h.name !== "Bowl" && h.name !== "Bundle" && h.name !== "Locomotive") && hits.length === 1) {
    hits.unshift({ name: "No major closed pattern", present: false, detail: "No stellium, T-square, grand trine or yod was found. The chart speaks through individual aspects and house emphasis.", bodies: [] });
  }
  return hits;
}

function intercepted(cusps: number[]) {
  const signsWithCusp = new Set(cusps.map((c) => signOf(c)));
  const missing: string[] = [];
  for (let i = 0; i < 12; i++) if (!signsWithCusp.has(i)) missing.push(`${SIGN_NAMES[i]} / ${SIGN_NAMES[(i + 6) % 12]}`);
  return [...new Set(missing)];
}

function dominantPlanet(chart: WesternChart) {
  const score = new Map<WesternBody, number>();
  for (const pl of chart.planets) {
    let s = pl.dignityScore;
    if (pl.house === 1 || pl.house === 10) s += 3;
    if (pl.house === 4 || pl.house === 7) s += 2;
    s += chart.aspects.filter((a) => a.a === pl.id || a.b === pl.id).length;
    if (pl.id === SIGN_RULER[chart.asc.sign]) s += 4;
    score.set(pl.id, (score.get(pl.id) ?? 0) + s);
  }
  const ranked = [...score.entries()].sort((a, b) => b[1] - a[1]);
  return ranked[0][0];
}

function lifeAreas(chart: WesternChart): { title: string; text: string }[] {
  const inHouse = (h: number) => chart.planets.filter((p) => p.house === h && p.id !== "South Node");
  const read = (h: number) => {
    const group = inHouse(h);
    if (!group.length) return `No natal planets occupy house ${h}; the ruler ${SIGN_RULER[signOf(chart.cusps[h - 1])]} from house ${p(chart, SIGN_RULER[signOf(chart.cusps[h - 1])]).house} still speaks for this area.`;
    return group.map((g) => `${g.id} in ${SIGN_NAMES[g.sign]} (${g.dignity}${g.retro ? ", retrograde" : ""})`).join("; ") + ".";
  };
  return [
    { title: "Self & presence", text: `Rising ${place(chart.asc)}. ${RISING_SIGN[chart.asc.sign]} ${read(1)}` },
    { title: "Mind & message", text: `${p(chart, "Mercury").id} in ${place(p(chart, "Mercury"))}, house ${p(chart, "Mercury").house}. ${read(3)}` },
    { title: "Love & relating", text: `${p(chart, "Venus").id} in ${place(p(chart, "Venus"))}, house ${p(chart, "Venus").house}. 7th house: ${read(7)}` },
    { title: "Drive & conflict", text: `${p(chart, "Mars").id} in ${place(p(chart, "Mars"))}, house ${p(chart, "Mars").house}. ${read(8)}` },
    { title: "Home & roots", text: `IC ${place(chart.ic)}. ${read(4)}` },
    { title: "Vocation & public life", text: `Midheaven ${place(chart.mc)}. ${read(10)} Saturn in house ${p(chart, "Saturn").house} times the career.` },
    { title: "Money & worth", text: `${read(2)} Shared resources (8th): ${read(8)}` },
    { title: "Work & health", text: `${read(6)} Hidden restoration (12th): ${read(12)}` },
    { title: "Meaning & travel", text: `Jupiter in ${place(p(chart, "Jupiter"))}, house ${p(chart, "Jupiter").house}. ${read(9)}` },
    { title: "Friends & future", text: `${read(11)} Uranus in house ${p(chart, "Uranus").house} shocks this sector when it is time to update the tribe.` },
  ];
}

function transitsNow(natal: WesternChart, now = Date.now()): TransitHit[] {
  const date = new Date(now);
  const hits: TransitHit[] = [];
  const movers: WesternBody[] = ["Saturn", "Jupiter", "Uranus", "Neptune", "Pluto", "Mars"];
  const natalPoints: { name: string; lon: number }[] = [
    { name: "Sun", lon: p(natal, "Sun").lon },
    { name: "Moon", lon: p(natal, "Moon").lon },
    { name: "Ascendant", lon: natal.asc.lon },
    { name: "Midheaven", lon: natal.mc.lon },
    { name: "Mercury", lon: p(natal, "Mercury").lon },
    { name: "Venus", lon: p(natal, "Venus").lon },
    { name: "Mars", lon: p(natal, "Mars").lon },
  ];
  const tChart = computeWesternChart({ ...natal.input, date: date.toISOString().slice(0, 10), time: "12:00" });
  for (const m of movers) {
    const t = tChart.planets.find((x) => x.id === m)!;
    for (const n of natalPoints) {
      const d = angDist(t.lon, n.lon);
      for (const [type, exact] of [["Conjunction", 0], ["Square", 90], ["Opposition", 180], ["Trine", 120]] as const) {
        const orb = Math.abs(d - exact);
        if (orb <= 2.2) {
          hits.push({
            transiting: m,
            natal: n.name,
            type,
            orb: Number(orb.toFixed(2)),
            note: `Transiting ${m} ${type.toLowerCase()} natal ${n.name} (orb ${orb.toFixed(1)}°). ${ASPECT_MEANING[type]}`,
          });
        }
      }
    }
  }
  return hits.slice(0, 18);
}

function progressions(natal: WesternChart, now = Date.now()) {
  const birth = Date.parse(natal.utc);
  const ageYears = (now - birth) / (365.2422 * 86400000);
  const progMs = birth + ageYears * 86400000;
  const d = new Date(progMs);
  const fake: BirthInput = { ...natal.input, date: d.toISOString().slice(0, 10), time: natal.input.time };
  const prog = computeWesternChart(fake);
  const sun = p(prog, "Sun");
  const moon = p(prog, "Moon");
  return {
    sun: `${place(sun)} in house ${sun.house}`,
    moon: `${place(moon)} in house ${moon.house}`,
    text: `Secondary progressions (1 day after birth = 1 year of life). Progressed Sun is in ${SIGN_NAMES[sun.sign]} — a slow season of identity. Progressed Moon is in ${SIGN_NAMES[moon.sign]}, house ${moon.house}, a ~2.5-year emotional climate.`,
  };
}

export function buildWesternReport(input: BirthInput, now = Date.now()): WesternReport {
  const c = computeWesternChart(input);
  const sun = p(c, "Sun");
  const moon = p(c, "Moon");
  const elements: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const modes: Record<string, number> = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  for (const pl of c.planets) {
    if (pl.id === "South Node") continue;
    elements[pl.element]++;
    modes[pl.mode]++;
  }
  const el = elementEssay(elements);
  const md = modeEssay(modes);
  const houses: HouseReport[] = c.cusps.map((cusp, i) => {
    const sign = signOf(cusp);
    const ruler = SIGN_RULER[sign];
    const occupants = c.planets.filter((pl) => pl.house === i + 1 && pl.id !== "South Node");
    const reading = occupants.length
      ? occupants.map((o) => planetInHouse(o.id, i + 1)).join(" ")
      : `The house is empty of planets; ${ruler} in house ${p(c, ruler).house} rules this cusp from ${SIGN_NAMES[p(c, ruler).sign]}.`;
    return {
      house: i + 1,
      title: HOUSE_TITLES[i],
      cusp: place({ sign, deg: (cusp % 30 + 30) % 30 }),
      sign,
      ruler,
      rulerHouse: p(c, ruler).house,
      planets: occupants.map((o) => o.id),
      essay: HOUSE_ESSAY[i],
      reading,
    };
  });

  const sunDecan = DECAN_NOTE[sun.sign][sun.decan - 1];
  const moonDecan = DECAN_NOTE[moon.sign][moon.decan - 1];
  const riseDecan = DECAN_NOTE[c.asc.sign][Math.min(2, Math.floor(c.asc.deg / 10))];

  return {
    version: "1",
    kind: "western-astrology",
    calculatedAt: new Date(now).toISOString(),
    method: [
      "Tropical zodiac (seasonal, not Lahiri sidereal).",
      "Porphyry houses: ASC and MC are exact; each quadrant is trisected in ecliptic longitude. Planets occupy the house of the last cusp they have passed.",
      "Mean lunar nodes.",
      "Geocentric apparent longitudes via astronomy-engine.",
      "Major aspects with standard orbs (wider for Sun and Moon).",
      "Part of Fortune: day formula ASC + Moon − Sun; night formula ASC + Sun − Moon.",
      "Secondary progressions: 1 day = 1 year. Transits use today's planets against the natal chart.",
      "This is Western astrology and is independent of the Vedic engine on this site.",
    ],
    identity: {
      name: input.name,
      date: input.date,
      time: input.time,
      place: input.place,
      sun: place(sun),
      moon: place(moon),
      rising: place(c.asc),
      mc: place(c.mc),
      isDay: c.isDay,
      lunarPhase: `${c.lunarPhase.name} (${c.lunarPhase.angle.toFixed(1)}° from the Sun)`,
      houseSystem: c.houseSystem,
    },
    bigThree: [
      { title: "Sun — the core", placement: `${place(sun)} · house ${sun.house} · ${sun.dignity}`, decan: sunDecan, text: `${SUN_SIGN[sun.sign]} ${planetInHouse("Sun", sun.house)}` },
      { title: "Moon — the inner weather", placement: `${place(moon)} · house ${moon.house} · ${moon.dignity}`, decan: moonDecan, text: `${MOON_SIGN[moon.sign]} ${planetInHouse("Moon", moon.house)}` },
      { title: "Rising — the meeting face", placement: `${place(c.asc)} · ${signFlavour(c.asc.sign)}`, decan: riseDecan, text: RISING_SIGN[c.asc.sign] },
    ],
    angles: [
      { name: "Ascendant", placement: place(c.asc), text: RISING_SIGN[c.asc.sign] },
      { name: "Descendant", placement: place(c.dsc), text: `The 7th-house gate in ${SIGN_NAMES[c.dsc.sign]}. Partners often carry this sign’s qualities — the traits you meet, marry, or project.` },
      { name: "Midheaven", placement: place(c.mc), text: `Public roof in ${SIGN_NAMES[c.mc.sign]}. Career, reputation and the ‘visible adult’ take this sign’s style.` },
      { name: "Imum Coeli", placement: place(c.ic), text: `Private keel in ${SIGN_NAMES[c.ic.sign]}. Home, origin and the unadvertised self rest here.` },
    ],
    planets: c.planets.map((pl) => ({
      id: pl.id,
      glyph: BODY_META[pl.id].glyph,
      color: BODY_META[pl.id].color,
      placement: `${place(pl)} · house ${pl.house}`,
      house: pl.house,
      dignity: pl.dignity,
      retro: pl.retro,
      speed: `${pl.speed >= 0 ? "+" : ""}${pl.speed.toFixed(3)}°/day`,
      signText: pl.id === "North Node" || pl.id === "South Node" ? BODY_META[pl.id].meaning : PLANET_SIGN[pl.id][pl.sign],
      houseText: planetInHouse(pl.id, pl.house),
      keywords: BODY_META[pl.id].keywords,
    })),
    houses,
    aspects: c.aspects
      .sort((a, b) => a.orb - b.orb)
      .map((a) => ({ ...a, meaning: ASPECT_MEANING[a.type] })),
    patterns: detectPatterns(c),
    balances: {
      elements,
      modes,
      elementText: el.text,
      modeText: md.text,
      dominantPlanet: dominantPlanet(c),
    },
    fortune: {
      placement: `${fmt(c.partOfFortune.deg)} ${SIGN_NAMES[c.partOfFortune.sign]}`,
      house: c.partOfFortune.house,
      text: `Part of Fortune in ${SIGN_NAMES[c.partOfFortune.sign]}, house ${c.partOfFortune.house} (${c.isDay ? "day" : "night"} chart). This is a traditional happiness/flow indicator — where effort and temperament cooperate.`,
    },
    lifeAreas: lifeAreas(c),
    transits: transitsNow(c, now),
    progressions: progressions(c, now),
    intercepted: intercepted(c.cusps),
    notes: [
      "Western tropical positions will differ from the Vedic sidereal Kundli on this site by the current ayanamsa (roughly 24°).",
      "Interpretations are educational, not fate and not professional counselling.",
      "House cusps are Porphyry (quadrant trisection from the Ascendant and Midheaven).",
    ],
  };
}

export { computeWesternChart, WESTERN_BODIES };
